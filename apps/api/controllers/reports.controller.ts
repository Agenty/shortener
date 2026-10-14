import { Bindings } from '../types/bindings';
import { getAnalytics } from '../services/analytics.service';
import { AuthUser } from '../models/auth-user';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
import { formatZodError } from '../helper/utility';
import { TableResult } from '../models/table';
import { PlanType } from '../models/plan';
import dayjs from 'dayjs';
import { HTTPException } from 'hono/http-exception';

const reports = new OpenAPIHono<{ Bindings: Bindings }>({
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

reports.openapi(
  createRoute({
    tags: ['Reports'],
    method: 'get',
    path: '/',
    description: 'Get raw click reports',
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
                timestamp: z.date().openapi({
                  example: new Date().toISOString(),
                }),
                url: z.string().openapi({
                  example: 'https://idm.in/github',
                }),
                country: z.string().openapi({
                  example: 'US',
                }),
                city: z.string().openapi({
                  example: 'New York',
                }),
                region: z.string().openapi({
                  example: 'NYC',
                }),
                referer: z.string().openapi({
                  example: 'google.com',
                }),
                browser: z.string().openapi({
                  example: 'Chrome',
                }),
                os: z.string().openapi({
                  example: 'MacOS',
                }),
                device: z.string().openapi({
                  example: 'Desktop',
                }),
                ip: z.string().openapi({
                  example: '127.0.0.1',
                }),
              })
            ),
          },
        },
      },
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const offset = Number(ctx.req.query('offset')) || 0;
    let limit = Number(ctx.req.query('limit')) || 100;
    if (authUser.plan == PlanType.Free && !authUser.level) {
      limit = 3;
    }

    if (
      authUser.plan == PlanType.Free &&
      dayjs().isAfter(dayjs(authUser.trial_end_at))
    ) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan does not have access to this API.`,
      });
    }

    //formatDateTime(timestamp, '%Y-%m-%dT%TZ') as timestamp,
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
  FROM IDM_ANALYTICS
  WHERE
    blob1 = '${authUser.account_id}'
  and timestamp >= NOW() - INTERVAL '30' DAY
  ORDER BY timestamp DESC
  LIMIT ${limit}`;

    const result = await getAnalytics(ctx, sqlQuery);
    // Convert to ISO format
    if (result.length) {
      result.forEach((r: { timestamp: string }) => {
        r.timestamp = r.timestamp.replace(' ', 'T') + 'Z';
      });
    }
    return ctx.json(new TableResult(result, offset, limit, result.length), 200);
  }
);

export { reports };
