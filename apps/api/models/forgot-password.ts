import { z } from 'zod';

export interface ForgotPassword {
  email: string;
}

export const forgetPasswordSchema = z.object({
  email: z.string().email().max(100),
});
