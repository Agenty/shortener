import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import { AuthUser } from '../models/auth-user';
import { HTTPException } from 'hono/http-exception';
import { nanoid } from 'nanoid';
import mime from 'mime';

const files = new Hono<{ Bindings: Bindings }>();

const mimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/svg',
];

files.post('/', async (ctx) => {
  const authUser: AuthUser = ctx.req['user'];
  const formData = await ctx.req.formData();
  const file = formData.get('file') as any;
  const mimeType = mime.getType(file.name);
  if (!mimeType || !mimeTypes.includes(mimeType)) {
    throw new HTTPException(400, {
      message: 'Invalid file. Must be a image, or pdf',
    });
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const fullName = file.name;
    const ext = fullName.split('.').pop();
    const key = nanoid();
    const path = `${authUser.account_id}/${key}.${ext}`;
    await ctx.env.BUCKET.put(path, fileBuffer);
    return ctx.json({
      path: path,
      url: `https://${ctx.env.DOMAIN}/img/${path}`,
    });
  } catch (err) {
    throw new HTTPException(400, { message: err.message });
  }
});

export { files };
