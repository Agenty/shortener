import { DEFAULT_LOCALE, LOCALES, type Locale } from './languages';

/**
 * Pages with translated content. They get hreflang alternates and a sitemap
 * entry per language. Every other page (docs, tools, comparisons, legal) is
 * English only: it still renders under `/{locale}` with the translated header
 * and footer, but its canonical URL is the English one.
 */
export const TRANSLATED_PATHS = [
  '/',
  '/pricing',
  '/short-links-builder',
  '/lifetime-deal',
  '/enterprise',
  '/about',
  '/contact',
] as const;

const PREFIXES = new Map(LOCALES.map((locale) => [locale.toLowerCase(), locale]));

/** `/fr/pricing` → `{ locale: 'fr', pathname: '/pricing' }`, unprefixed paths are English */
export function splitLocale(pathname: string): { locale: Locale; pathname: string } {
  const match = /^\/([^/]+)(\/.*)?$/.exec(pathname);
  const locale = match ? PREFIXES.get(match[1].toLowerCase()) : undefined;
  if (!match || !locale) return { locale: DEFAULT_LOCALE, pathname };
  return { locale, pathname: match[2] || '/' };
}

/** `/pricing` in French → `/fr/pricing`, English stays unprefixed */
export function localizePath(pathname: string, locale: Locale) {
  if (locale === DEFAULT_LOCALE) return pathname;
  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
}

export const isTranslatedPath = (pathname: string) =>
  (TRANSLATED_PATHS as readonly string[]).includes(pathname);
