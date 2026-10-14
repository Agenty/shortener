import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import _ from 'lodash';
import { HTTPException } from 'hono/http-exception';
import { isValidUrl } from '../helper/utility';
import { extractMetadata } from '../services/meta.service';

const meta = new Hono<{ Bindings: Bindings }>();

meta.get('/', async (ctx) => {
  const url = ctx.req.query('url');
  if (!isValidUrl(url)) {
    throw new HTTPException(400, { message: 'Invalid URL' });
  }
  const json = await extractMetadata(url);
  return ctx.json(json, 200);
});

export { meta };
