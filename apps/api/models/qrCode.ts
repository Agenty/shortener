import { z } from '@hono/zod-openapi';

export class QRCode {
  key?: string;
  account_id?: number;
  user_id?: number;
  project_id?: number | null;
  name?: string;
  data?: Record<string, any>;
  short_url?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export const qRCodeSchema = z.object({
  key: z.string().optional().nullable().openapi({ readOnly: true }),
  account_id: z.number().optional().nullable().openapi({ readOnly: true }),
  user_id: z.number().optional().nullable(),
  project_id: z.number().optional().nullable(),
  name: z.string().min(1),
  data: z.any(),
  created_at: z.string().optional().nullable().openapi({ readOnly: true }),
  updated_at: z.string().optional().nullable().openapi({ readOnly: true }),
});
