import { Plan, PlanType } from './plan';

export enum UserStatus {
  active = 'active',
  disabled = 'disabled',
}

export enum RoleType {
  Owner = 'Owner',
  Admin = 'Admin',
}

export enum LevelType {
  Level1 = 'Level1',
  Level2 = 'Level2',
  Level3 = 'Level3',
}

export interface AuthUser extends Plan {
  user_id?: number;
  account_id?: number;
  name?: string;
  email?: string;
  password?: string;
  role?: RoleType;
  level?: LevelType;
  ip_address?: string;
  is_verified?: boolean;
  is_subscribed?: boolean;
  guid?: string;
  last_login_at?: Date;
  status?: UserStatus;
  avatar?: string;
  password_reset_at?: Date;
  created_at?: string;
  updated_at?: string;
  plan?: PlanType;
  trial_end_at?: Date;
  country?: string;
}
