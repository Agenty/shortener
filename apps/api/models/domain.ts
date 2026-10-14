import { z } from '@hono/zod-openapi';

export class Domain {
  domain_id?: number;
  account_id?: number;
  user_id?: number | null;
  domain?: string;
  is_default?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export const domainSchema = z
  .object({
    domain_id: z.number().nullable().optional().openapi({
      description: 'Unique domain id',
      readOnly: true,
    }),
    user_id: z.number().nullable().optional().openapi({
      example: 1,
      description: 'To assign this domain to some other user in your team',
    }),
    domain: z.string().max(64).openapi({
      example: 'example.com',
      description: 'example.com',
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
  .openapi('Domains');
