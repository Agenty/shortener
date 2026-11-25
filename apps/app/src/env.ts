const local = {
  API_URL: "http://localhost:8787/v1",
  // Cloudflare's test key, always passes
  TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
};

const prod = {
  API_URL: "https://api.shortener.dev/v1",
  TURNSTILE_SITE_KEY: '0x4AAAAAAFqfpi-_6qVivLe1',
};

export const env = import.meta.env.DEV ? local : prod;

/** Host of every short link, kept separate from the main site domain */
export const SHORT_DOMAIN = 'srt1.link';

/** Public documentation, empty states and help menus link to pages under it */
export const DOCS_URL = 'https://shortener.dev/docs';
