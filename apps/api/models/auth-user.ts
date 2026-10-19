import { addDays } from "date-fns";
import { PlanLimits, PlanType, getPlanLimits } from "./plan";

export enum UserStatus {
    active = "active",
    disabled = "disabled",
    suspended = "suspended",
    expired = "expired"
}

export enum RoleType {
    Owner = "Owner",
    Admin = "Admin",
    Staff = "Staff",
    Custom = "Custom",
}

export enum LevelType {
    Level1 = "Level1",
    Level2 = "Level2",
    Level3 = "Level3",
}

export interface AuthUser extends Partial<PlanLimits> {
    user_id?: number;
    account_id?: number;
    name?: string;
    email?: string;
    password?: string;
    role?: RoleType;
    level?: LevelType;
    team_access?: boolean;
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

export interface AuthResponse extends Omit<AuthUser, "password" | "guid" | "ip_address" | "password_reset_at"> {
    token?: string;
}

/** Signed in user with plan limits, never includes the password */
export const toAuthResponse = (authUser: AuthUser, token?: string): AuthResponse => ({
    ...getPlanLimits(authUser.plan),
    user_id: authUser.user_id,
    account_id: authUser.account_id,
    name: authUser.name,
    email: authUser.email,
    avatar: authUser.avatar,
    plan: authUser.plan,
    role: authUser.role,
    level: authUser.level,
    team_access: authUser.team_access,
    status: authUser.status,
    is_verified: authUser.is_verified,
    is_subscribed: authUser.is_subscribed,
    country: authUser.country,
    last_login_at: authUser.last_login_at || new Date(),
    trial_end_at: authUser.trial_end_at || addDays(new Date(), 7),
    created_at: authUser.created_at || new Date().toISOString(),
    updated_at: authUser.updated_at || new Date().toISOString(),
    token,
});
