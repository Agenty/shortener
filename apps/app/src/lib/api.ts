import Cookies from "js-cookie";
import { env } from "@/env";
import type { AuthResponse, AuthUser } from "@/types/auth";
import type {
  Domain,
  DomainsResponse,
  GlobalDomain,
  GlobalDomainType,
  GlobalDomainsResponse,
} from "@/types/domain";
import type { LinksResponse, Link, LinkCreatePayload, UrlMeta } from "@/types/link";
import type { ReportsResponse, ReportsParams } from "@/types/report";
import type {
  AnalyticsClick,
  AnalyticsReferer,
  AnalyticsCountry,
  AnalyticsTop,
  AnalyticsBrowser,
  AnalyticsOS,
  AnalyticsDevice,
  AnalyticsParams,
} from "@/types/analytics";
import type { Profile, Account, ApiKey, ApiKeysResponse } from "@/types/account";
import type { User, UsersResponse, UserCreatePayload, UserUpdatePayload } from "@/types/user";

const BASE_URL = env.API_URL;

/** Cookies the API sets after Google sign in, see `oauth.controller.ts` */
const OAUTH_TOKEN_COOKIE = "auth_token";
const OAUTH_USER_COOKIE = "auth_user";

/** Same domain the API sets the Google sign in cookies on */
const oauthCookieDomain = () => {
  const { hostname } = window.location;
  return hostname.endsWith("shortener.dev") ? ".shortener.dev" : hostname;
};

/** API returns 428 when the signed in user has not verified their email */
export const EMAIL_NOT_VERIFIED = 428;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

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
    throw new ApiError(error.message || res.statusText, res.status);
  }

  return res.json();
}

/** Query string for the analytics and reports endpoints, `key` is sent as `url` */
function toClickQuery(params: AnalyticsParams & ReportsParams) {
  const query = new URLSearchParams();
  const { key, ...rest } = params;
  if (key) query.set("url", key);
  for (const [name, value] of Object.entries(rest)) {
    if (value !== undefined && value !== "") query.set(name, String(value));
  }
  return query.toString();
}

// ─── Auth ────────────────────────────────────────────

export const api = {
  auth: {
    signin(data: { email: string; password: string; recaptcha: string }) {
      return request<AuthResponse>("/auth/signin", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => {
        Cookies.set("token", res.token, { expires: 7 });
        return res;
      });
    },

    signup(data: { name: string; email: string; password: string; recaptcha: string }) {
      return request<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => {
        Cookies.set("token", res.token, { expires: 7 });
        return res;
      });
    },

    /** Emails a 6 digit code to verify the signed up email */
    sendOtp() {
      return request<{ message: string }>("/otp/send", {
        method: "POST",
        body: JSON.stringify({ purpose: "signup" }),
      });
    },

    /** Verifies the signup code, the response has a fresh token */
    verifyOtp(code: number) {
      return request<AuthResponse>("/otp/verify", {
        method: "POST",
        body: JSON.stringify({ purpose: "signup", code }),
      }).then((res) => {
        Cookies.set("token", res.token, { expires: 7 });
        return res;
      });
    },

    /** Sends the browser to Google consent, the API redirects back to `/oauth/callback` */
    signinWithGoogle() {
      const url = new URL(`${BASE_URL}/oauth/google`);
      url.searchParams.set("reason", "consent");
      url.searchParams.set("redirect_uri", `${window.location.origin}/oauth/callback`);
      window.location.href = url.toString();
    },

    /** Adopts the `auth_token` cookie set by the API's Google sign in, false when missing */
    completeOAuth() {
      const token = Cookies.get(OAUTH_TOKEN_COOKIE);
      if (!token) return false;
      Cookies.set("token", token, { expires: 7 });
      return true;
    },

    logout() {
      Cookies.remove("token");
      // Google sign in session, shared with the website on the parent domain
      for (const name of [OAUTH_TOKEN_COOKIE, OAUTH_USER_COOKIE]) {
        Cookies.remove(name, { path: "/", domain: oauthCookieDomain() });
      }
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
    list(params: ReportsParams = {}) {
      return request<ReportsResponse>(`/reports?${toClickQuery(params)}`);
    },
  },

  analytics: {
    clicks(params: AnalyticsParams = {}) {
      return request<AnalyticsClick[]>(`/analytics?${toClickQuery(params)}`);
    },
    referer(params: AnalyticsParams = {}) {
      return request<AnalyticsReferer[]>(`/analytics/referer?${toClickQuery(params)}`);
    },
    country(params: AnalyticsParams = {}) {
      return request<AnalyticsCountry[]>(`/analytics/country?${toClickQuery(params)}`);
    },
    top(params: AnalyticsParams = {}) {
      return request<AnalyticsTop[]>(`/analytics/top?${toClickQuery(params)}`);
    },
    browser(params: AnalyticsParams = {}) {
      return request<AnalyticsBrowser[]>(`/analytics/browser?${toClickQuery(params)}`);
    },
    os(params: AnalyticsParams = {}) {
      return request<AnalyticsOS[]>(`/analytics/os?${toClickQuery(params)}`);
    },
    device(params: AnalyticsParams = {}) {
      return request<AnalyticsDevice[]>(`/analytics/device?${toClickQuery(params)}`);
    },
  },

  meta: {
    fetch(url: string) {
      return request<UrlMeta>(`/public/meta?url=${encodeURIComponent(url)}`);
    },
  },

  profile: {
    get() {
      return request<Profile>("/profile");
    },
    me() {
      return request<AuthUser>("/profile/me");
    },
    update(data: { name: string }) {
      return request<Profile>("/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },

  subscription: {
    /**
     * Checkout for a paid plan. With Stripe `price` must match a Stripe price in USD,
     * PayPal charges the API's own price for the plan
     */
    checkout(data: { plan: string; price: number; gateway?: "Stripe" | "Paypal" }) {
      return request<{ id: string; url: string }>("/subscription/create-checkout-session", {
        method: "POST",
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

  domains: {
    list(params: { offset?: number; limit?: number } = {}) {
      const query = new URLSearchParams();
      if (params.offset !== undefined) query.set("offset", String(params.offset));
      if (params.limit !== undefined) query.set("limit", String(params.limit));
      return request<DomainsResponse>(`/domains?${query.toString()}`);
    },
    whitelisted() {
      return request<GlobalDomainsResponse>("/domains/whitelisted");
    },
    create(data: { domain: string; is_default?: boolean }) {
      return request<Domain>("/domains", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update(id: number, data: { user_id?: number; is_default?: boolean }) {
      return request<Domain>(`/domains/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete(id: number) {
      return request<{ message: string }>(`/domains/${id}`, { method: "DELETE" });
    },
    sendOtp(id: number, email: string) {
      return request<{ message: string }>(`/domains/${id}/otp`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    verify(id: number, code: number) {
      return request<Domain>(`/domains/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    },
    googleUrl(id: number) {
      return request<{ url: string }>(`/domains/${id}/google`);
    },
  },

  // ─── Admin (users with a level) ─────────────────────

  admin: {
    domains: {
      list(params: { type?: GlobalDomainType; offset?: number; limit?: number } = {}) {
        const query = new URLSearchParams();
        if (params.type) query.set("type", params.type);
        if (params.offset !== undefined) query.set("offset", String(params.offset));
        if (params.limit !== undefined) query.set("limit", String(params.limit));
        return request<GlobalDomainsResponse>(`/admin/domains?${query.toString()}`);
      },
      /** Whitelists or blocks a domain for every account, no verification needed */
      upsert(data: { domain: string; type: GlobalDomainType }) {
        return request<GlobalDomain>("/admin/domains", {
          method: "POST",
          body: JSON.stringify(data),
        });
      },
      delete(domain: string) {
        return request<{ message: string }>(
          `/admin/domains/${encodeURIComponent(domain)}`,
          { method: "DELETE" }
        );
      },
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
