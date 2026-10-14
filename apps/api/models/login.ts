import { z } from 'zod';

export interface Login {
  email?: string;
  password?: string;
}

export const loginSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(5).max(256),
});
