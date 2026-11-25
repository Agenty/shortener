/**
 * Languages of the dashboard. Keep in sync with
 * `apps/web/src/i18n/languages.ts`, the website hands its language over
 * with `?lang=` and the shared `lang` cookie.
 */
export const SUPPORTED_LANGUAGES = [
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "en-US", label: "English", flag: "🇺🇸" },
  { code: "est", label: "Eesti", flag: "🇪🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
  { code: "he", label: "עברית", flag: "🇮🇱" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
] as const;

export type Locale = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en-US";

const LOCALES = SUPPORTED_LANGUAGES.map((language) => language.code) as Locale[];

const RTL_LOCALES = new Set<Locale>(["ar", "he"]);

export const localeDir = (locale: Locale) => (RTL_LOCALES.has(locale) ? "rtl" : "ltr");

/** BCP 47 tag for `<html lang>`, `est` is ISO 639-2 and browsers expect `et` */
export const langTag = (locale: Locale) => (locale === "est" ? "et" : locale);

/** Exact code, or the first language with the same base, e.g. `pt-BR` → `pt`, `et` → `est` */
export function matchLocale(value: string | null | undefined): Locale | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  const exact = LOCALES.find((locale) => locale.toLowerCase() === lower);
  if (exact) return exact;
  const base = lower.split("-")[0];
  return LOCALES.find((locale) => langTag(locale).split("-")[0].toLowerCase() === base);
}
