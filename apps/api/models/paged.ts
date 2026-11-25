import { z } from '@hono/zod-openapi';

export const pagedSchema = z.object({
  offset: z.coerce.number().int().min(0).optional().default(0).openapi({
    example: 0,
    description: 'Number of records to skip for pagination',
  }),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(1000).openapi({
    example: 25,
    description: 'Maximum number of records to return (1-1000)',
  }),
  search: z.string().max(512).optional().openapi({
    example: 'github',
    description: 'Search by short link key or destination URL',
  }),
});

export type Paged = z.infer<typeof pagedSchema>;

const dimension = (example: string, description: string) =>
  z.string().min(1).max(256).optional().openapi({ example, description });

/** Drill-down filters on the click dimensions, shared by analytics and reports */
export const clickFilterSchema = z.object({
  country: dimension('US', 'Filter by ISO 3166-1 alpha-2 country code'),
  city: dimension('New York', 'Filter by city'),
  referer: dimension(
    'linkedin.com',
    'Filter by referrer host, use `(direct)` for clicks without a referrer'
  ),
  browser: dimension('Chrome', 'Filter by browser'),
  os: dimension('iOS', 'Filter by operating system'),
  device: dimension('mobile', 'Filter by device type: mobile, tablet or desktop'),
});

export type ClickFilter = z.infer<typeof clickFilterSchema>;

export const analyticsQuerySchema = clickFilterSchema.extend({
  url: z.string().optional().openapi({
    example: 'https://srt1.link/github',
    description: 'Filter the report by a short link URL or key',
  }),
  interval: z.coerce.number().int().min(1).max(90).optional().default(7).openapi({
    example: 7,
    description:
      'Number of days to include in the report, limited by the plan analytics history',
  }),
  project_id: z.coerce.number().int().positive().optional().openapi({
    example: 1,
    description: 'Filter the report by project',
  }),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
