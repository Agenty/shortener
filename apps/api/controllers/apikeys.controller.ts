import { createRoute, z } from '@hono/zod-openapi';
import { AuthUser } from '../models/auth-user';
import { ApiKey, apiKeySchema } from '../models/api-key';
import {
  getApiKeys,
  createApiKey,
  getApiKey,
  updateApiKey,
  deleteApiKey,
} from '../services/apikey.service';
import { HTTPException } from 'hono/http-exception';
import {
  createApi,
  errorResponses,
  idParamSchema,
  messageSchema,
} from '../helper/openapi';
import { API_SAMPLES } from '../helper/api-samples';
import { pagedSchema } from '../models/paged';
import { tableSchema } from '../models/table';

const apiKeys = createApi();

apiKeys.openapi(
  createRoute({
    tags: ['API Keys'],
    method: 'get',
    path: '/',
    summary: 'List API keys',
    description:
      'Get the API keys created by the current user. The secret key value is never returned after creation.',
    request: {
      query: pagedSchema.pick({ offset: true, limit: true }),
    },
    responses: {
      200: {
        description: 'Paginated list of API keys',
        content: {
          'application/json': {
            schema: tableSchema(apiKeySchema),
          },
        },
      },
      ...errorResponses(401),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { offset, limit } = ctx.req.valid('query');
    const data = await getApiKeys(ctx.env, authUser, offset, limit);
    return ctx.json(data, 200);
  }
);

apiKeys.openapi(
  createRoute({
    tags: ['API Keys'],
    method: 'post',
    path: '/',
    summary: 'Create an API key',
    description:
      'Generate a new API key to authenticate requests to the URL shortener API from your server or app. Copy the `key` from the response, it is shown only once.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: apiKeySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The created API key including the secret `key`',
        content: {
          'application/json': {
            schema: apiKeySchema,
          },
        },
      },
      ...errorResponses(400, 401, 402),
    } as any,
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

apiKeys.openapi(
  createRoute({
    tags: ['API Keys'],
    method: 'get',
    path: '/{id}',
    summary: 'Get an API key',
    description: 'Retrieve the name and status of an API key.',
    request: {
      params: idParamSchema,
    },
    responses: {
      200: {
        description: 'The API key (without the secret value)',
        content: {
          'application/json': {
            schema: apiKeySchema,
          },
        },
      },
      ...errorResponses(401, 404),
    } as any,
  }),
  async (ctx) => {
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const data = await getApiKey(ctx.env, authUser, id);
    if (!data) {
      throw new HTTPException(404, { message: `No API key found with id: ${id}` });
    }
    return ctx.json(data, 200);
  }
);

apiKeys.openapi(
  createRoute({
    tags: ['API Keys'],
    method: 'put',
    path: '/{id}',
    summary: 'Update an API key',
    description:
      'Rename an API key, or disable it to block requests immediately without deleting it.',
    request: {
      params: idParamSchema,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: apiKeySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The updated API key',
        content: {
          'application/json': {
            schema: apiKeySchema,
          },
        },
      },
      ...errorResponses(400, 401, 404),
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json') as ApiKey;
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const result = await updateApiKey(ctx.env, authUser, id, data);
    if (!result) {
      throw new HTTPException(404, { message: `No API key found with id: ${id}` });
    }
    return ctx.json({ ...data, key_id: id, updated_at: new Date() }, 200);
  }
);

apiKeys.openapi(
  createRoute({
    tags: ['API Keys'],
    method: 'delete',
    path: '/{id}',
    summary: 'Delete an API key',
    description:
      'Permanently revoke an API key. Requests using it are rejected with 401 Unauthorized.',
    request: {
      params: idParamSchema,
    },
    responses: {
      200: {
        description: 'API key deleted',
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
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const isDeleted = await deleteApiKey(ctx.env, authUser, [id]);
    if (!isDeleted) {
      throw new HTTPException(404, { message: `No API key found with id: ${id}` });
    }
    return ctx.json({ message: 'API key deleted successfully' }, 200);
  }
);

apiKeys.openapi(
  createRoute({
    tags: ['API Keys'],
    method: 'delete',
    path: '/',
    summary: 'Delete API keys in bulk',
    description: 'Revoke multiple API keys at once by passing `key_id` repeatedly.',
    request: {
      query: z.object({
        key_id: z
          .union([z.coerce.number().int(), z.array(z.coerce.number().int())])
          .openapi({ example: [1, 2], description: 'API key ids to delete' }),
      }),
    },
    responses: {
      200: {
        description: 'API keys deleted',
        content: {
          'application/json': {
            schema: messageSchema,
          },
        },
      },
      ...errorResponses(400, 401, 404),
    } as any,
  }),
  async (ctx) => {
    const ids = (ctx.req.queries('key_id') || []).map(Number);
    const authUser: AuthUser = ctx.req['user'];
    const isDeleted = ids.length && (await deleteApiKey(ctx.env, authUser, ids));
    if (!isDeleted) {
      throw new HTTPException(404, {
        message: `No API key found with id: ${ids.join()}`,
      });
    }
    return ctx.json({ message: 'API keys deleted successfully' }, 200);
  }
);

export { apiKeys };
