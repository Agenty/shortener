import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import { validator } from 'hono/validator';
import { AuthUser } from '../models/auth-user';
import { profileSchema } from '../models/profile';
import { getProfile, updateProfile } from '../services/profile.service';
import { User } from '../models/user';

const profile = new Hono<{ Bindings: Bindings }>();

profile.get('/', async (ctx) => {
  const authUser: AuthUser = ctx.req['user'];
  const data = await getProfile(ctx, authUser);
  if (!data) {
    return ctx.json({ message: 'No data found' }, 403);
  }
  return ctx.json(data, 200);
});

profile.put(
  '/',
  validator('json', (value, c) => {
    const parsed = profileSchema.safeParse(value);
    if (!parsed.success) {
      return c.json(parsed, 403);
    }
    return parsed.data;
  }),
  async (ctx) => {
    const data = ctx.req.valid('json') as User;
    const authUser: AuthUser = ctx.req['user'];
    const result = await updateProfile(ctx, authUser, data);

    if (!result) {
      return ctx.json(
        {
          message: `No user found`,
        },
        404
      );
    }
    return ctx.json(data, 200);
  }
);

export { profile };
