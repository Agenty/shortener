import { z } from 'zod';

export enum OTPPurpose {
  signup = 'signup',
  delete_account = 'delete_account',
}

export class OtpVerification {
  code?: number;
  purpose?: OTPPurpose;
}

export const otpSchema = z.object({
  purpose: z.nativeEnum(OTPPurpose),
  code: z.number().int().nullable().optional(),
});
