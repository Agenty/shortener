import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { AuthUser } from '../models/auth-user';
import { profileSchema } from '../models/profile';
import { getProfile, updateProfile } from '../services/profile.service';
import { jsonValidator } from '../helper/validator';

const profile = new Hono<{ Bindings: CloudflareBindings }>();

profile.get('/', async (ctx) => {
  const authUser: AuthUser = ctx.req['user'];
  const data = await getProfile(ctx.env, authUser);
  if (!data) {
    throw new HTTPException(404, { message: 'No profile found' });
  }
  return ctx.json(data, 200);
});

profile.get('/me', async (ctx) => {
  return ctx.json(ctx.req['user'] as AuthUser, 200);
});

profile.put('/', jsonValidator(profileSchema), async (ctx) => {
  const data = ctx.req.valid('json');
  const authUser: AuthUser = ctx.req['user'];
  const result = await updateProfile(ctx.env, authUser, data);
  if (!result) {
    throw new HTTPException(404, { message: `No user found` });
  }
  return ctx.json(data, 200);
});

export { profile };
