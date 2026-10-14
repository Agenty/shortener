import { z } from 'zod';

export interface ResetPassword {
  password: string;
  confirm_password: string;
  token: string;
}

export const resetPasswordSchema = z.object({
  password: z.string().min(5).max(256),
  confirm_password: z.string(),
  token: z.string().min(32),
});
