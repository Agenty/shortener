import { z } from '@hono/zod-openapi';

export const projectSchema = z
  .object({
    project_id: z.number().int().optional().openapi({
      example: 1,
      description: 'Unique project id',
      readOnly: true,
    }),
    user_id: z.number().int().nullable().optional().openapi({
      example: 1,
      description: 'Team member who owns this project. Current user by default',
    }),
    name: z.string().min(1).max(64).openapi({
      example: 'Summer campaign',
      description: 'Project name, e.g. a campaign, client or brand',
    }),
    color: z.string().max(7).optional().nullable().openapi({
      example: '#E0F2FE',
      description: 'Hex color code to label the project. Random when empty',
    }),
    icon: z
      .url()
      .max(124)
      .nullable()
      .optional()
      .or(z.literal(''))
      .openapi({
        example: 'https://example.com/icon.png',
        description: 'Project icon URL. Must be a png, jpg or svg image',
      }),
    total_links: z.number().int().optional().openapi({
      example: 12,
      description: 'Number of short links in the project',
      readOnly: true,
    }),
    created_at: z.string().nullable().optional().openapi({
      example: '2026-01-01T10:00:00Z',
      description: 'UTC date-time when the project was created',
      readOnly: true,
    }),
    updated_at: z.string().nullable().optional().openapi({
      example: '2026-01-02T10:00:00Z',
      description: 'UTC date-time when the project was last updated',
      readOnly: true,
    }),
  })
  .openapi('Project', {
    description:
      'Projects group short links by campaign, client or brand for easier management and analytics',
  });

export type Project = z.infer<typeof projectSchema> & { account_id?: number };
