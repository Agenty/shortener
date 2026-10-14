import { z } from 'zod';
import { PlanType } from './plan';

export interface Account {
  account_id?: number;
  company_name?: string;
  status?: string;
  plan?: PlanType;
  phone?: string;
  website?: string;
  country?: string;
  billing_name?: string;
  billing_address?: string;
  tax_name?: string;
  tax_number?: string;
  trial_end_at?: Date | string;
  updated_at?: Date;
  created_at?: Date;
}

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
