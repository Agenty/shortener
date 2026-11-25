import { useEffect, useState } from 'react';

/**
 * Session shared with the API's Google sign in, which sets the same
 * `auth_token` and `auth_user` cookies on `.shortener.dev`.
 */
export type AuthUser = {
  token: string;
  name?: string;
  email?: string;
  avatar?: string;
};

const TOKEN_COOKIE = 'auth_token';
const USER_COOKIE = 'auth_user';
const MAX_AGE = 86400 * 15;
const AUTH_EVENT = 'shortener:auth';

const readCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

const writeCookie = (name: string, value: string, maxAge: number) => {
  const { hostname, protocol } = window.location;
  const domain = hostname.endsWith('shortener.dev') ? '; domain=.shortener.dev' : '';
  const secure = protocol === 'https:' ? '; secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax${domain}${secure}`;
};

export const getAuth = (): AuthUser | null => {
  const token = readCookie(TOKEN_COOKIE);
  if (!token) return null;
  try {
    return { ...JSON.parse(readCookie(USER_COOKIE) || '{}'), token };
  } catch {
    return { token };
  }
};

export const setAuth = (user: AuthUser) => {
  const { name, email, avatar } = user;
  writeCookie(TOKEN_COOKIE, user.token, MAX_AGE);
  writeCookie(USER_COOKIE, JSON.stringify({ name, email, avatar }), MAX_AGE);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearAuth = () => {
  writeCookie(TOKEN_COOKIE, '', 0);
  writeCookie(USER_COOKIE, '', 0);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

/** Signed in visitor, `null` until the cookies are read on the client */
export function useAuth() {
  const [auth, setState] = useState<AuthUser | null>(null);

  useEffect(() => {
    const sync = () => setState(getAuth());
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    return () => window.removeEventListener(AUTH_EVENT, sync);
  }, []);

  return auth;
}
