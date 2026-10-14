import { z } from 'zod';

export interface Signup {
  name?: string;
  email?: string;
  password?: string;
  recaptcha?: string;
}

const blockedDomains = ['hidelux.com', 'dealoaks.com', 'marsoak.com'];

const emailSchema = z
  .string()
  .max(100)
  .email()
  .refine(
    (email) => {
      const domain = email.split('@')[1];
      return !blockedDomains.includes(domain);
    },
    {
      message: 'Domain blocked',
    }
  );

export const signupSchema = z.object({
  name: z.string().max(64),
  email: emailSchema,
  password: z.string().min(5).max(256),
  recaptcha: z.string().min(24),
});
