import { z } from '@hono/zod-openapi';

export enum OTPPurpose {
  signup = 'signup',
  delete_account = 'delete_account',
}

// Internal: email OTP for sign up and account deletion
export const otpSchema = z.object({
  purpose: z.enum(OTPPurpose),
  code: z.number().int().nullable().optional(),
});

export type OtpVerification = z.infer<typeof otpSchema>;
