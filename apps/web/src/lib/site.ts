export const SITE_NAME = 'Shortener.dev';
export const SITE_URL = 'https://shortener.dev';
export const APP_URL = 'https://app.shortener.dev';
export const API_URL = import.meta.env.DEV
  ? 'http://localhost:8787/v1'
  : 'https://api.shortener.dev/v1';
/** Cloudflare Turnstile, the test key in development always passes */
export const TURNSTILE_SITE_KEY = import.meta.env.DEV
  ? '1x00000000000000000000AA'
  : '0x4AAAAAAFqfpi-_6qVivLe1';
/** The OpenAPI spec is served from the API root, outside `/v1` */
export const OPENAPI_URL = `${API_URL.replace(/\/v1$/, '')}/openapi.json`;
export const DOCS_URL = `${SITE_URL}/docs`;
export const SUPPORT_EMAIL = 'support@shortener.dev';
export const GITHUB_URL = 'https://github.com/Agenty/shortener';
export const AGENTY_URL = 'https://agenty.com';
export const OG_IMAGE = `${SITE_URL}/og.png`;

export const SIGNUP_URL = `${APP_URL}/signup`;
export const LOGIN_URL = `${APP_URL}/login`;

/** Host of every short link, e.g. `srt1.link/summer-sale`. The main domain never serves short links */
export const SHORT_HOST = 'srt1.link';
