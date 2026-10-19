import { AuthUser } from '../models/auth-user';
import { createRoute } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
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
import { tableSchema, toTableResult } from '../models/table';
import { PlanType } from '../models/plan';
import {
  createApi,
  errorResponses,
  idParamSchema,
  messageSchema,
} from '../helper/openapi';
import { API_SAMPLES } from '../helper/api-samples';

const projects = createApi();

projects.openapi(
  createRoute({
    tags: ['Projects'],
    method: 'get',
    path: '/',
    summary: 'List projects',
    description:
      'Get all projects in your account with the number of short links in each project.',
    request: {
      query: pagedSchema.pick({ offset: true, limit: true }),
    },
    responses: {
      200: {
        description: 'Paginated list of projects',
        content: {
          'application/json': {
            schema: tableSchema(projectSchema),
          },
        },
      },
      ...errorResponses(401),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { offset, limit } = ctx.req.valid('query');
    const result = await getProjects(ctx.env, authUser, offset, limit);
    let total = result.length;
    if (offset > 0 || total >= limit) {
      total = await getProjectCount(ctx.env, authUser);
    }
    return ctx.json(toTableResult(result, offset, limit, total), 200);
  }
);

projects.openapi(
  createRoute({
    tags: ['Projects'],
    method: 'post',
    path: '/',
    summary: 'Create a project',
    description:
      'Create a project to group short links by marketing campaign, client or brand, and filter click analytics by project. Available on paid plans.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: projectSchema,
            example: API_SAMPLES.projects.post,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The created project',
        content: {
          'application/json': {
            schema: projectSchema,
          },
        },
      },
      ...errorResponses(400, 401, 402),
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
        message: `The ${authUser.plan} plan is limited to ${authUser.projects_limit} projects only, please upgrade`,
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
    path: '/{id}',
    summary: 'Get a project',
    description: 'Retrieve a project by id.',
    request: {
      params: idParamSchema,
    },
    responses: {
      200: {
        description: 'The project',
        content: {
          'application/json': {
            schema: projectSchema,
          },
        },
      },
      ...errorResponses(401, 404),
    } as any,
  }),
  async (ctx) => {
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const data = await getProjectById(ctx.env, id, authUser);
    if (!data) {
      throw new HTTPException(404, {
        message: `No project found with id: ${id}`,
      });
    }
    return ctx.json(data, 200);
  }
);

projects.openapi(
  createRoute({
    tags: ['Projects'],
    method: 'put',
    path: '/{id}',
    summary: 'Update a project',
    description: 'Rename a project or change its color and icon.',
    request: {
      params: idParamSchema,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: projectSchema,
            example: API_SAMPLES.projects.put,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The updated project',
        content: {
          'application/json': {
            schema: projectSchema,
          },
        },
      },
      ...errorResponses(400, 401, 404),
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json') as Project;
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const result = await updateProject(ctx.env, authUser, id, data);
    if (!result) {
      throw new HTTPException(404, {
        message: `No project found with id: ${id}`,
      });
    }
    return ctx.json(result, 200);
  }
);

projects.openapi(
  createRoute({
    tags: ['Projects'],
    method: 'delete',
    path: '/{id}',
    summary: 'Delete a project',
    description:
      'Permanently delete a project along with all the short links in it.',
    request: {
      params: idParamSchema,
    },
    responses: {
      200: {
        description: 'Project deleted',
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
    const isDeleted = await deleteProject(ctx.env, authUser, id);
    if (!isDeleted) {
      throw new HTTPException(404, {
        message: `No project found with id: ${id}`,
      });
    }
    return ctx.json({ message: 'Project deleted successfully' }, 200);
  }
);

export { projects };
