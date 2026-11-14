import _ from 'lodash';
import { getDomain } from 'tldts';
import { subDays } from 'date-fns';
import { waitUntil } from 'cloudflare:workers';
import { Link } from '../models/link';
import { RoleType, UserStatus } from '../models/auth-user';
import { DomainType, isBlockedHost, isWhitelistedHost, parseHost } from '../models/domain';
import { convertToLink, getDestinations } from './links.service';
import { findThreats, isSafeBrowsingEnabled, THREAT_LABELS } from './safebrowsing.service';
import { sendLinksBlockedEmail, supportEmail } from './emailer.service';
import { BlockedLinkItem } from '../emails/links-blocked-email';
import { defang } from '../helper/utility';

/**
 * Abuse protection: every short link is checked with Google Safe Browsing in
 * the queue after it's created or updated, and again from the redirect handler
 * when the last check is older than `RESCAN_AFTER_DAYS`. When a destination is
 * unsafe, the link and its domain are blocked, every other link to that domain
 * is blocked too, and the accounts owning them are suspended and emailed
 */

export type QueueMessage =
  | { type: 'scan-links'; keys: Array<string> }
  | {
      type: 'block-domain';
      domain: string;
      reason: string;
      /** Suspend the accounts with links to the domain, not for admin blocks */
      suspend: boolean;
      /** Cursor, links are processed in pages ordered by key */
      after?: string;
    };

/** Links are checked again on redirect when the last check is older than this */
export const RESCAN_AFTER_DAYS = 3;

/** D1 allows 100 bound parameters per query */
const MAX_PARAMS = 90;

/** Links processed per block-domain message */
const BLOCK_PAGE_SIZE = 200;

const SCAN_COLUMNS = `key, account_id, user_id, url, ios, android, geo, blocked_at`;

type ScanLink = Pick<Link, 'key' | 'account_id' | 'user_id' | 'url' | 'ios' | 'android' | 'geo' | 'short_url'>;

type BlockedLink = ScanLink & { reason: string };

/* -------------------------------- Producers ------------------------------- */

/** Queues a Safe Browsing check of new or updated links */
export const queueLinkScan = (env: CloudflareBindings, keys: Array<string>) => {
  if (!isSafeBrowsingEnabled(env) || !keys.length) return;
  waitUntil(
    env.QUEUE.send({ type: 'scan-links', keys } satisfies QueueMessage).catch(
      (err) => console.error('Unable to queue link scan', err)
    )
  );
};

/** Queues blocking every link to a domain, e.g. blocked by admin */
export const queueDomainBlock = (
  env: CloudflareBindings,
  domain: string,
  reason: string,
  suspend = false
) =>
  env.QUEUE.send({
    type: 'block-domain',
    domain,
    reason,
    suspend,
  } satisfies QueueMessage);

// Keys queued by this isolate recently, saves a D1 write on every click
// while a stale link is still cached in KV
const recentlyQueued = new Set<string>();

/**
 * Called on redirect, queues a check when the link was never checked or the
 * last check is older than `RESCAN_AFTER_DAYS`. `checked_at` is claimed with a
 * conditional update so concurrent clicks queue a single check
 */
export const rescanIfStale = async (
  env: CloudflareBindings,
  link: Link & { checked_at?: string | null }
) => {
  if (!isSafeBrowsingEnabled(env) || recentlyQueued.has(link.key)) return;

  const staleBefore = subDays(new Date(), RESCAN_AFTER_DAYS).toISOString();
  if (link.checked_at && link.checked_at > staleBefore) return;

  if (recentlyQueued.size > 10000) recentlyQueued.clear();
  recentlyQueued.add(link.key);

  const { meta } = await env.DB.prepare(
    `UPDATE Links SET checked_at = ?
     WHERE key = ? AND blocked_at IS NULL AND (checked_at IS NULL OR checked_at <= ?)`
  )
    .bind(new Date().toISOString(), link.key, staleBefore)
    .run();
  if (meta.changes > 0) {
    await env.QUEUE.send({ type: 'scan-links', keys: [link.key] } satisfies QueueMessage);
  }
};

/* -------------------------------- Consumer -------------------------------- */

export const processQueue = async (
  batch: MessageBatch<QueueMessage>,
  env: CloudflareBindings
) => {
  // Every link in the batch is checked with a single Safe Browsing request
  const scans = batch.messages.filter((m) => m.body?.type === 'scan-links');
  if (scans.length) {
    try {
      const keys = _.uniq(
        scans.flatMap((m) => (m.body as Extract<QueueMessage, { type: 'scan-links' }>).keys)
      );
      await scanLinks(env, keys);
      scans.forEach((m) => m.ack());
    } catch (err) {
      console.error('Link scan failed', err);
      scans.forEach((m) => m.retry());
    }
  }

  for (const message of batch.messages) {
    const body = message.body;
    if (body?.type === 'scan-links') continue;
    try {
      if (body?.type === 'block-domain') {
        await blockDomainLinks(env, body);
      } else {
        console.warn('Unknown queue message', body);
      }
      message.ack();
    } catch (err) {
      console.error(`Queue message ${body?.type} failed`, err);
      message.retry();
    }
  }
};

/** Checks links with Safe Browsing, blocks the unsafe ones with their domains */
export const scanLinks = async (env: CloudflareBindings, keys: Array<string>) => {
  const links: Array<ScanLink> = [];
  for (const chunk of _.chunk(keys, MAX_PARAMS)) {
    const { results } = await env.DB.prepare(
      `SELECT ${SCAN_COLUMNS} FROM Links
       WHERE key IN (${chunk.map(() => '?').join()}) AND blocked_at IS NULL`
    )
      .bind(...chunk)
      .all();
    links.push(...results.map(convertToLink));
  }
  if (!links.length) return;

  const threats = await findThreats(
    env,
    links.flatMap((link) => getDestinations(link).filter(Boolean))
  );

  const now = new Date().toISOString();
  await env.DB.batch(
    _.chunk(links.map((l) => l.key), MAX_PARAMS).map((chunk) =>
      env.DB.prepare(
        `UPDATE Links SET checked_at = ? WHERE key IN (${chunk.map(() => '?').join()})`
      ).bind(now, ...chunk)
    )
  );
  if (!threats.size) return;

  const unsafe: Array<BlockedLink> = [];
  for (const link of links) {
    const url = getDestinations(link).find((u) => u && threats.has(u));
    if (url) {
      const label = THREAT_LABELS[threats.get(url)] || threats.get(url);
      unsafe.push({ ...link, reason: `Unsafe destination (${label}): ${url}` });
    }
  }
  await blockLinks(env, unsafe, true);

  // Block the domains for every account, and every other link pointing to them
  for (const [url, threatType] of threats) {
    const domain = await blockDomainOf(env, url);
    if (domain) {
      await queueDomainBlock(
        env,
        domain,
        `Domain blocked (${THREAT_LABELS[threatType] || threatType}): ${domain}`,
        true
      );
    }
  }
};

/**
 * Adds the domain of an unsafe URL to the global blocklist, unless it's
 * whitelisted (e.g. a phishing page on docs.google.com) or already blocked.
 * Private suffixes are kept, so `evil.github.io` blocks that site only.
 * Returns the domain when it was newly blocked
 */
const blockDomainOf = async (
  env: CloudflareBindings,
  url: string
): Promise<string | undefined> => {
  const host = parseHost(url);
  if (!host || isBlockedHost(host) || isWhitelistedHost(host)) return;

  const domain = getDomain(host.hostname, { allowPrivateDomains: true }) || host.domain;
  const candidates = _.uniq([...host.candidates, domain]);
  const existing = await env.DB.prepare(
    `SELECT domain FROM Domains WHERE account_id IS NULL
     AND domain IN (${candidates.map(() => '?').join()})`
  )
    .bind(...candidates)
    .first();
  if (existing) return;

  const { meta } = await env.DB.prepare(
    `INSERT INTO Domains (account_id, user_id, domain, type, created_at)
     VALUES (NULL, NULL, ?, '${DomainType.blocked}', ?)
     ON CONFLICT(domain) WHERE account_id IS NULL DO NOTHING`
  )
    .bind(domain, new Date().toISOString())
    .run();
  return meta.changes > 0 ? domain : undefined;
};

/** Blocks the links to a blocked domain and its subdomains, a page per message */
const blockDomainLinks = async (
  env: CloudflareBindings,
  message: Extract<QueueMessage, { type: 'block-domain' }>
) => {
  const { domain, reason, suspend, after } = message;
  const pattern = `%${domain}%`;
  const { results } = await env.DB.prepare(
    `SELECT ${SCAN_COLUMNS} FROM Links
     WHERE key > ? AND blocked_at IS NULL
     AND (url LIKE ?2 OR ios LIKE ?2 OR android LIKE ?2 OR geo LIKE ?2)
     ORDER BY key LIMIT ?`
  )
    .bind(after || '', pattern, BLOCK_PAGE_SIZE)
    .all();

  // LIKE is a rough filter, e.g. `example.com` also matches `notexample.com`
  const links = results
    .map(convertToLink)
    .filter((link) =>
      getDestinations(link).some((url) => url && parseHost(url)?.candidates.includes(domain))
    );
  await blockLinks(env, links.map((link) => ({ ...link, reason })), suspend);

  if (results.length === BLOCK_PAGE_SIZE) {
    await env.QUEUE.send({
      ...message,
      after: (results[results.length - 1] as { key: string }).key,
    } satisfies QueueMessage);
  }
};

/* ----------------------------- Block & suspend ---------------------------- */

/**
 * Stops the links from redirecting and notifies the account owners and admins.
 * With `suspend`, the accounts are suspended in the same transaction, so they
 * can't sign in, create more links, or delete the account and its evidence
 */
export const blockLinks = async (
  env: CloudflareBindings,
  links: Array<BlockedLink>,
  suspend: boolean
) => {
  if (!links.length) return;
  const now = new Date().toISOString();
  const accountIds = _.uniq(links.map((l) => l.account_id));

  const results = await env.DB.batch([
    ...links.map((link) =>
      env.DB.prepare(
        `UPDATE Links SET blocked_at = ?, blocked_reason = ? WHERE key = ? AND blocked_at IS NULL`
      ).bind(now, link.reason, link.key)
    ),
    ...(suspend ? accountIds.map((id) => suspendStatement(env, id)) : []),
  ]);
  const newlySuspended = suspend
    ? accountIds.filter((_id, i) => results[links.length + i].meta.changes > 0)
    : [];

  // Redirects read links from KV first, cached for a minute at most
  await Promise.all(links.map((link) => env.LINKS.delete(link.key)));

  for (const [accountId, accountLinks] of Object.entries(_.groupBy(links, 'account_id'))) {
    const suspended = newlySuspended.includes(Number(accountId));
    // An account suspended earlier was already told, skip more emails for it
    if (suspend && !suspended) continue;
    await notifyAccount(env, Number(accountId), accountLinks, suspended);
  }

  await supportEmail(env, suspend ? 'Unsafe links blocked' : 'Links blocked', {
    links: links.length,
    accounts: accountIds.join(', '),
    suspended: newlySuspended.join(', ') || 'none',
    reason: defang(links[0].reason),
    examples: links
      .slice(0, 5)
      .map((l) => `${defang(l.short_url)} -> ${defang(l.url)}`)
      .join('\n'),
  }).catch((err) => console.error('Unable to email support', err));
};

/**
 * Suspended users can't sign in or use API keys. Users disabled by the account
 * owner stay disabled after reactivation. `Accounts.status` isn't used, it's
 * the billing status and updated by payment webhooks
 */
const suspendStatement = (env: CloudflareBindings, accountId: number) =>
  env.DB.prepare(
    `UPDATE Users SET status = ?, updated_at = ? WHERE account_id = ? AND status = ?`
  ).bind(UserStatus.suspended, new Date().toISOString(), accountId, UserStatus.active);

/** Returns true when the account had active users and is suspended now */
export const suspendAccount = async (env: CloudflareBindings, accountId: number) => {
  const { meta } = await suspendStatement(env, accountId).run();
  return meta.changes > 0;
};

/**
 * Restores a suspended account and unblocks its links. The links are checked
 * again on their next click, so remove the blocked domain first
 */
export const reactivateAccount = async (env: CloudflareBindings, accountId: number) => {
  const [users] = await env.DB.batch([
    env.DB.prepare(
      `UPDATE Users SET status = ?, updated_at = ? WHERE account_id = ? AND status = ?`
    ).bind(UserStatus.active, new Date().toISOString(), accountId, UserStatus.suspended),
    env.DB.prepare(
      `UPDATE Links SET blocked_at = NULL, blocked_reason = NULL, checked_at = NULL
       WHERE account_id = ? AND blocked_at IS NOT NULL`
    ).bind(accountId),
  ]);
  return users.meta.changes > 0;
};

/** Unblocks a single link, it's checked again on the next click */
export const unblockLink = async (env: CloudflareBindings, key: string) => {
  const { meta } = await env.DB.prepare(
    `UPDATE Links SET blocked_at = NULL, blocked_reason = NULL, checked_at = NULL
     WHERE key = ? AND blocked_at IS NOT NULL`
  )
    .bind(key)
    .run();
  await env.LINKS.delete(key);
  return meta.changes > 0;
};

/** Emails the account owners and admins, and the members who created the links */
const notifyAccount = async (
  env: CloudflareBindings,
  accountId: number,
  links: Array<BlockedLink>,
  suspended: boolean
) => {
  const creators = _.uniq(links.map((l) => l.user_id)).slice(0, MAX_PARAMS - 3);
  const { results: users } = await env.DB.prepare(
    `SELECT name, email FROM Users
     WHERE account_id = ? AND is_verified = 1
     AND (role IN (?, ?) OR user_id IN (${creators.map(() => '?').join() || 'NULL'}))`
  )
    .bind(accountId, RoleType.Owner, RoleType.Admin, ...creators)
    .all<{ name: string; email: string }>();

  const items: Array<BlockedLinkItem> = links.map((l) => ({
    short_url: l.short_url,
    url: l.url,
    reason: l.reason,
  }));
  for (const user of users) {
    await sendLinksBlockedEmail(env, user, items, suspended).catch((err) =>
      console.error(`Unable to email ${user.email} about blocked links`, err)
    );
  }
};
