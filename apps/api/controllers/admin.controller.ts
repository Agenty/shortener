import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import {
  countUsers,
  getEmails,
  getAllUsers,
  bulkEmailer,
} from '../services/admin.service';
import { AuthUser, LevelType } from '../models/auth-user';
import { getLinks } from '../services/links.service';
import dayjs from 'dayjs';
import { getAnalytics } from '../services/analytics.service';
import { TableResult } from '../models/table';
import { Paged } from '../models/paged';
import { User } from '../models/user';

const admin = new Hono<{ Bindings: Bindings }>();

admin.get('/users', async (ctx) => {
  const users = await getAllUsers(ctx.env);
  if (!users) {
    return ctx.json({ message: 'No users found' }, 404);
  }
  return ctx.json(users, 200);
});

admin.get('/links/:id', async (ctx) => {
  const id = Number(ctx.req.param('id'));
  const paged = new Paged(ctx.req.queries());
  const links = await getLinks(
    ctx.env,
    {
      account_id: id,
      level: LevelType.Level1,
    },
    paged
  );
  if (!links) {
    return ctx.json({ message: 'No links found' }, 404);
  }
  return ctx.json(links, 200);
});

admin.get('/top-links', async (ctx) => {
  const offset = Number(ctx.req.query('offset')) || 0;
  let limit = Number(ctx.req.query('limit')) || 100;

  const sqlQuery = `SELECT
  format('https://idm.in/{}', blob2) as url,
  count() as clicks
    FROM IDM_ANALYTICS
    WHERE
  timestamp >= NOW() - INTERVAL '1' DAY
  GROUP BY url
  ORDER BY clicks DESC
  LIMIT ${limit}`;

  const result = await getAnalytics(ctx, sqlQuery);
  return ctx.json(new TableResult(result, offset, limit, result.length), 200);
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
      },
    ];
  }

  const mDate = message.offset
    ? dayjs().add(Number(message.offset) / 5000, 'hours')
    : dayjs();

  await bulkEmailer(ctx.env, users, message, mDate.toISOString());

  return ctx.json({
    message: `${users.length} email sent`,
  });
});

export { admin };
