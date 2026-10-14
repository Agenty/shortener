import {
  createLink,
  deleteLink,
  getLinkByKey,
  getLinkCount,
  getLinks,
  updateLink,
} from '../services/links.service';
import { Link, linkSchema } from '../models/link';
import { AuthUser } from '../models/auth-user';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { Paged, pagedSchema } from '../models/paged';
import { Bindings } from '../types/bindings';
import { formatZodError } from '../helper/utility';
import { HTTPException } from 'hono/http-exception';
import { TableResult } from '../models/table';

const links = new OpenAPIHono<{ Bindings: Bindings }>({
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

links.openapi(
  createRoute({
    tags: ['Links'],
    method: 'get',
    path: '/',
    description: 'Get all links',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(linkSchema),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const paged = new Paged(ctx.req.queries());
    const authUser: AuthUser = ctx.req['user'];
    const result = await getLinks(ctx.env, authUser, paged);
    if (!result) {
      return ctx.json({ message: `No data found` }, 404);
    }
    let total = result.length;
    if (paged.offset > 0 || total >= paged.limit) {
      total = await getLinkCount(ctx.env, authUser, true);
    }
    const table = new TableResult(
      result,
      paged.offset,
      paged.limit,
      total,
      result.length
    );
    return ctx.json(table, 200);
  }
);

links.openapi(
  createRoute({
    tags: ['Links'],
    method: 'post',
    path: '/',
    description: 'Create a new short link',
    request: {
      body: {
        content: {
          'application/json': {
            schema: linkSchema,
          },
        },
      },
    },
    responses: {} as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const link = ctx.req.valid('json');
    const totalLinks = await getLinkCount(ctx.env, authUser);
    if (totalLinks >= authUser.links_limit) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan is limited to ${authUser.links_limit} links only, please upgrade`,
      });
    }
    const result = await createLink(ctx.env, authUser, link);
    return ctx.json(result, 200);
  }
);

links.openapi(
  createRoute({
    tags: ['Links'],
    method: 'get',
    path: '/:id',
    description: 'Get link by id',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: linkSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const key = ctx.req.param('id');
    const authUser: AuthUser = ctx.req['user'];
    const data = await getLinkByKey(ctx.env, key, authUser);
    if (!data) {
      return ctx.json({ message: `No data found with given key: ${key}` }, 404);
    }
    return ctx.json(data, 200);
  }
);

links.openapi(
  createRoute({
    tags: ['Links'],
    method: 'put',
    path: '/:id',
    description: 'Update a link by id',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: linkSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: linkSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json') as Link;
    const key = ctx.req.param('id');
    const authUser: AuthUser = ctx.req['user'];
    const updateResult = await updateLink(ctx.env, authUser, key, data);
    if (!updateResult) {
      return ctx.json({ message: `No data found with given key: ${key}` }, 404);
    }
    return ctx.json(updateResult, 200);
  }
);

links.openapi(
  createRoute({
    tags: ['Links'],
    method: 'delete',
    path: '/:id',
    description: 'Delete a link by id',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.object({ message: z.string() }),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const key = ctx.req.param('id');
    const authUser: AuthUser = ctx.req['user'];
    const isDeleted = await deleteLink(ctx.env, authUser, key);
    if (!isDeleted) {
      return ctx.json({ message: `No link found with given key: ${key}` }, 404);
    }
    return ctx.json({ message: 'Link deleted successfully' }, 200);
  }
);

export { links };
