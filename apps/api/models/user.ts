import { z } from 'zod';
import { RoleType, UserStatus } from './auth-user';

export class User {
  user_id?: number;
  account_id?: number;
  name: string;
  email: string;
  avatar?: string;
  role?: RoleType;
  status?: UserStatus;
  guid?: string;
  created_at?: Date;
  updated_at?: Date;
  last_login_at?: Date;
  is_verified?: boolean;
  is_subscribed?: boolean;
}

export const userSchema = z.object({
  user_id: z.number().int().nullable().optional().openapi({ readOnly: true }),
  account_id: z
    .number()
    .int()
    .nullable()
    .optional()
    .openapi({ readOnly: true }),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.nativeEnum(RoleType).default(RoleType.Admin),
  status: z.nativeEnum(UserStatus).default(UserStatus.active),
  created_at: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: new Date().toISOString(), readOnly: true }),
  updated_at: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: new Date().toISOString(), readOnly: true }),
});
