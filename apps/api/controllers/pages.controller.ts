import { Bindings } from '../types/bindings';
import { AuthUser } from '../models/auth-user';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
import { formatZodError } from '../helper/utility';
import { HTTPException } from 'hono/http-exception';
import { pageSchema } from '../models/page';
import {
  createPage,
  deletePage,
  getPageById,
  getPageCount,
  getPages,
  updatePage,
} from '../services/pages.service';

const pages = new OpenAPIHono<{ Bindings: Bindings }>({
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

pages.openapi(
  createRoute({
    tags: ['Pages'],
    method: 'get',
    path: '/',
    description: 'Get all bio pages',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(pageSchema),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const data = await getPages(ctx.env, authUser);
    if (!data) {
      throw new HTTPException(404, { message: 'No page found' });
    }
    return ctx.json(data, 200);
  }
);

pages.openapi(
  createRoute({
    tags: ['Pages'],
    method: 'post',
    path: '/',
    description: 'Create a new bio page',
    request: {
      body: {
        content: {
          'application/json': {
            schema: pageSchema,
          },
        },
      },
    },
    responses: {} as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const pagesCount = await getPageCount(ctx.env, authUser);
    if (pagesCount >= authUser.pages_limit) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan is limited to ${authUser.pages_limit} pages only, please upgrade`,
      });
    }
    const data = ctx.req.valid('json');
    const result = await createPage(ctx.env, authUser, data);
    return ctx.json(result, 200);
  }
);

pages.openapi(
  createRoute({
    tags: ['Pages'],
    method: 'get',
    path: '/:id',
    description: 'Get page by id',
    request: {},
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: pageSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const id = ctx.req.param('id');
    const authUser: AuthUser = ctx.req['user'];
    const data = await getPageById(ctx.env, authUser, id);
    if (!data) {
      throw new HTTPException(404, { message: `No page found with id: ${id}` });
    }
    return ctx.json(data, 200);
  }
);

pages.openapi(
  createRoute({
    tags: ['Pages'],
    method: 'put',
    path: '/:id',
    description: 'Update page by id',
    request: {
      body: {
        content: {
          'application/json': {
            schema: pageSchema,
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
    const result = await updatePage(ctx.env, authUser, id, data);
    if (!result) {
      throw new HTTPException(404, { message: `No QR found with id: ${id}` });
    }
    data.updated_at = new Date().toISOString();
    return ctx.json(data, 200);
  }
);

pages.openapi(
  createRoute({
    tags: ['Pages'],
    method: 'delete',
    path: '/:id',
    description: 'Delete page by id',
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
    const isDeleted = await deletePage(ctx.env, authUser, [id]);
    if (!isDeleted) {
      throw new HTTPException(404, { message: `No page found with id: ${id}` });
    }
    return ctx.json({ message: 'Page deleted successfully' }, 200);
  }
);

export { pages };
