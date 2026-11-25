export type LevelType = "Level1" | "Level2" | "Level3";

/** Signed in user with plan limits, `level` is set for admins only */
export interface AuthUser {
  user_id: number;
  account_id: number;
  name: string;
  email: string;
  role: string;
  level?: LevelType | null;
  plan?: string;
  status?: string;
  is_verified?: boolean;
}

export interface AuthResponse extends AuthUser {
  token: string;
}
