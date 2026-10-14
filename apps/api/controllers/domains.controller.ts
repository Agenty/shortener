import { AuthUser } from '../models/auth-user';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
import { Bindings } from '../types/bindings';
import { formatZodError } from '../helper/utility';
import {
  createDomain,
  deleteDomain,
  getDomainById,
  getDomains,
  updateDomain,
} from '../services/domain.service';
import { HTTPException } from 'hono/http-exception';
import { Domain, domainSchema } from '../models/domain';
import { PlanType } from '../models/plan';

const domains = new OpenAPIHono<{ Bindings: Bindings }>({
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

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'get',
    path: '/',
    description: 'Get all domains',
    request: {
      params: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(domainSchema),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const data = await getDomains(ctx.env, authUser);
    if (!data) {
      throw new HTTPException(404, {
        message: `No domains found`,
      });
    }
    return ctx.json(data, 200) as any;
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'post',
    path: '/',
    description: 'Create a new domain',
    request: {
      body: {
        content: {
          'application/json': {
            schema: domainSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: domainSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    if (authUser.plan == PlanType.Free) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan does not have access to this API.`,
      });
    }
    const domain = ctx.req.valid('json');
    const link = await createDomain(ctx.env, authUser, domain);
    return ctx.json(link, 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'get',
    path: '/:id',
    description: 'Get domain by id',
    request: {
      params: z.object({ id: z.number({ coerce: true }) }),
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: domainSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const id = Number(ctx.req.param('id'));
    const authUser: AuthUser = ctx.req['user'];
    const data = await getDomainById(ctx.env, id, authUser);
    if (!data) {
      throw new HTTPException(404, {
        message: `No domain found with id: ${id}`,
      });
    }
    return ctx.json(data, 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'put',
    path: '/:id',
    description: 'Update domain by id',
    request: {
      body: {
        content: {
          'application/json': {
            schema: domainSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: domainSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const domain = ctx.req.valid('json');
    const id = Number(ctx.req.param('id'));
    const authUser: AuthUser = ctx.req['user'];
    const updateResult = await updateDomain(ctx.env, authUser, id, domain);
    if (!updateResult) {
      throw new HTTPException(404, {
        message: `No domain found with id: ${id}`,
      });
    }
    return ctx.json(updateResult, 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'delete',
    path: '/:id',
    description: 'Delete domain by id',
    request: {
      params: z.object({ id: z.number({ coerce: true }) }),
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
    } as any
  }),
  async (ctx) => {
    const id = Number(ctx.req.param('id'));
    const authUser: AuthUser = ctx.req['user'];
    const isDeleted = await deleteDomain(ctx.env, authUser, id);
    if (!isDeleted) {
      throw new HTTPException(404, {
        message: `No domain found with Id: ${id}`,
      });
    }
    return ctx.json({ message: 'Domain deleted successfully' }, 200);
  }
);

export { domains };
