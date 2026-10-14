import { Bindings } from '../types/bindings';
import { AuthUser } from '../models/auth-user';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
import { formatZodError } from '../helper/utility';
import { HTTPException } from 'hono/http-exception';
import { qRCodeSchema } from '../models/qrCode';
import {
  createQRCode,
  deleteQRCode,
  getQRCodeById,
  getQRCodeCount,
  getQRCodes,
  updateQRCode,
} from '../services/qrCodes.service';

const qrCodes = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: (result, c) => {
    if (result.success === false) {
      return c.json(
        {
          message: formatZodError(result.error),
        },
        400
      );
    }
  },
});

qrCodes.openapi(
  createRoute({
    tags: ['QR Codes'],
    method: 'get',
    path: '/',
    description: 'Get all QR codes',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(qRCodeSchema),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const data = await getQRCodes(ctx.env, authUser);
    if (!data) {
      throw new HTTPException(404, { message: 'No QR found' });
    }
    return ctx.json(data, 200);
  }
);

qrCodes.openapi(
  createRoute({
    tags: ['QR Codes'],
    method: 'post',
    path: '/',
    description: 'Create a new QR code',
    request: {
      body: {
        content: {
          'application/json': {
            schema: qRCodeSchema,
          },
        },
      },
    },
    responses: {} as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const totalUsers = await getQRCodeCount(ctx.env, authUser);
    if (totalUsers >= authUser.qr_limit) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan is limited to ${authUser.qr_limit} QR code only, please upgrade`,
      });
    }
    const data = ctx.req.valid('json');
    const result = await createQRCode(ctx.env, authUser, data);
    return ctx.json(result, 200);
  }
);

qrCodes.openapi(
  createRoute({
    tags: ['QR Codes'],
    method: 'get',
    path: '/:id',
    description: 'Get QR Code by id',
    request: {},
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: qRCodeSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const id = ctx.req.param('id');
    const authUser: AuthUser = ctx.req['user'];
    const data = await getQRCodeById(ctx.env, authUser, id);
    if (!data) {
      throw new HTTPException(404, { message: `No QR found with id: ${id}` });
    }
    return ctx.json(data, 200);
  }
);

qrCodes.openapi(
  createRoute({
    tags: ['QR Codes'],
    method: 'put',
    path: '/:id',
    description: 'Update QR code by id',
    request: {
      body: {
        content: {
          'application/json': {
            schema: qRCodeSchema,
          },
        },
      },
    },
    responses: {} as any,
  }),
  async (ctx) => {
    const id = ctx.req.param('id');
    const authUser: AuthUser = ctx.req['user'];
    const data = ctx.req.valid('json');
    const result = await updateQRCode(ctx.env, authUser, id, data);
    if (!result) {
      throw new HTTPException(404, { message: `No QR found with id: ${id}` });
    }
    data.updated_at = new Date().toISOString();
    return ctx.json(data, 200);
  }
);

qrCodes.openapi(
  createRoute({
    tags: ['QR Codes'],
    method: 'delete',
    path: '/:id',
    description: 'Delete QR code by id',
    request: {
      params: z.object({
        id: z.string().min(1),
      }),
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: { message: z.string() },
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const id = ctx.req.param('id');
    const authUser: AuthUser = ctx.req['user'];
    const isDeleted = await deleteQRCode(ctx.env, authUser, [id]);
    if (!isDeleted) {
      throw new HTTPException(404, { message: `No QR found with id: ${id}` });
    }
    return ctx.json({ message: 'QR deleted successfully' }, 200);
  }
);

export { qrCodes };
