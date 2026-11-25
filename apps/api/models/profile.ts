import { z } from '@hono/zod-openapi';

// Internal: signed in user's own profile
export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  avatar: z.string().max(512).optional().nullable(),
  is_subscribed: z.union([z.boolean(), z.number().int().min(0).max(1)]).default(1),
});

export type Profile = z.infer<typeof profileSchema>;
