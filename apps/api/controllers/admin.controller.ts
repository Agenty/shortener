import { Hono } from 'hono';
import {
  countUsers,
  getEmails,
  getAllUsers,
  bulkEmailer,
} from '../services/admin.service';
import { AuthUser, LevelType } from '../models/auth-user';
import { getLinks } from '../services/links.service';
import { getAnalytics } from '../services/analytics.service';
import { toTableResult } from '../models/table';
import { pagedSchema } from '../models/paged';
import { User } from '../models/user';
import { HTTPException } from 'hono/http-exception';
import { jsonValidator } from '../helper/validator';
import { normalizeDomain, whitelistSchema } from '../models/domain';
import {
  addWhitelist,
  deleteWhitelist,
  getWhitelist,
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
  format('https://idm.in/{}', blob2) as url,
  count() as clicks
    FROM SHORTENER_ANALYTICS
    WHERE
  timestamp >= NOW() - INTERVAL '1' DAY
  GROUP BY url
  ORDER BY clicks DESC
  LIMIT ${limit}`;

  const result = await getAnalytics(ctx.env, sqlQuery);
  return ctx.json(toTableResult(result, offset, limit), 200);
});

// Domains allowed for every account without ownership verification
admin.get('/whitelist', async (ctx) => {
  const { offset, limit } = pagedSchema.parse(ctx.req.query());
  const result = await getWhitelist(ctx.env, offset, limit);
  return ctx.json(toTableResult(result, offset, limit), 200);
});

admin.post('/whitelist', jsonValidator(whitelistSchema), async (ctx) => {
  const authUser: AuthUser = ctx.req['user'];
  const { domain } = ctx.req.valid('json');
  const result = await addWhitelist(ctx.env, authUser, domain);
  return ctx.json(result, 200);
});

admin.delete('/whitelist/:domain', async (ctx) => {
  const domain = normalizeDomain(ctx.req.param('domain'));
  const isDeleted = domain && (await deleteWhitelist(ctx.env, domain));
  if (!isDeleted) {
    throw new HTTPException(404, {
      message: `No whitelisted domain found: ${ctx.req.param('domain')}`,
    });
  }
  return ctx.json({ message: `${domain} removed from whitelist` }, 200);
});

admin.get('/emails', async (ctx) => {
  const total = await countUsers(ctx.env);
  return ctx.json({
    total: total,
  });
});

admin.post('/emails', async (ctx) => {
  const message = await ctx.req.json();
  const audiences = ['all', 'active'];
  let users: Array<User>;
  if (audiences.includes(message.email_to)) {
    users = await getEmails(ctx.env, message.offset);
  } else {
    users = [
      {
        name: message.from_name,
        email: message.from_email,
        guid: 'test',
      } as User,
    ];
  }

  await bulkEmailer(ctx.env, users, message);

  return ctx.json({
    message: `${users.length} email sent`,
  });
});

export { admin };
