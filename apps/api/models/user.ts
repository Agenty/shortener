import { z } from '@hono/zod-openapi';
import { RoleType, UserStatus } from './auth-user';

export const userSchema = z
  .object({
    user_id: z.number().int().optional().openapi({
      example: 2,
      description: 'Unique user id',
      readOnly: true,
    }),
    name: z.string().min(1).max(64).openapi({
      example: 'John Smith',
      description: 'Full name of the team member',
    }),
    email: z.email().max(100).openapi({
      example: 'john@example.com',
      description: 'Email address of the team member, must be unique',
    }),
    role: z.enum(RoleType).default(RoleType.Admin).openapi({
      example: RoleType.Admin,
      description: 'Role of the team member in the account',
    }),
    status: z.enum(UserStatus).default(UserStatus.active).openapi({
      example: UserStatus.active,
      description: 'Disabled users cannot sign in or use the API',
    }),
    is_verified: z.union([z.boolean(), z.number()]).optional().openapi({
      readOnly: true,
    }),
    last_login_at: z.string().nullable().optional().openapi({
      example: '2026-01-02T10:00:00Z',
      readOnly: true,
    }),
    created_at: z.string().nullable().optional().openapi({
      example: '2026-01-01T10:00:00Z',
      readOnly: true,
    }),
    updated_at: z.string().nullable().optional().openapi({
      example: '2026-01-02T10:00:00Z',
      readOnly: true,
    }),
  })
  .openapi('User', {
    description: 'A team member with access to the account short links',
  });

export const userUpdateSchema = userSchema
  .pick({ name: true, role: true, status: true })
  .openapi('UserUpdate', {
    description: 'Fields of a team member that can be updated',
  });

export type UserUpdate = z.infer<typeof userUpdateSchema>;

export type User = Omit<
  z.infer<typeof userSchema>,
  'created_at' | 'updated_at' | 'last_login_at'
> & {
  account_id?: number;
  avatar?: string;
  guid?: string;
  is_subscribed?: boolean | number;
  password?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  last_login_at?: string | Date;
};
