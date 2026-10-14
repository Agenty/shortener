import dayjs from 'dayjs';
import { AuthUser, LevelType, RoleType, UserStatus } from './auth-user';
import { Plan, PlanType } from './plan';

export class AuthResponse extends Plan {
  avatar?: string;
  email?: string;
  phone?: string;
  //password?: string;
  is_subscribed?: number | boolean;
  is_verified?: number | boolean;
  is_locked?: number | boolean;
  name?: string;
  account_id?: number;
  plan?: PlanType;
  role?: RoleType;
  level?: LevelType;
  last_login_at?: Date;
  last_login_ip?: string;
  status?: UserStatus;
  user_id?: number;
  created_at?: Date;
  updated_at?: Date;
  trial_end_at?: Date;

  token?: string;

  constructor(authUser: AuthUser, jwtToken: string | undefined = undefined) {
    super(authUser.plan);
    this.avatar = authUser.avatar;
    this.email = authUser.email;
    this.is_subscribed = authUser.is_subscribed;
    this.is_verified = authUser.is_verified;
    this.name = authUser.name;
    this.plan = authUser.plan;
    this.role = authUser.role;
    this.level = authUser.level;
    this.last_login_at = authUser.last_login_at || new Date();
    this.status = authUser.status;
    this.user_id = authUser.user_id;
    this.account_id = authUser.account_id;
    this.trial_end_at = authUser.trial_end_at || dayjs().add(7, 'days').toDate();

    this.created_at = authUser.created_at
      ? new Date(authUser.created_at)
      : new Date();
    this.updated_at = authUser.updated_at
      ? new Date(authUser.updated_at)
      : new Date();
    this.token = jwtToken;
  }
}
