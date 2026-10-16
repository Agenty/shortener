import _ from 'lodash';
import { HTTPException } from 'hono/http-exception';
import { AuthUser } from '../models/auth-user';
import {
  Domain,
  DomainVerificationMethod,
  WhitelistedDomain,
  normalizeDomain,
} from '../models/domain';
import whitelistDomains from '../data/whitelist.json';
import { sendDomainOtpEmail } from './emailer.service';
import { isDisposableEmail } from './auth.service';

const DOMAIN_COLUMNS = `domain_id, user_id, domain, is_default, is_verified, verification_method, verified_at, created_at, updated_at`;

// Mailbox providers anyone can sign up for, they don't prove domain ownership
const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'zohomail.com',
  'yandex.com',
  'mail.com',
  'gmx.com',
];

const OTP_TTL = 60 * 10;
const OTP_RESEND_AFTER = 60;
const OTP_MAX_ATTEMPTS = 5;

type DomainOtpCache = {
  code: number;
  email: string;
  attempts: number;
  sent_at: number;
};

const otpCacheKey = (authUser: AuthUser, domainId: number) =>
  `domain-otp-${authUser.account_id}-${domainId}`;

/** `blog.example.com` is covered by a verified `example.com` */
const isCoveredBy = (hostname: string, domain: string) =>
  hostname === domain || hostname.endsWith(`.${domain}`);

export const getDomains = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  offset: number = 0,
  limit: number = 25
): Promise<Array<Domain>> => {
  const sqlQuery = env.DB.prepare(
    `
          SELECT ${DOMAIN_COLUMNS}
          FROM Domains
          WHERE account_id = ?
          ORDER BY created_at DESC
          LIMIT ?, ?`
  ).bind(authUser.account_id, offset, limit);

  const { results } = await sqlQuery.all();
  return results as unknown as Array<Domain>;
};

export const getDomainCount = async (
  env: CloudflareBindings,
  authUser: AuthUser
) => {
  const { total } = await env.DB.prepare(
    `Select count(1) as total from Domains Where account_id = ?`
  )
    .bind(authUser.account_id)
    .first();
  return Number(total);
};

export const getDomainById = async (
  env: CloudflareBindings,
  domainId: number,
  authUser: AuthUser
): Promise<Domain | null> => {
  const sqlQuery = env.DB.prepare(
    `
          SELECT ${DOMAIN_COLUMNS}
          FROM Domains
          WHERE domain_id = ? AND account_id = ?`
  ).bind(domainId, authUser.account_id);

  return await sqlQuery.first<Domain>();
};

export const createDomain = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  domain: Domain
): Promise<Domain> => {
  domain.account_id = authUser.account_id;
  domain.user_id = domain.user_id || authUser.user_id;
  domain.is_verified = false;
  domain.created_at = new Date().toISOString();

  try {
    const { meta } = await env.DB.prepare(
      `
          INSERT INTO Domains (account_id, user_id, domain, is_default, is_verified, created_at)
          VALUES (?, ?, ?, ?, 0, ?)`
    )
      .bind(
        domain.account_id,
        domain.user_id,
        domain.domain,
        domain.is_default ? 1 : 0,
        domain.created_at
      )
      .run();
    domain.domain_id = meta.last_row_id;
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new HTTPException(400, {
        message: `The domain '${domain.domain}' has already been added to your account`,
      });
    }
    throw err;
  }
  return domain;
};

export const updateDomain = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  domainId: number,
  domain: Pick<Domain, 'user_id' | 'is_default'>
): Promise<Domain | null> => {
  const { meta } = await env.DB.prepare(
    `
        UPDATE Domains
        SET user_id = COALESCE(?, user_id), is_default = ?, updated_at = ?
        WHERE domain_id = ? AND account_id = ?`
  )
    .bind(
      domain.user_id || null,
      domain.is_default ? 1 : 0,
      new Date().toISOString(),
      domainId,
      authUser.account_id
    )
    .run();

  return meta.changes ? getDomainById(env, domainId, authUser) : null;
};

export const deleteDomain = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  domainId: number
): Promise<boolean> => {
  const { meta } = await env.DB.prepare(
    `
        DELETE FROM Domains
        WHERE domain_id = ? AND account_id = ?`
  )
    .bind(domainId, authUser.account_id)
    .run();
  return meta.changes > 0;
};

export const markDomainVerified = async (
  env: CloudflareBindings,
  authUser: Pick<AuthUser, 'account_id'>,
  domainId: number,
  method: DomainVerificationMethod,
  email: string | null = null
): Promise<boolean> => {
  const now = new Date().toISOString();
  const { meta } = await env.DB.prepare(
    `
        UPDATE Domains
        SET is_verified = 1, verification_method = ?, verified_email = ?, verified_at = ?, updated_at = ?
        WHERE domain_id = ? AND account_id = ?`
  )
    .bind(method, email, now, now, domainId, authUser.account_id)
    .run();
  return meta.changes > 0;
};

/* ------------------------------ Email OTP ------------------------------ */

export const sendDomainOtp = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  domain: Domain,
  email: string
) => {
  const emailDomain = email.split('@').pop().toLowerCase();
  if (!isCoveredBy(domain.domain, emailDomain)) {
    throw new HTTPException(400, {
      message: `The email must end with @${domain.domain} to verify the ownership of ${domain.domain}`,
    });
  }
  if (
    PUBLIC_EMAIL_DOMAINS.includes(emailDomain) ||
    (await isDisposableEmail(env, email))
  ) {
    throw new HTTPException(400, {
      message: `Public or disposable email providers cannot be used for domain verification, use Google Search Console instead`,
    });
  }

  const cacheKey = otpCacheKey(authUser, domain.domain_id);
  const existing = await env.KVCACHE.get<DomainOtpCache>(cacheKey, 'json');
  if (existing && Date.now() - existing.sent_at < OTP_RESEND_AFTER * 1000) {
    throw new HTTPException(429, {
      message: `A verification code was sent recently, please wait a minute before requesting a new one`,
    });
  }

  const otp: DomainOtpCache = {
    code: _.random(100000, 999999),
    email: email.toLowerCase(),
    attempts: 0,
    sent_at: Date.now(),
  };
  await env.KVCACHE.put(cacheKey, JSON.stringify(otp), {
    expirationTtl: OTP_TTL,
  });
  await sendDomainOtpEmail(env, authUser, otp.email, domain.domain, otp.code);
};

export const verifyDomainOtp = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  domain: Domain,
  code: number
) => {
  const cacheKey = otpCacheKey(authUser, domain.domain_id);
  const otp = await env.KVCACHE.get<DomainOtpCache>(cacheKey, 'json');
  if (!otp) {
    throw new HTTPException(400, {
      message: 'Verification code expired or not requested, send a new code',
    });
  }

  if (otp.code !== code) {
    otp.attempts += 1;
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      await env.KVCACHE.delete(cacheKey);
      throw new HTTPException(400, {
        message: 'Too many invalid attempts, send a new verification code',
      });
    }
    await env.KVCACHE.put(cacheKey, JSON.stringify(otp), {
      expirationTtl: OTP_TTL,
    });
    throw new HTTPException(400, { message: 'Invalid verification code' });
  }

  await env.KVCACHE.delete(cacheKey);
  await markDomainVerified(
    env,
    authUser,
    domain.domain_id,
    DomainVerificationMethod.email,
    otp.email
  );
};

/* ------------------------- Google Search Console ------------------------ */

export const SEARCH_CONSOLE_CALLBACK = '/v1/oauth/google/search-console';

// Separate secret so the OAuth state can never be used as a login token
export const getStateSecret = (env: CloudflareBindings) =>
  `${env.JWT_SECRET}:domain-verification`;

export const getSearchConsoleConsentUri = (
  env: CloudflareBindings,
  state: string
) => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${env.API_URL}${SEARCH_CONSOLE_CALLBACK}`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    access_type: 'online',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

type SearchConsoleSite = { siteUrl: string; permissionLevel: string };

export const getSearchConsoleSites = async (
  accessToken: string
): Promise<Array<SearchConsoleSite>> => {
  const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new HTTPException(400, {
      message: `Unable to read Google Search Console properties, try again`,
    });
  }
  const data: { siteEntry?: Array<SearchConsoleSite> } = await res.json();
  return data.siteEntry || [];
};

/**
 * A domain is verified when the Google account owns (or has full access to)
 * a matching Search Console property: `sc-domain:example.com` or `https://example.com/`
 */
export const isVerifiedInSearchConsole = (
  sites: Array<SearchConsoleSite>,
  domain: string
) =>
  sites.some(({ siteUrl, permissionLevel }) => {
    if (!['siteOwner', 'siteFullUser'].includes(permissionLevel)) return false;
    if (siteUrl.startsWith('sc-domain:')) {
      return isCoveredBy(domain, siteUrl.replace('sc-domain:', '').toLowerCase());
    }
    try {
      const { hostname, pathname } = new URL(siteUrl);
      return pathname === '/' && normalizeDomain(hostname) === domain;
    } catch {
      return false;
    }
  });

/* ------------------------------ Whitelist ------------------------------ */

export const getWhitelist = async (
  env: CloudflareBindings,
  offset: number = 0,
  limit: number = 1000
): Promise<Array<WhitelistedDomain>> => {
  const { results } = await env.DB.prepare(
    `SELECT domain, created_at FROM WhitelistedDomains ORDER BY domain LIMIT ?, ?`
  )
    .bind(offset, limit)
    .all<WhitelistedDomain>();
  return results;
};

export const addWhitelist = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  domain: string
): Promise<WhitelistedDomain> => {
  const created_at = new Date().toISOString();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO WhitelistedDomains (domain, user_id, created_at) VALUES (?, ?, ?)`
  )
    .bind(domain, authUser.user_id, created_at)
    .run();
  return { domain, created_at };
};

export const deleteWhitelist = async (
  env: CloudflareBindings,
  domain: string
): Promise<boolean> => {
  const { meta } = await env.DB.prepare(
    `DELETE FROM WhitelistedDomains WHERE domain = ?`
  )
    .bind(domain)
    .run();
  return meta.changes > 0;
};

/* --------------------------- Link destinations -------------------------- */

const getWhitelistedHosts = async (
  env: CloudflareBindings,
  hostnames: Array<string>
): Promise<Array<string>> => {
  const staticHosts = hostnames.filter((h) => whitelistDomains.includes(h));
  const pending = hostnames.filter((h) => !staticHosts.includes(h));
  if (!pending.length) return staticHosts;

  const { results } = await env.DB.prepare(
    `SELECT domain FROM WhitelistedDomains WHERE domain IN (${pending
      .map(() => '?')
      .join()})`
  )
    .bind(...pending)
    .all<{ domain: string }>();
  return [...staticHosts, ...results.map((x) => x.domain)];
};

/**
 * Short links can be created only for destination URLs on a domain that is
 * verified by the account, or whitelisted by admin (e.g. linkedin.com)
 */
export const assertVerifiedDestinations = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  urls: Array<string | null | undefined>
) => {
  const hostnames = _.uniq(
    urls.filter(Boolean).map((url) => normalizeDomain(new URL(url).hostname))
  ).filter(Boolean);
  if (!hostnames.length) return;

  const whitelisted = await getWhitelistedHosts(env, hostnames);
  let pending = hostnames.filter((h) => !whitelisted.includes(h));
  if (!pending.length) return;

  const { results } = await env.DB.prepare(
    `SELECT domain FROM Domains WHERE account_id = ? AND is_verified = 1`
  )
    .bind(authUser.account_id)
    .all<{ domain: string }>();
  const verified = results.map((x) => x.domain);
  pending = pending.filter((h) => !verified.some((d) => isCoveredBy(h, d)));

  if (pending.length) {
    throw new HTTPException(403, {
      message: `Domain not verified: ${pending.join(', ')}. Add and verify the domain ownership via email OTP or Google Search Console to create short links for it`,
    });
  }
};
