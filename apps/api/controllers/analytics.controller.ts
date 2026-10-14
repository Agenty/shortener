import { Bindings } from '../types/bindings';
import { getAnalytics } from '../services/analytics.service';
import { AuthUser } from '../models/auth-user';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { PagedAnalytics, pagedSchema } from '../models/paged';
import { formatZodError } from '../helper/utility';
import { HTTPException } from 'hono/http-exception';

const analytics = new OpenAPIHono<{ Bindings: Bindings }>({
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

const queryBuilder = (authUser: AuthUser, filter: PagedAnalytics) => {
  const days = filter.interval && filter.interval <= 90 ? filter.interval : 7;
  if (days > authUser.analytics_limit) {
    throw new HTTPException(402, {
      message: `The ${authUser.plan} plan is limited to view ${authUser.analytics_limit} days reports only`,
    });
  }
  const intervalClause = `timestamp >= NOW() - INTERVAL '${days}' DAY`;
  let whereClause = `blob1 = '${authUser.account_id}' AND ${intervalClause}`;
  if (filter.url && filter.url.length) {
    const path = filter.url.split('/').pop();
    whereClause += ` AND blob2 = '${path}'`;
  }
  if (filter.project_id) {
    whereClause += ` AND blob11 = '${filter.project_id}'`;
  }
  return whereClause;
};

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/',
    description: 'Get clicks report by date',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                date: z.date(),
                clicks: z.number(),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { url, interval, project_id } = ctx.req.query();
    const sqlQuery = `SELECT
    formatDateTime(toStartOfInterval(timestamp, INTERVAL '1' DAY), '%Y-%m-%d') AS date,
    COUNT() as clicks
  FROM IDM_ANALYTICS
  WHERE
  ${queryBuilder(authUser, {
    url,
    interval: Number(interval),
    project_id: Number(project_id),
  })}
  GROUP BY date
  ORDER BY date`;

    const result = await getAnalytics(ctx, sqlQuery);
    return ctx.json(result, 200, {
      'Cache-Control': 'public, max-age=90',
    });
  }
);

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/top',
    description: 'Get top links report',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                url: z.string(),
                clicks: z.number(),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { url, interval, project_id } = ctx.req.query();

    const sqlQuery = `SELECT
    format('https://idm.in/{}', blob2) as url,
    COUNT() as clicks
  FROM IDM_ANALYTICS
  WHERE
  ${queryBuilder(authUser, {
    url,
    interval: Number(interval),
    project_id: Number(project_id),
  })}
  GROUP BY url
  ORDER BY clicks DESC
  LIMIT 10`;

    const result = await getAnalytics(ctx, sqlQuery);
    return ctx.json(result, 200, {
      'Cache-Control': 'public, max-age=90',
    });
  }
);

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/referer',
    description: 'Get clicks report by referer',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                referer: z.string(),
                clicks: z.number(),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { url, interval, project_id } = ctx.req.query();

    const sqlQuery = `SELECT
    if(blob6 = 'null', '(direct)', blob6) as referer,
    COUNT() as clicks
  FROM IDM_ANALYTICS
  WHERE
  ${queryBuilder(authUser, {
    url,
    interval: Number(interval),
    project_id: Number(project_id),
  })}
  GROUP BY referer
  ORDER BY clicks DESC
  LIMIT 10`;

    const result = await getAnalytics(ctx, sqlQuery);
    return ctx.json(result, 200, {
      'Cache-Control': 'public, max-age=90',
    });
  }
);

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/country',
    description: 'Get clicks report by country',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                country: z.string(),
                clicks: z.number(),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { url, interval, project_id } = ctx.req.query();

    const sqlQuery = `SELECT
    blob3 as country,
    COUNT() as clicks
  FROM IDM_ANALYTICS
  WHERE
  ${queryBuilder(authUser, {
    url,
    interval: Number(interval),
    project_id: Number(project_id),
  })}
  GROUP BY country
  ORDER BY clicks DESC
  LIMIT 10`;

    const result = await getAnalytics(ctx, sqlQuery);
    return ctx.json(result, 200, {
      'Cache-Control': 'public, max-age=90',
    });
  }
);

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/city',
    description: 'Get clicks report by city',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                city: z.string(),
                clicks: z.number(),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { url, interval, project_id } = ctx.req.query();

    const sqlQuery = `SELECT
    blob4 as city,
    COUNT() as clicks
  FROM IDM_ANALYTICS
  WHERE
  ${queryBuilder(authUser, {
    url,
    interval: Number(interval),
    project_id: Number(project_id),
  })}
  GROUP BY city
  ORDER BY clicks DESC
  LIMIT 10`;

    const result = await getAnalytics(ctx, sqlQuery);
    return ctx.json(result, 200, {
      'Cache-Control': 'public, max-age=90',
    });
  }
);

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/browser',
    description: 'Get clicks report by browser',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                browser: z.string(),
                clicks: z.number(),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { url, interval, project_id } = ctx.req.query();

    const sqlQuery = `SELECT
    blob7 as browser,
    COUNT() as clicks
  FROM IDM_ANALYTICS
  WHERE
  ${queryBuilder(authUser, {
    url,
    interval: Number(interval),
    project_id: Number(project_id),
  })}
  GROUP BY browser
  ORDER BY clicks DESC
  LIMIT 10`;

    const result = await getAnalytics(ctx, sqlQuery);
    return ctx.json(result, 200, {
      'Cache-Control': 'public, max-age=90',
    });
  }
);

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/os',
    description: 'Get clicks report by OS',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                os: z.string(),
                clicks: z.number(),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { url, interval, project_id } = ctx.req.query();

    const sqlQuery = `SELECT
    blob8 as os,
    COUNT() as clicks
  FROM IDM_ANALYTICS
  WHERE
  ${queryBuilder(authUser, {
    url,
    interval: Number(interval),
    project_id: Number(project_id),
  })}
  GROUP BY os
  ORDER BY clicks DESC
  LIMIT 10`;

    const result = await getAnalytics(ctx, sqlQuery);
    return ctx.json(result, 200, {
      'Cache-Control': 'public, max-age=90',
    });
  }
);

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/device',
    description: 'Get clicks report by device',
    request: {
      query: pagedSchema,
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                device: z.string(),
                clicks: z.number(),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { url, interval, project_id } = ctx.req.query();

    const sqlQuery = `SELECT
    blob9 as device,
    COUNT() as clicks
  FROM IDM_ANALYTICS
  WHERE
  ${queryBuilder(authUser, {
    url,
    interval: Number(interval),
    project_id: Number(project_id),
  })}
  GROUP BY device
  ORDER BY clicks DESC
  LIMIT 10`;

    const result = await getAnalytics(ctx, sqlQuery);
    return ctx.json(result, 200, {
      'Cache-Control': 'public, max-age=90',
    });
  }
);

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/clicks',
    description: 'Get number of clicks by short link',
    request: {
      query: z.object({
        key: z.union([z.string(), z.array(z.string())]),
      }),
    },
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                key: z.string(),
                clicks: z.number(),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { key } = ctx.req.queries();
    if (key.length < 1 || key.length > 25) {
      throw new HTTPException(402, {
        message: `Keys query parameter count must be between 1-25, found: ${key.length} parameters`,
      });
    }

    const keys = key.map((x) => `'${x.trim()}'`).join();
    const sqlQuery = `SELECT
    blob2 as key,
    COUNT() as clicks
  FROM IDM_ANALYTICS
  WHERE
  blob1 = '${authUser.account_id}'
  AND timestamp >= NOW() - INTERVAL '30' DAY
  AND key in (${keys})
  GROUP BY key
  ORDER BY clicks DESC
  LIMIT 15`;

    const result = await getAnalytics(ctx, sqlQuery);
    return ctx.json(result, 200, {
      'Cache-Control': 'public, max-age=90',
    });
  }
);

export { analytics };
