export const SITE_NAME = 'Shortener.dev';
export const SITE_URL = 'https://shortener.dev';
export const APP_URL = 'https://app.shortener.dev';
export const API_URL = import.meta.env.DEV
  ? 'http://localhost:8787/v1'
  : 'https://api.shortener.dev/v1';
export const SUPPORT_EMAIL = 'support@shortener.dev';
export const GITHUB_URL = 'https://github.com/dayschedule/idm';
export const OG_IMAGE = `${SITE_URL}/og.png`;

export const SIGNUP_URL = `${APP_URL}/signup`;
export const LOGIN_URL = `${APP_URL}/login`;

/** Short host shown in demos, e.g. `shortener.dev/summer-sale` */
export const SHORT_HOST = 'shortener.dev';
