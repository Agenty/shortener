/**
 * Languages of the marketing site. English is the default and has no URL
 * prefix, every other language lives under `/{code}`, e.g. `/fr/pricing`.
 * Keep in sync with `apps/app/src/i18n/languages.ts`.
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'et', label: 'Eesti', flag: '🇪🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
] as const;

export type Locale = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export const DEFAULT_LOCALE: Locale = 'en-US';

export const LOCALES = SUPPORTED_LANGUAGES.map((language) => language.code) as Locale[];

const RTL_LOCALES = new Set<Locale>(['ar', 'he']);

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as string[]).includes(value);

export const localeDir = (locale: Locale) => (RTL_LOCALES.has(locale) ? 'rtl' : 'ltr');

/**
 * BCP 47 tag for `<html lang>` and `hreflang`. `est` is the ISO 639-2 code,
 * browsers and search engines expect the two-letter `et`.
 */
export const langTag = (locale: Locale) => (locale);

/** Open Graph wants `ll_CC` */
const OG_LOCALES: Record<Locale, string> = {
  ar: 'ar_AR',
  zh: 'zh_CN',
  da: 'da_DK',
  nl: 'nl_NL',
  'en-US': 'en_US',
  et: 'et_EE',
  fr: 'fr_FR',
  de: 'de_DE',
  el: 'el_GR',
  he: 'he_IL',
  hi: 'hi_IN',
  id: 'id_ID',
  it: 'it_IT',
  ja: 'ja_JP',
  ko: 'ko_KR',
  pt: 'pt_BR',
  ru: 'ru_RU',
  es: 'es_ES',
  sv: 'sv_SE',
  th: 'th_TH',
  tr: 'tr_TR',
  vi: 'vi_VN',
};

export const ogLocale = (locale: Locale) => OG_LOCALES[locale];
