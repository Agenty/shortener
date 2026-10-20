const local = {
  API_URL: "http://localhost:8787/v1",
  RECAPTCHA_KEY: '6LcYGPItAAAAAFKo3ghhnMs4_z-U6w8wuPXDT5p2',
};

const prod = {
  API_URL: "https://api.shortener.dev/v1",
  RECAPTCHA_KEY: '6LcYGPItAAAAAFKo3ghhnMs4_z-U6w8wuPXDT5p2',
};

export const env = import.meta.env.DEV ? local : prod;

/** Host of every short link, kept separate from the main site domain */
export const SHORT_DOMAIN = 'srt1.link';

/** Public documentation, empty states and help menus link to pages under it */
export const DOCS_URL = 'https://shortener.dev/docs';
