import {
  deleteUser,
  getUsers,
  createUser,
  getUserById,
  updateUser,
  getUserCount,
} from '../services/user.service';
import { User, userSchema } from '../models/user';
import { AuthUser } from '../models/auth-user';
import { createRoute, z } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
import { HTTPException } from 'hono/http-exception';
import {
  createApi,
  errorResponses,
  idParamSchema,
  messageSchema,
} from '../helper/openapi';
import { API_SAMPLES } from '../helper/api-samples';
import { tableSchema } from '../models/table';

const users = createApi();

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'get',
    path: '/',
    summary: 'List team members',
    description:
      'Get all team members who can create and manage short links in your account.',
    request: {
      query: pagedSchema.pick({ offset: true, limit: true }),
    },
    responses: {
      200: {
        description: 'Paginated list of team members',
        content: {
          'application/json': {
            schema: tableSchema(userSchema),
          },
        },
      },
      ...errorResponses(401),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { offset, limit } = ctx.req.valid('query');
    const data = await getUsers(ctx.env, authUser, offset, limit);
    return ctx.json(data, 200);
  }
);

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'post',
    path: '/',
    summary: 'Invite a team member',
    description:
      'Add a team member to your account to collaborate on short links, projects and analytics. A random password is generated and returned once.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: userSchema,
            example: API_SAMPLES.users.post,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The added team member with a generated password',
        content: {
          'application/json': {
            schema: userSchema.extend({
              password: z.string().openapi({ example: 'Xk3pQ9vLmA' }),
            }),
          },
        },
      },
      ...errorResponses(400, 401, 402),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    if (!authUser.users_limit) {
      throw new HTTPException(402, {
        message: `Your plan doesn't have access to this API, upgrade your plan`,
      });
    }
    const totalUsers = await getUserCount(ctx.env, authUser);
    if (totalUsers >= authUser.users_limit) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan is limited to ${authUser.users_limit} users only, please upgrade`,
      });
    }
    const data = ctx.req.valid('json') as User;
    const result = await createUser(ctx.env, authUser, data);
    return ctx.json(result, 200);
  }
);

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'get',
    path: '/{id}',
    summary: 'Get a team member',
    description: 'Retrieve a team member by id.',
    request: {
      params: idParamSchema,
    },
    responses: {
      200: {
        description: 'The team member',
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
      ...errorResponses(401, 404),
    } as any,
  }),
  async (ctx) => {
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const data = await getUserById(ctx.env, authUser, id);
    if (!data) {
      throw new HTTPException(404, { message: `No user found with id: ${id}` });
    }
    return ctx.json(data, 200);
  }
);

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'put',
    path: '/{id}',
    summary: 'Update a team member',
    description:
      'Change the name, email, role or status of a team member. Set `status` to `disabled` to revoke access.',
    request: {
      params: idParamSchema,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: userSchema,
            example: API_SAMPLES.users.put,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The updated team member',
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
      ...errorResponses(400, 401, 404),
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json') as User;
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const result = await updateUser(ctx.env, authUser, id, data);
    if (!result) {
      throw new HTTPException(404, { message: `No user found with id: ${id}` });
    }
    return ctx.json({ ...data, user_id: id, updated_at: new Date() }, 200);
  }
);

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'delete',
    path: '/{id}',
    summary: 'Remove a team member',
    description:
      'Remove a team member from your account. Their short links are deleted as well.',
    request: {
      params: idParamSchema,
    },
    responses: {
      200: {
        description: 'Team member removed',
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
    const isDeleted = await deleteUser(ctx.env, authUser, [id]);
    if (!isDeleted) {
      throw new HTTPException(404, { message: `No user found with id: ${id}` });
    }
    return ctx.json({ message: 'User deleted successfully' }, 200);
  }
);

// Bulk delete
users.delete('/', async (ctx) => {
  const ids = (ctx.req.queries('user_id') || []).map(Number);
  const authUser: AuthUser = ctx.req['user'];
  const isDeleted = ids.length && (await deleteUser(ctx.env, authUser, ids));
  if (!isDeleted) {
    throw new HTTPException(404, {
      message: `No user found with id: ${ids.join()}`,
    });
  }
  return ctx.json({ message: 'Users deleted successfully' }, 200);
});

export { users };
