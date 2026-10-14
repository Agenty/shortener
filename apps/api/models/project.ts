import { z } from '@hono/zod-openapi';

export class Project {
  project_id?: number;
  account_id: number;
  user_id?: number | null;
  name?: string;
  color?: string;
  icon?: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export const projectSchema = z
  .object({
    project_id: z.number().nullable().optional().openapi({
      description: 'Unique project id',
      readOnly: true,
    }),
    user_id: z.number().nullable().optional().openapi({
      example: 1,
      description:
        'To assign this project some other user in your team. Current user, by default',
    }),
    name: z.string().max(64).openapi({
      example: 'Project 1',
      description: 'Name of the project',
    }),
    color: z.string().max(7).optional().nullable().openapi({
      example: '#FFFFFF',
      description: 'Color code',
    }),
    icon: z
      .string()
      .max(64)
      .url()
      .nullable()
      .optional()
      .or(z.literal(''))
      .openapi({
        example: 'https://example.com/icon.png',
        description: 'Project icon (if any). Must be a valid png, jpg or svg',
      }),
    created_at: z.string().nullable().optional().openapi({
      example: new Date().toISOString(),
      description: 'Date time when this project was created in UTC',
      readOnly: true,
    }),
    updated_at: z.string().nullable().optional().openapi({
      example: new Date().toISOString(),
      description: 'Date time when this project was last updated in UTC',
      readOnly: true,
    }),
  })
  .openapi('Projects');
