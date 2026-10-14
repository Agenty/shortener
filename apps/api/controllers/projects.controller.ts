import { AuthUser } from '../models/auth-user';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { Paged, pagedSchema } from '../models/paged';
import { Bindings } from '../types/bindings';
import { formatZodError } from '../helper/utility';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectCount,
  getProjects,
  updateProject,
} from '../services/projects.service';
import { Project, projectSchema } from '../models/project';
import { HTTPException } from 'hono/http-exception';
import { TableResult } from '../models/table';
import { PlanType } from '../models/plan';

const projects = new OpenAPIHono<{ Bindings: Bindings }>({
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

projects.openapi(
  createRoute({
    tags: ['Projects'],
    method: 'get',
    path: '/',
    description: 'Get all projects',
    request: {
      params: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(projectSchema),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const paged = new Paged(ctx.req.queries());
    const result = await getProjects(ctx.env, authUser);
    if (!result) {
      throw new HTTPException(404, {
        message: `No projects found`,
      });
    }
    let total = result.length;
    if (paged.offset > 0 || total >= paged.limit) {
      total = await getProjectCount(ctx.env, authUser);
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

projects.openapi(
  createRoute({
    tags: ['Projects'],
    method: 'post',
    path: '/',
    description: 'Create a new project',
    request: {
      body: {
        content: {
          'application/json': {
            schema: projectSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: projectSchema,
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
    const totalProjects = await getProjectCount(ctx.env, authUser);
    if (totalProjects >= authUser.projects_limit) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan is limited to ${authUser.users_limit} projects only, please upgrade`,
      });
    }
    const data = ctx.req.valid('json') as Project;
    const project = await createProject(ctx.env, authUser, data);
    return ctx.json(project, 200);
  }
);

projects.openapi(
  createRoute({
    tags: ['Projects'],
    method: 'get',
    path: '/:id',
    description: 'Get project by id',
    request: {
      params: z.object({ id: z.number({ coerce: true }) }),
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: projectSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const id = Number(ctx.req.param('id'));
    const authUser: AuthUser = ctx.req['user'];
    const data = await getProjectById(ctx.env, id, authUser);
    if (!data) {
      throw new HTTPException(404, {
        message: `No project found with Id: ${id}`,
      });
    }
    return ctx.json(data, 200);
  }
);

projects.openapi(
  createRoute({
    tags: ['Projects'],
    method: 'put',
    path: '/:id',
    description: 'Update project by id',
    request: {
      body: {
        content: {
          'application/json': {
            schema: projectSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: projectSchema,
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json') as Project;
    const id = Number(ctx.req.param('id'));
    const authUser: AuthUser = ctx.req['user'];
    const updateResult = await updateProject(ctx.env, authUser, id, data);
    if (!updateResult) {
      throw new HTTPException(404, {
        message: `No project found with Id: ${id}`,
      });
    }
    return ctx.json(updateResult, 200);
  }
);

projects.openapi(
  createRoute({
    tags: ['Projects'],
    method: 'delete',
    path: '/:id',
    description: 'Delete project by id',
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
    const isDeleted = await deleteProject(ctx.env, authUser, id);
    if (!isDeleted) {
      throw new HTTPException(404, {
        message: `No project found with Id: ${id}`,
      });
    }
    return ctx.json({ message: 'Project deleted successfully' }, 200);
  }
);

export { projects };
