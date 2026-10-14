import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  is_subscribed: z
    .union([z.boolean(), z.number().nonnegative().lt(2)])
    .default(1),
});
