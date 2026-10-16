import { getAnalytics } from '../services/analytics.service';
import { AuthUser } from '../models/auth-user';
import { createRoute, z } from '@hono/zod-openapi';
import { AnalyticsQuery, analyticsQuerySchema } from '../models/paged';
import { HTTPException } from 'hono/http-exception';
import { createApi, errorResponses } from '../helper/openapi';

const analytics = createApi();

// Short link keys are interpolated in the Analytics Engine SQL
const KEY_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

const toKey = (url: string) => {
  const key = url.split('?')[0].split('/').pop();
  if (!KEY_PATTERN.test(key)) {
    throw new HTTPException(400, { message: `Invalid short link: ${url}` });
  }
  return key;
};

const queryBuilder = (authUser: AuthUser, filter: AnalyticsQuery) => {
  const days = filter.interval || 7;
  if (days > authUser.analytics_limit) {
    throw new HTTPException(402, {
      message: `The ${authUser.plan} plan is limited to view ${authUser.analytics_limit} days reports only`,
    });
  }
  const intervalClause = `timestamp >= NOW() - INTERVAL '${days}' DAY`;
  let whereClause = `blob1 = '${Number(authUser.account_id)}' AND ${intervalClause}`;
  if (filter.url && filter.url.length) {
    whereClause += ` AND blob2 = '${toKey(filter.url)}'`;
  }
  if (filter.project_id) {
    whereClause += ` AND blob11 = '${Number(filter.project_id)}'`;
  }
  return whereClause;
};

const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=90' };

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/',
    summary: 'Clicks over time',
    description:
      'Get the daily number of clicks on your short links for the selected period. Filter by short link or project to measure a single campaign.',
    request: {
      query: analyticsQuerySchema,
    },
    responses: {
      200: {
        description: 'Clicks per day',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                date: z.string().openapi({ example: '2026-01-01' }),
                clicks: z.number().openapi({ example: 120 }),
              })
            ),
          },
        },
      },
      ...errorResponses(400, 401, 402),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const sqlQuery = `SELECT
    formatDateTime(toStartOfInterval(timestamp, INTERVAL '1' DAY), '%Y-%m-%d') AS date,
    COUNT() as clicks
  FROM SHORTENER_ANALYTICS
  WHERE
  ${queryBuilder(authUser, ctx.req.valid('query'))}
  GROUP BY date
  ORDER BY date`;

    const result = await getAnalytics(ctx.env, sqlQuery);
    return ctx.json(result, 200, CACHE_HEADERS);
  }
);

// Top 10 breakdown reports, grouped by a single dimension
const BREAKDOWNS = [
  {
    path: '/top',
    field: 'url',
    column: `format('https://shortener.dev/{}', blob2)`,
    summary: 'Top short links',
    description: 'Get the 10 most clicked short links in the selected period.',
    example: 'https://shortener.dev/summer-sale',
  },
  {
    path: '/referer',
    field: 'referer',
    column: `if(blob6 = 'null', '(direct)', blob6)`,
    summary: 'Clicks by referrer',
    description:
      'Get the top 10 websites and social networks sending clicks to your short links. Clicks without a referrer are reported as `(direct)`.',
    example: 'linkedin.com',
  },
  {
    path: '/country',
    field: 'country',
    column: 'blob3',
    summary: 'Clicks by country',
    description:
      'Get the top 10 countries of visitors clicking your short links, as ISO 3166-1 alpha-2 codes.',
    example: 'US',
  },
  {
    path: '/city',
    field: 'city',
    column: 'blob4',
    summary: 'Clicks by city',
    description: 'Get the top 10 cities of visitors clicking your short links.',
    example: 'New York',
  },
  {
    path: '/browser',
    field: 'browser',
    column: 'blob7',
    summary: 'Clicks by browser',
    description: 'Get the top 10 web browsers used to open your short links.',
    example: 'Chrome',
  },
  {
    path: '/os',
    field: 'os',
    column: 'blob8',
    summary: 'Clicks by operating system',
    description:
      'Get the top 10 operating systems (iOS, Android, Windows, macOS...) of visitors clicking your short links.',
    example: 'iOS',
  },
  {
    path: '/device',
    field: 'device',
    column: 'blob9',
    summary: 'Clicks by device type',
    description:
      'Get the clicks split by device type: mobile, tablet or desktop.',
    example: 'mobile',
  },
] as const;

for (const report of BREAKDOWNS) {
  analytics.openapi(
    createRoute({
      tags: ['Analytics'],
      method: 'get',
      path: report.path,
      summary: report.summary,
      description: report.description,
      request: {
        query: analyticsQuerySchema,
      },
      responses: {
        200: {
          description: report.summary,
          content: {
            'application/json': {
              schema: z.array(
                z.object({
                  [report.field]: z.string().openapi({ example: report.example }),
                  clicks: z.number().openapi({ example: 42 }),
                })
              ),
            },
          },
        },
        ...errorResponses(400, 401, 402),
      } as any,
    }),
    async (ctx) => {
      const authUser: AuthUser = ctx.req['user'];
      const sqlQuery = `SELECT
    ${report.column} as ${report.field},
    COUNT() as clicks
  FROM SHORTENER_ANALYTICS
  WHERE
  ${queryBuilder(authUser, ctx.req.valid('query'))}
  GROUP BY ${report.field}
  ORDER BY clicks DESC
  LIMIT 10`;

      const result = await getAnalytics(ctx.env, sqlQuery);
      return ctx.json(result, 200, CACHE_HEADERS);
    }
  );
}

analytics.openapi(
  createRoute({
    tags: ['Analytics'],
    method: 'get',
    path: '/clicks',
    summary: 'Clicks by short link',
    description:
      'Get the total number of clicks in the last 30 days for up to 25 short links at once. Pass `key` repeatedly, e.g. `?key=summer-sale&key=github`.',
    request: {
      query: z.object({
        key: z
          .union([z.string(), z.array(z.string())])
          .openapi({ example: ['summer-sale', 'github'] }),
      }),
    },
    responses: {
      200: {
        description: 'Clicks per short link key',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                key: z.string().openapi({ example: 'summer-sale' }),
                clicks: z.number().openapi({ example: 42 }),
              })
            ),
          },
        },
      },
      ...errorResponses(400, 401),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const key = ctx.req.queries('key') || [];
    if (key.length < 1 || key.length > 25) {
      throw new HTTPException(400, {
        message: `Keys query parameter count must be between 1-25, found: ${key.length} parameters`,
      });
    }

    const keys = key.map((x) => `'${toKey(x.trim())}'`).join();
    const sqlQuery = `SELECT
    blob2 as key,
    COUNT() as clicks
  FROM SHORTENER_ANALYTICS
  WHERE
  blob1 = '${Number(authUser.account_id)}'
  AND timestamp >= NOW() - INTERVAL '30' DAY
  AND key in (${keys})
  GROUP BY key
  ORDER BY clicks DESC
  LIMIT 25`;

    const result = await getAnalytics(ctx.env, sqlQuery);
    return ctx.json(result, 200, CACHE_HEADERS);
  }
);

export { analytics };
