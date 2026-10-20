import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import { DEFAULT_LOCALE, langTag, localeDir, matchLocale, type Locale } from "./languages";
import en, { type Messages } from "./messages/en";

export type { Messages };

const STORAGE_KEY = "lang";

// Each language is its own chunk, only the active one is downloaded
const loaders = import.meta.glob<{ default: Messages }>(["./messages/*.ts", "!./messages/en.ts"]);

export async function loadMessages(locale: Locale): Promise<Messages> {
  const load = loaders[`./messages/${locale}.ts`];
  if (locale === DEFAULT_LOCALE || !load) return en;
  return (await load()).default;
}

/** Same domain the website sets the `lang` cookie on */
const cookieDomain = () => {
  const { hostname } = window.location;
  return hostname.endsWith("shortener.dev") ? ".shortener.dev" : undefined;
};

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const persist = (locale: Locale) => {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage can be blocked, the cookie still carries the choice
  }
  Cookies.set(STORAGE_KEY, locale, { expires: 365, domain: cookieDomain(), sameSite: "lax" });
};

/**
 * `?lang=` from a website link, then the visitor's saved choice, the cookie
 * shared with the website, and the browser languages.
 */
export function detectLocale(): Locale {
  const url = new URL(window.location.href);
  const fromUrl = matchLocale(url.searchParams.get("lang"));
  if (fromUrl) {
    persist(fromUrl);
    url.searchParams.delete("lang");
    window.history.replaceState(window.history.state, "", url);
    return fromUrl;
  }
  return (
    matchLocale(readStored()) ??
    matchLocale(Cookies.get(STORAGE_KEY)) ??
    navigator.languages.map(matchLocale).find(Boolean) ??
    DEFAULT_LOCALE
  );
}

type I18n = {
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => Promise<void>;
};

const I18nContext = createContext<I18n>({
  locale: DEFAULT_LOCALE,
  t: en,
  setLocale: async () => {},
});

export function I18nProvider({
  initialLocale,
  initialMessages,
  children,
}: {
  initialLocale: Locale;
  initialMessages: Messages;
  children: ReactNode;
}) {
  const [state, setState] = useState({ locale: initialLocale, t: initialMessages });

  const setLocale = useCallback(async (locale: Locale) => {
    persist(locale);
    const messages = await loadMessages(locale);
    setState({ locale, t: messages });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = langTag(state.locale);
    root.dir = localeDir(state.locale);
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", state.t.meta.description);
  }, [state]);

  return (
    <I18nContext.Provider value={{ ...state, setLocale }}>{children}</I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);

/** `fmt("Resend in {seconds}s", { seconds: 30 })` → `Resend in 30s` */
export function fmt(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

/** Like `fmt`, with elements in place of the placeholders */
export function rich(template: string, values: Record<string, ReactNode>): ReactNode {
  return template.split(/(\{\w+\})/).map((part, index) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return <Fragment key={index}>{key && key in values ? values[key] : part}</Fragment>;
  });
}
