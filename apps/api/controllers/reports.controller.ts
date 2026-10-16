import { getAnalytics } from '../services/analytics.service';
import { AuthUser } from '../models/auth-user';
import { createRoute, z } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
import { tableSchema, toTableResult } from '../models/table';
import { PlanType } from '../models/plan';
import { isAfter } from 'date-fns';
import { HTTPException } from 'hono/http-exception';
import { createApi, errorResponses } from '../helper/openapi';

const reports = createApi();

const clickSchema = z
  .object({
    timestamp: z.string().openapi({
      example: '2026-01-01T10:00:00Z',
      description: 'UTC date-time of the click',
    }),
    url: z.string().openapi({ example: 'https://idm.in/summer-sale' }),
    country: z.string().openapi({ example: 'US' }),
    city: z.string().openapi({ example: 'New York' }),
    region: z.string().openapi({ example: 'NY' }),
    referer: z.string().openapi({ example: 'linkedin.com' }),
    browser: z.string().openapi({ example: 'Chrome' }),
    os: z.string().openapi({ example: 'macOS' }),
    device: z.string().openapi({ example: 'desktop' }),
    ip: z.string().openapi({ example: '203.0.113.10' }),
  })
  .openapi('Click', {
    description: 'A single click on a short link with visitor details',
  });

reports.openapi(
  createRoute({
    tags: ['Reports'],
    method: 'get',
    path: '/',
    summary: 'Raw click log',
    description:
      'Export the latest clicks on your short links from the last 30 days with timestamp, country, city, referrer, browser, OS and device of each visitor. Useful to feed click data into your own BI tool or CRM.',
    request: {
      query: pagedSchema.pick({ offset: true, limit: true }),
    },
    responses: {
      200: {
        description: 'Paginated list of clicks, newest first',
        content: {
          'application/json': {
            schema: tableSchema(clickSchema),
          },
        },
      },
      ...errorResponses(401, 402),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { offset } = ctx.req.valid('query');
    let { limit } = ctx.req.valid('query');
    if (authUser.plan == PlanType.Free && !authUser.level) {
      limit = 3;
    }

    if (
      authUser.plan == PlanType.Free &&
      isAfter(new Date(), new Date(authUser.trial_end_at))
    ) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan does not have access to this API.`,
      });
    }

    const sqlQuery = `SELECT
    timestamp,
    format('https://idm.in/{}', blob2) as url,
    blob3 as country,
    blob4 as city,
    blob5 as region,
    blob6 as referer,
    blob7 as browser,
    blob8 as os,
    blob9 as device,
    blob10 as ip
  FROM SHORTENER_ANALYTICS
  WHERE
    blob1 = '${Number(authUser.account_id)}'
  and timestamp >= NOW() - INTERVAL '30' DAY
  ORDER BY timestamp DESC
  LIMIT ${Number(limit)}`;

    const result = await getAnalytics(ctx.env, sqlQuery);
    // Convert to ISO format
    result.forEach((r: { timestamp: string }) => {
      r.timestamp = r.timestamp.replace(' ', 'T') + 'Z';
    });
    return ctx.json(toTableResult(result, offset, limit), 200);
  }
);

export { reports };
