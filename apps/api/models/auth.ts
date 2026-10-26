import { z } from '@hono/zod-openapi';

const blockedEmailDomains = ['hidelux.com', 'dealoaks.com', 'marsoak.com'];

export const signupSchema = z
  .object({
    name: z.string().max(64).openapi({
      example: 'Jane Doe',
      description: 'Full name of the account owner',
    }),
    email: z
      .email()
      .max(100)
      .refine(
        (email) => !blockedEmailDomains.includes(email.split('@')[1]),
        { message: 'Domain blocked' }
      )
      .openapi({
        example: 'jane@example.com',
        description:
          'Work email address. A one-time verification code is sent to this email after sign up',
      }),
    password: z.string().min(5).max(256).openapi({
      example: 'S3cure-Pa55',
      description: 'Account password, minimum 5 characters',
    }),
    recaptcha: z.string().min(24).openapi({
      description: 'Google reCAPTCHA token from the sign up form',
    }),
  })
  .openapi('Signup', {
    description: 'Create a free URL shortener account',
  });

export type Signup = z.infer<typeof signupSchema>;

export const loginSchema = z
  .object({
    email: z.email().max(100).openapi({
      example: 'jane@example.com',
      description: 'Registered email address',
    }),
    password: z.string().min(5).max(256).openapi({
      example: 'S3cure-Pa55',
      description: 'Account password',
    }),
  })
  .openapi('Login', {
    description: 'Sign in with email and password',
  });

export type Login = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z
  .object({
    email: z.email().max(100).openapi({
      example: 'jane@example.com',
      description: 'Email address to send the password reset link to',
    }),
  })
  .openapi('ForgotPassword');

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(5).max(256).openapi({
      example: 'N3w-Pa55word',
      description: 'New password, minimum 5 characters',
    }),
    confirm_password: z.string().openapi({
      example: 'N3w-Pa55word',
      description: 'Must match the new password',
    }),
    token: z.string().min(32).openapi({
      description: 'Password reset token received in the reset email link',
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password and confirm password does not match',
    path: ['confirm_password'],
  })
  .openapi('ResetPassword');

export type ResetPassword = z.infer<typeof resetPasswordSchema>;

export const identifySchema = z
  .object({
    email: z
      .email()
      .max(100)
      .refine(
        (email) => !blockedEmailDomains.includes(email.split('@')[1]),
        { message: 'Domain blocked' }
      )
      .openapi({
        example: 'jane@example.com',
        description:
          'Email address to sign in or sign up with. A one-time code is sent to this email',
      }),
  })
  .openapi('Identify', {
    description: 'Passwordless sign in with a one-time email code',
  });

export type Identify = z.infer<typeof identifySchema>;

export const verifyCodeSchema = z
  .object({
    code: z
      .string()
      .regex(/^\d{6}$/, { message: 'Enter the 6-digit code' })
      .openapi({
        example: '482913',
        description: 'One-time code received by email',
      }),
  })
  .openapi('VerifyCode');

export type VerifyCode = z.infer<typeof verifyCodeSchema>;

/**
 * Detects spam names used to abuse signup emails.
 */
export const isSpamName = (name: string): boolean => {
  const trimmed = name.trim();
  if (trimmed.split(/\s+/).length > 4) return true;
  if (/[$€£₹+#%]/.test(trimmed)) return true;
  // Links and HTML
  if (/[./<>]/.test(trimmed)) return true;
  return false;
};
