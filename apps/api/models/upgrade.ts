import { z } from '@hono/zod-openapi';

// Internal: checkout request for a paid plan
export const upgradeSchema = z.object({
  plan: z.enum(['Starter', 'Pro', 'Business', 'Lifetime']).default('Pro'),
  currency: z.enum(['USD', 'INR']).default('USD'),
  price: z.number().min(7, 'Invalid plan'),
  frequency: z.enum(['month', 'year']).default('month'),
  gateway: z.enum(['Stripe', 'Paypal']).default('Stripe'),
});

export type Upgrade = z.infer<typeof upgradeSchema>;
