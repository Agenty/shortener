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
import { createRoute, z } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
import { HTTPException } from 'hono/http-exception';
import { tableSchema, toTableResult } from '../models/table';
import { createApi, errorResponses, messageSchema } from '../helper/openapi';
import { API_SAMPLES } from '../helper/api-samples';

const links = createApi();

const keyParamSchema = z.object({
  key: z.string().max(32).openapi({
    param: { name: 'key', in: 'path' },
    example: 'summer-sale',
    description: 'Short link key (the back-half of the short URL)',
  }),
});

links.openapi(
  createRoute({
    tags: ['Links'],
    method: 'get',
    path: '/',
    summary: 'List short links',
    description:
      'Get a paginated list of short links in your account, newest first. Use `search` to find a short link by its key or long destination URL.',
    request: {
      query: pagedSchema,
    },
    responses: {
      200: {
        description: 'Paginated list of short links',
        content: {
          'application/json': {
            schema: tableSchema(linkSchema),
          },
        },
      },
      ...errorResponses(400, 401),
    } as any,
  }),
  async (ctx) => {
    const paged = ctx.req.valid('query');
    const authUser: AuthUser = ctx.req['user'];
    const result = await getLinks(ctx.env, authUser, paged);
    let total = result.length;
    if (paged.offset > 0 || total >= paged.limit) {
      total = await getLinkCount(ctx.env, authUser, true);
    }
    return ctx.json(
      toTableResult(result, paged.offset, paged.limit, total),
      200
    );
  }
);

links.openapi(
  createRoute({
    tags: ['Links'],
    method: 'post',
    path: '/',
    summary: 'Create a short link',
    description:
      'Shorten a long URL into a short link with an optional custom alias, expiration date, UTM parameters, password, social media preview, iOS/Android deep links and geo-targeting. The destination URL domain must be verified in your account or whitelisted.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: linkSchema,
            example: API_SAMPLES.links.post,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The created short link',
        content: {
          'application/json': {
            schema: linkSchema,
          },
        },
      },
      ...errorResponses(400, 401, 402, 403),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const link = ctx.req.valid('json') as Link;
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
    path: '/{key}',
    summary: 'Get a short link',
    description:
      'Retrieve a short link by its key, including the long destination URL and all link settings.',
    request: {
      params: keyParamSchema,
    },
    responses: {
      200: {
        description: 'The short link',
        content: {
          'application/json': {
            schema: linkSchema,
          },
        },
      },
      ...errorResponses(401, 404),
    } as any,
  }),
  async (ctx) => {
    const { key } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const data = await getLinkByKey(ctx.env, key, authUser);
    if (!data) {
      throw new HTTPException(404, {
        message: `No short link found with key: ${key}`,
      });
    }
    return ctx.json(data, 200);
  }
);

links.openapi(
  createRoute({
    tags: ['Links'],
    method: 'put',
    path: '/{key}',
    summary: 'Update a short link',
    description:
      'Change the destination URL or settings of an existing short link. The short URL stays the same, so printed QR codes and shared links keep working.',
    request: {
      params: keyParamSchema,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: linkSchema,
            example: API_SAMPLES.links.put,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The updated short link',
        content: {
          'application/json': {
            schema: linkSchema,
          },
        },
      },
      ...errorResponses(400, 401, 403, 404),
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json') as Link;
    const { key } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const result = await updateLink(ctx.env, authUser, key, data);
    if (!result) {
      throw new HTTPException(404, {
        message: `No short link found with key: ${key}`,
      });
    }
    return ctx.json(result, 200);
  }
);

links.openapi(
  createRoute({
    tags: ['Links'],
    method: 'delete',
    path: '/{key}',
    summary: 'Delete a short link',
    description:
      'Permanently delete a short link. Visitors opening the short URL will no longer be redirected.',
    request: {
      params: keyParamSchema,
    },
    responses: {
      200: {
        description: 'Short link deleted',
        content: {
          'application/json': {
            schema: messageSchema,
          },
        },
      },
      ...errorResponses(401, 404),
    } as any,
  }),
  async (ctx) => {
    const { key } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const isDeleted = await deleteLink(ctx.env, authUser, key);
    if (!isDeleted) {
      throw new HTTPException(404, {
        message: `No short link found with key: ${key}`,
      });
    }
    return ctx.json({ message: 'Link deleted successfully' }, 200);
  }
);

export { links };
