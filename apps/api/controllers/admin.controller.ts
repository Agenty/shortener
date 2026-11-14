import { Hono } from 'hono';
import {
  getAllUsers,
  getLinkWithOwner,
  setLinkEnabled,
} from '../services/admin.service';
import { AuthUser, LevelType } from '../models/auth-user';
import { getLinks, SHORT_DOMAIN } from '../services/links.service';
import { getAnalytics } from '../services/analytics.service';
import { toTableResult } from '../models/table';
import { pagedSchema } from '../models/paged';
import { HTTPException } from 'hono/http-exception';
import { jsonValidator } from '../helper/validator';
import {
  DomainType,
  globalDomainSchema,
  normalizeDomain,
} from '../models/domain';
import {
  deleteGlobalDomain,
  getGlobalDomains,
  upsertGlobalDomain,
} from '../services/domain.service';
import {
  queueDomainBlock,
  reactivateAccount,
  scanLinks,
  suspendAccount,
  unblockLink,
} from '../services/moderation.service';

const admin = new Hono<{ Bindings: CloudflareBindings }>();

admin.get('/users', async (ctx) => {
  const { offset, limit, search } = pagedSchema.parse(ctx.req.query());
  const users = await getAllUsers(ctx.env, offset, Math.min(limit, 100), search?.trim() || undefined);
  if (!users) {
    throw new HTTPException(404, { message: 'No users found' });
  }
  return ctx.json(users, 200);
});

admin.get('/links/:id', async (ctx) => {
  const id = Number(ctx.req.param('id'));
  const paged = pagedSchema.parse(ctx.req.query());
  const links = await getLinks(
    ctx.env,
    {
      account_id: id,
      level: LevelType.Level1,
    },
    paged
  );
  if (!links) {
    throw new HTTPException(404, { message: 'No links found' });
  }
  return ctx.json(links, 200);
});

// Look up any short link by its back-half, e.g. from an abuse report
admin.get('/link/:key', async (ctx) => {
  const link = await getLinkWithOwner(ctx.env, ctx.req.param('key'));
  if (!link) {
    throw new HTTPException(404, { message: `No short link found with key: ${ctx.req.param('key')}` });
  }
  return ctx.json(link, 200);
});

// Disable a reported link, or enable it again, for every visitor
admin.put('/link/:key/status', async (ctx) => {
  const { is_enabled } = await ctx.req.json<{ is_enabled?: unknown }>();
  if (typeof is_enabled !== 'boolean') {
    throw new HTTPException(400, { message: 'is_enabled must be true or false' });
  }
  const key = ctx.req.param('key');
  if (!(await setLinkEnabled(ctx.env, key, is_enabled))) {
    throw new HTTPException(404, { message: `No short link found with key: ${key}` });
  }
  return ctx.json({ message: `${key} ${is_enabled ? 'enabled' : 'disabled'}` }, 200);
});

admin.get('/top-links', async (ctx) => {
  const offset = Number(ctx.req.query('offset')) || 0;
  let limit = Number(ctx.req.query('limit')) || 100;

  const sqlQuery = `SELECT
  format('https://${SHORT_DOMAIN}/{}', blob1) as url,
  SUM(_sample_interval) as clicks
    FROM SHORTENER_ANALYTICS
    WHERE
  timestamp >= NOW() - INTERVAL '1' DAY
  GROUP BY url
  ORDER BY clicks DESC
  LIMIT ${limit}`;

  const result = await getAnalytics(ctx.env, sqlQuery);
  return ctx.json(toTableResult(result, offset, limit), 200);
});

// Whitelisted (no ownership verification needed) or blocked domains for every account
admin.get('/domains', async (ctx) => {
  const { offset, limit } = pagedSchema.parse(ctx.req.query());
  const type = ctx.req.query('type') as DomainType | undefined;
  if (type && ![DomainType.whitelisted, DomainType.blocked].includes(type)) {
    throw new HTTPException(400, { message: `Invalid domain type: ${type}` });
  }
  const result = await getGlobalDomains(ctx.env, type, offset, limit);
  return ctx.json(toTableResult(result, offset, limit), 200);
});

admin.post('/domains', jsonValidator(globalDomainSchema), async (ctx) => {
  const authUser: AuthUser = ctx.req['user'];
  const result = await upsertGlobalDomain(ctx.env, authUser, ctx.req.valid('json'));
  // Existing links to the domain stop redirecting, their accounts are notified
  if (result.type === DomainType.blocked) {
    await queueDomainBlock(ctx.env, result.domain, `Domain blocked: ${result.domain}`);
  }
  return ctx.json(result, 200);
});

admin.delete('/domains/:domain', async (ctx) => {
  const domain = normalizeDomain(ctx.req.param('domain'));
  const isDeleted = domain && (await deleteGlobalDomain(ctx.env, domain));
  if (!isDeleted) {
    throw new HTTPException(404, {
      message: `No whitelisted or blocked domain found: ${ctx.req.param('domain')}`,
    });
  }
  return ctx.json({ message: `${domain} removed` }, 200);
});

// Check a link with Safe Browsing now, and queue a Cloudflare URL Scanner check
// (skipped when the URL was scanned in the last 30 days). Unsafe links are
// blocked and their accounts suspended
admin.post('/links/:key/scan', async (ctx) => {
  const key = ctx.req.param('key').toLowerCase();
  await scanLinks(ctx.env, [key], [key]);
  return ctx.json({ message: 'Link checked' }, 200);
});

// False positive, the link is checked again on its next click
admin.post('/links/:key/unblock', async (ctx) => {
  const key = ctx.req.param('key').toLowerCase();
  if (!(await unblockLink(ctx.env, key))) {
    throw new HTTPException(404, { message: `No blocked link found: ${key}` });
  }
  return ctx.json({ message: `${key} unblocked` }, 200);
});

admin.post('/accounts/:id/suspend', async (ctx) => {
  const id = Number(ctx.req.param('id'));
  if (!(await suspendAccount(ctx.env, id))) {
    throw new HTTPException(404, { message: `No active account found: ${id}` });
  }
  return ctx.json({ message: `Account ${id} suspended` }, 200);
});

// Restores a suspended account and unblocks its links, they're checked again
// on the next click. Remove the blocked domain too (DELETE /domains/:domain)
// so the account can create links to it again
admin.post('/accounts/:id/reactivate', async (ctx) => {
  const id = Number(ctx.req.param('id'));
  if (!(await reactivateAccount(ctx.env, id))) {
    throw new HTTPException(404, { message: `No suspended account found: ${id}` });
  }
  return ctx.json({ message: `Account ${id} reactivated` }, 200);
});

export { admin };
