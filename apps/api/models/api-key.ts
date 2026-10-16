import { z } from '@hono/zod-openapi';

export const apiKeySchema = z
  .object({
    key_id: z.number().int().optional().openapi({
      example: 1,
      description: 'Unique API key id',
      readOnly: true,
    }),
    key: z.string().optional().openapi({
      description:
        'The secret API key, returned only once on create. Send it as `Authorization: Bearer <key>`',
      readOnly: true,
    }),
    name: z.string().min(2).max(64).openapi({
      example: 'Production server',
      description: 'A label to identify where the API key is used',
    }),
    is_enabled: z
      .union([z.boolean(), z.number().int().min(0).max(1)])
      .default(1)
      .openapi({
        example: true,
        description: 'Disabled keys are rejected with 401 Unauthorized',
      }),
    created_at: z.union([z.string(), z.date()]).nullable().optional().openapi({
      type: 'string',
      example: '2026-01-01T10:00:00Z',
      readOnly: true,
    }),
    updated_at: z.union([z.string(), z.date()]).nullable().optional().openapi({
      type: 'string',
      example: '2026-01-02T10:00:00Z',
      readOnly: true,
    }),
  })
  .openapi('ApiKey', {
    description:
      'API keys authenticate server-to-server requests to the URL shortener API',
  });

export type ApiKey = z.infer<typeof apiKeySchema>;
