import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { Bindings } from '../types/bindings';
import { Link, linkSchema } from '../models/link';
import { createTryLink } from '../services/links.service';

const tryApi = new Hono<{ Bindings: Bindings }>();

tryApi.post(
  '/links',
  validator('json', (value, ctx) => {
    const parsed = linkSchema.safeParse(value);
    if (!parsed.success) {
      return ctx.json(parsed, 400);
    }
    return parsed.data as Link;
  }),
  async (ctx) => {
    const link = ctx.req.valid('json');
    const result = await createTryLink(ctx.env, link);
    return ctx.json(result, 200);
  }
);

export { tryApi };
