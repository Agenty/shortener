import { Bindings } from '../types/bindings';
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
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
import { formatZodError } from '../helper/utility';
import { HTTPException } from 'hono/http-exception';

const users = new OpenAPIHono<{ Bindings: Bindings }>({
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

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'get',
    path: '/',
    description: 'Get all users',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(userSchema),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const data = await getUsers(ctx.env, authUser);
    if (!data) {
      return ctx.json({ message: `No users found` }, 404);
    }
    return ctx.json(data, 200);
  }
);

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'post',
    path: '/',
    description: 'Add a new user',
    request: {
      body: {
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
    },
    responses: {} as any,
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
    const data = ctx.req.valid('json') as unknown as User;
    const result = await createUser(ctx.env, authUser, data);
    return ctx.json(result, 200);
  }
);

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'get',
    path: '/:id',
    description: 'Get user by id',
    request: {},
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const id = Number(ctx.req.param('id'));
    const authUser: AuthUser = ctx.req['user'];
    const data = await getUserById(ctx.env, authUser, id);
    if (!data) {
      return ctx.json({ message: `No user found with: ${id}` }, 404);
    }
    return ctx.json(data, 200);
  }
);

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'put',
    path: '/:id',
    description: 'Update user by id',
    request: {
      body: {
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
    },
    responses: {} as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json') as unknown as User;
    const id = Number(ctx.req.param('id'));
    const authUser: AuthUser = ctx.req['user'];
    const result = await updateUser(ctx.env, authUser, id, data);
    if (!result) {
      return ctx.json({ message: `No user found with: ${id}` }, 404);
    }
    data.updated_at = new Date();
    return ctx.json(data, 200);
  }
);

users.openapi(
  createRoute({
    tags: ['Users'],
    method: 'delete',
    path: '/:id',
    description: 'Delete user by id',
    request: {},
    responses: {} as any,
  }),
  async (ctx) => {
    const id = Number(ctx.req.param('id'));
    const authUser: AuthUser = ctx.req['user'];
    const isDeleted = await deleteUser(ctx.env, authUser, [id]);
    if (!isDeleted) {
      return ctx.json({ message: `No user found with: ${id}` }, 404);
    }
    return ctx.json({ message: 'User deleted successfully' }, 200);
  }
);

// Bulk delete
users.delete('/', async (ctx) => {
  const ids = ctx.req.queries('user_id').map(Number);
  const authUser: AuthUser = ctx.req['user'];
  const isDeleted = await deleteUser(ctx.env, authUser, ids);
  if (!isDeleted) {
    return ctx.json({ message: `No user found with: ${ids.join()}` }, 404);
  }
  return ctx.json({ message: 'User deleted successfully' }, 200);
});

export { users };
