import { filterClause, getAnalytics } from '../services/analytics.service';
import { AuthUser } from '../models/auth-user';
import { createRoute, z } from '@hono/zod-openapi';
import { clickFilterSchema, pagedSchema } from '../models/paged';
import { tableSchema, toTableResult } from '../models/table';
import { PlanType } from '../models/plan';
import { isAfter } from 'date-fns';
import { HTTPException } from 'hono/http-exception';
import { createApi, errorResponses } from '../helper/openapi';
import { SHORT_DOMAIN } from '../services/links.service';

const reports = createApi();

/** Clicks the free plan can see in full, the rest are returned masked */
const FREE_VISIBLE_CLICKS = 3;
const MASK = '••••••';

const maskClick = (click: Record<string, any>) => ({
  ...click,
  url: `https://${SHORT_DOMAIN}/${MASK}`,
  city: MASK,
  region: MASK,
  referer: MASK,
  ip: '•••.•••.•••.•••',
  locked: true,
});

const clickSchema = z
  .object({
    timestamp: z.string().openapi({
      example: '2026-01-01T10:00:00Z',
      description: 'UTC date-time of the click',
    }),
    url: z.string().openapi({ example: `https://${SHORT_DOMAIN}/summer-sale` }),
    country: z.string().openapi({ example: 'US' }),
    city: z.string().openapi({ example: 'New York' }),
    region: z.string().openapi({ example: 'NY' }),
    referer: z.string().openapi({ example: 'linkedin.com' }),
    browser: z.string().openapi({ example: 'Chrome' }),
    os: z.string().openapi({ example: 'macOS' }),
    device: z.string().openapi({ example: 'desktop' }),
    ip: z.string().openapi({ example: '203.0.113.10' }),
    locked: z.boolean().optional().openapi({
      example: false,
      description:
        'True when the click is hidden by the plan, the url, city, referer and ip are masked',
    }),
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
      'Export the latest clicks on your short links from the last 30 days with timestamp, country, city, referrer, browser, OS and device of each visitor. Useful to feed click data into your own BI tool or CRM. Clicks without a referrer have an empty `referer`.',
    request: {
      query: pagedSchema
        .pick({ offset: true, limit: true })
        .merge(clickFilterSchema),
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
    const query = ctx.req.valid('query');
    const { offset, limit } = query;
    const isFree = authUser.plan == PlanType.Free && !authUser.level;

    if (
      authUser.plan == PlanType.Free &&
      isAfter(new Date(), new Date(authUser.trial_end_at))
    ) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan does not have access to this API.`,
      });
    }

    const whereClause = `double1 = ${Number(authUser.account_id)}
    AND timestamp >= NOW() - INTERVAL '30' DAY${filterClause(query)}`;

    const sqlQuery = `SELECT
    timestamp,
    format('https://${SHORT_DOMAIN}/{}', blob1) as url,
    blob2 as country,
    blob3 as city,
    blob4 as region,
    if(blob5 = 'null', '', blob5) as referer,
    blob6 as browser,
    blob7 as os,
    blob8 as device,
    blob9 as ip
  FROM SHORTENER_ANALYTICS
  WHERE ${whereClause}
  ORDER BY timestamp DESC
  LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

    const countQuery = `SELECT count() as total
  FROM SHORTENER_ANALYTICS
  WHERE ${whereClause}`;

    const [rows, count] = await Promise.all([
      getAnalytics(ctx.env, sqlQuery),
      getAnalytics(ctx.env, countQuery),
    ]);
    const result = rows.map((r: Record<string, any>, i: number) => {
      // Convert to ISO format
      r.timestamp = r.timestamp.replace(' ', 'T') + 'Z';
      return isFree && offset + i >= FREE_VISIBLE_CLICKS ? maskClick(r) : r;
    });
    const total = Number(count[0]?.total ?? 0);
    return ctx.json(toTableResult(result, offset, limit, total), 200);
  }
);

export { reports };
