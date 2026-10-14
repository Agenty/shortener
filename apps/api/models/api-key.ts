import { z } from 'zod';

export class ApiKey {
  key_id?: number;
  key?: string; // On create only
  name?: string;
  is_enabled?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export const apiKeySchema = z.object({
  name: z.string().min(2),
  is_enabled: z.union([z.boolean(), z.number().nonnegative().lt(2)]).default(1),
});
