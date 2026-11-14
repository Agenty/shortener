import type { Link } from "./link";

/** Any user on the service, as listed for staff */
export interface AdminUser {
  user_id: number;
  account_id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  is_verified: number | boolean;
  ip_address: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface AdminUsersResponse {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: AdminUser[];
}

/** A link looked up by staff, with who created it. The password itself is never sent */
export interface AdminLink extends Omit<Link, "password"> {
  account_id: number;
  has_password: boolean;
  owner_name: string | null;
  owner_email: string | null;
}

export interface AdminTopLink {
  url: string;
  clicks: number;
}

export interface AdminTopLinksResponse {
  result: AdminTopLink[];
}
