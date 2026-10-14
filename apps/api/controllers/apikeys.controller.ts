import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import { AuthUser } from '../models/auth-user';
import { validator } from 'hono/validator';
import { ApiKey, apiKeySchema } from '../models/api-key';
import {
  getApiKeys,
  createApiKey,
  getApiKey,
  updateApiKey,
  deleteApiKey,
} from '../services/apikey.service';
import { HTTPException } from 'hono/http-exception';

const apiKeys = new Hono<{ Bindings: Bindings }>();

apiKeys.get('/', async (ctx, env) => {
  const authUser: AuthUser = ctx.req['user'];
  const data = await getApiKeys(ctx.env, authUser);
  if (!data) {
    return ctx.json({ message: `No keys found` }, 404);
  }
  return ctx.json(data, 200);
});

apiKeys.post(
  '/',
  validator('json', (value, c) => {
    const parsed = apiKeySchema.safeParse(value);
    if (!parsed.success) {
      return c.json(parsed, 400);
    }
    return parsed.data as ApiKey;
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    if (!authUser.api_access) {
      throw new HTTPException(402, {
        message: `Your plan doesn't have access to this API, upgrade your plan`,
      });
    }
    const data = ctx.req.valid('json') as ApiKey;
    const result = await createApiKey(ctx.env, authUser, data);
    return ctx.json(result, 200);
  }
);

apiKeys.get('/:id', async (ctx) => {
  const id = Number(ctx.req.param('id'));
  const authUser: AuthUser = ctx.req['user'];
  const data = await getApiKey(ctx.env, authUser, id);
  if (!data) {
    return ctx.json({ message: `No key found with: ${id}` }, 404);
  }
  return ctx.json(data, 200);
});

apiKeys.put(
  '/:id',
  validator('json', (value, c) => {
    const parsed = apiKeySchema.safeParse(value);
    if (!parsed.success) {
      return c.json(parsed, 400);
    }
    return parsed.data as ApiKey;
  }),
  async (ctx) => {
    const data = ctx.req.valid('json') as ApiKey;
    const id = Number(ctx.req.param('id'));
    const authUser: AuthUser = ctx.req['user'];
    const result = await updateApiKey(ctx.env, authUser, id, data);
    if (!result) {
      return ctx.json({ message: `No key found with: ${id}` }, 404);
    }
    data.updated_at = new Date();
    return ctx.json(data, 200);
  }
);

apiKeys.delete('/:id', async (ctx) => {
  const id = Number(ctx.req.param('id'));
  const authUser: AuthUser = ctx.req['user'];
  const isDeleted = await deleteApiKey(ctx.env, authUser, [id]);
  if (!isDeleted) {
    return ctx.json({ message: `No key found with: ${id}` }, 404);
  }
  return ctx.json({ message: 'Key deleted successfully' }, 200);
});

apiKeys.delete('/', async (ctx) => {
  const ids = ctx.req.queries('key_id').map(Number);
  const authUser: AuthUser = ctx.req['user'];
  const isDeleted = await deleteApiKey(ctx.env, authUser, ids);
  if (!isDeleted) {
    return ctx.json({ message: `No key found with: ${ids.join()}` }, 404);
  }
  return ctx.json({ message: 'Keys deleted successfully' }, 200);
});

export { apiKeys };
