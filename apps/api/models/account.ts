import { z } from '@hono/zod-openapi';
import { PlanType } from './plan';

// Internal: billing details of the account, not part of the public API docs
export const accountSchema = z.object({
  account_id: z.number().optional(),
  company_name: z.string().max(200),
  website: z.string().max(256).optional().nullable(),
  country: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  billing_name: z.string().max(200).optional().nullable(),
  billing_address: z.string().max(200).optional().nullable(),
  tax_name: z.string().max(200).optional().nullable(),
  tax_number: z.string().max(200).optional().nullable(),
});

export type Account = Partial<z.infer<typeof accountSchema>> & {
  status?: string;
  plan?: PlanType;
  trial_end_at?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
};
