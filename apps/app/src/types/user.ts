export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  is_enabled: boolean | number;
  created_at: string;
  updated_at: string | null;
}

export interface UsersResponse {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: User[];
}

export interface UserCreatePayload {
  name: string;
  email: string;
  role: string;
}

export type UserUpdatePayload = Partial<UserCreatePayload> & {
  is_enabled?: boolean | number;
};
