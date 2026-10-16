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

export const analyticsQuerySchema = z.object({
  url: z.string().optional().openapi({
    example: 'https://shortener.dev/github',
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
