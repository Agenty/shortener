import Cookies from "js-cookie";
import type { AuthResponse } from "@/types/auth";
import type { LinksResponse, Link, LinkCreatePayload, UrlMeta } from "@/types/link";
import type { ReportsResponse } from "@/types/report";
import type {
  AnalyticsClick,
  AnalyticsReferer,
  AnalyticsCountry,
  AnalyticsTop,
  AnalyticsBrowser,
  AnalyticsOS,
  AnalyticsDevice,
} from "@/types/analytics";
import type { Profile, Account, ApiKey, ApiKeysResponse } from "@/types/account";
import type { User, UsersResponse, UserCreatePayload, UserUpdatePayload } from "@/types/user";

const BASE_URL = "https://api.idm.in/v1";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = Cookies.get("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || res.statusText);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────

export const api = {
  auth: {
    signin(data: { email: string; password: string }) {
      return request<AuthResponse>("/auth/signin", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => {
        Cookies.set("token", res.token, { expires: 7 });
        return res;
      });
    },

    signup(data: { name: string; email: string; password: string }) {
      return request<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => {
        Cookies.set("token", res.token, { expires: 7 });
        return res;
      });
    },

    logout() {
      Cookies.remove("token");
    },

    isAuthenticated() {
      return !!Cookies.get("token");
    },
  },

  // ─── Links ──────────────────────────────────────────

  links: {
    list(params: { offset?: number; limit?: number; search?: string } = {}) {
      const query = new URLSearchParams();
      if (params.offset !== undefined) query.set("offset", String(params.offset));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      if (params.search) query.set("search", params.search);
      return request<LinksResponse>(`/links?${query.toString()}`);
    },

    create(data: LinkCreatePayload) {
      return request<Link>("/links", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    delete(id: string) {
      return request<void>(`/links/${id}`, { method: "DELETE" });
    },
  },

  reports: {
    list(params: { offset?: number; limit?: number } = {}) {
      const query = new URLSearchParams();
      if (params.offset !== undefined) query.set("offset", String(params.offset));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      return request<ReportsResponse>(`/reports?${query.toString()}`);
    },
  },

  analytics: {
    clicks(params: { interval?: number; key?: string } = {}) {
      const query = new URLSearchParams();
      if (params.interval !== undefined) query.set("interval", String(params.interval));
      if (params.key) query.set("key", params.key);
      return request<AnalyticsClick[]>(`/analytics?${query.toString()}`);
    },
    referer(params: { interval?: number; key?: string } = {}) {
      const query = new URLSearchParams();
      if (params.interval !== undefined) query.set("interval", String(params.interval));
      if (params.key) query.set("key", params.key);
      return request<AnalyticsReferer[]>(`/analytics/referer?${query.toString()}`);
    },
    country(params: { interval?: number; key?: string } = {}) {
      const query = new URLSearchParams();
      if (params.interval !== undefined) query.set("interval", String(params.interval));
      if (params.key) query.set("key", params.key);
      return request<AnalyticsCountry[]>(`/analytics/country?${query.toString()}`);
    },
    top(params: { interval?: number; key?: string } = {}) {
      const query = new URLSearchParams();
      if (params.interval !== undefined) query.set("interval", String(params.interval));
      if (params.key) query.set("key", params.key);
      return request<AnalyticsTop[]>(`/analytics/top?${query.toString()}`);
    },
    browser(params: { interval?: number; key?: string } = {}) {
      const query = new URLSearchParams();
      if (params.interval !== undefined) query.set("interval", String(params.interval));
      if (params.key) query.set("key", params.key);
      return request<AnalyticsBrowser[]>(`/analytics/browser?${query.toString()}`);
    },
    os(params: { interval?: number; key?: string } = {}) {
      const query = new URLSearchParams();
      if (params.interval !== undefined) query.set("interval", String(params.interval));
      if (params.key) query.set("key", params.key);
      return request<AnalyticsOS[]>(`/analytics/os?${query.toString()}`);
    },
    device(params: { interval?: number; key?: string } = {}) {
      const query = new URLSearchParams();
      if (params.interval !== undefined) query.set("interval", String(params.interval));
      if (params.key) query.set("key", params.key);
      return request<AnalyticsDevice[]>(`/analytics/device?${query.toString()}`);
    },
  },

  meta: {
    fetch(url: string) {
      return request<UrlMeta>(`/meta?url=${encodeURIComponent(url)}`);
    },
  },

  profile: {
    get() {
      return request<Profile>("/profile");
    },
    update(data: { name: string }) {
      return request<Profile>("/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },

  accounts: {
    get() {
      return request<Account>("/accounts");
    },
    update(data: Partial<Account>) {
      return request<Account>("/accounts", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },

  apikeys: {
    list(params: { offset?: number; limit?: number } = {}) {
      const query = new URLSearchParams();
      if (params.offset !== undefined) query.set("offset", String(params.offset));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      return request<ApiKeysResponse>(`/apikeys?${query.toString()}`);
    },
    create(data: { name: string }) {
      return request<ApiKey>("/apikeys", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    delete(id: number) {
      return request<void>(`/apikeys/${id}`, { method: "DELETE" });
    },
  },

  users: {
    list(params: { offset?: number; limit?: number } = {}) {
      const query = new URLSearchParams();
      if (params.offset !== undefined) query.set("offset", String(params.offset));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      return request<UsersResponse>(`/users?${query.toString()}`);
    },
    create(data: UserCreatePayload) {
      return request<User>("/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id: number, data: UserUpdatePayload) {
      return request<User>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id: number) {
      return request<void>(`/users/${id}`, { method: "DELETE" });
    },
  },
};
