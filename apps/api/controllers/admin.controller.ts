import { Hono } from 'hono';
import {
  getAllUsers,
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

const admin = new Hono<{ Bindings: CloudflareBindings }>();

admin.get('/users', async (ctx) => {
  const users = await getAllUsers(ctx.env);
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

export { admin };
