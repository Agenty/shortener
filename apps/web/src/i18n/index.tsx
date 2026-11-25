import { createContext, Fragment, useContext, type ReactNode } from 'react';
import { DEFAULT_LOCALE, type Locale } from './languages';
import en, { type Messages } from './messages/en';

export type { Messages };

// Each language is its own chunk, a page only downloads the one it renders
const loaders = import.meta.glob<{ default: Messages }>(['./messages/*.ts', '!./messages/en.ts']);

export async function loadMessages(locale: Locale): Promise<Messages> {
  const load = loaders[`./messages/${locale}.ts`];
  if (locale === DEFAULT_LOCALE || !load) return en;
  return (await load()).default;
}

type I18n = { locale: Locale; t: Messages };

const I18nContext = createContext<I18n>({ locale: DEFAULT_LOCALE, t: en });

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, t: messages }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

/** `fmt('Only {left} left', { left: 3 })` → `Only 3 left` */
export function fmt(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

/** Like `fmt`, with elements in place of the placeholders, e.g. a link inside a sentence */
export function rich(template: string, values: Record<string, ReactNode>): ReactNode {
  return template.split(/(\{\w+\})/).map((part, index) => {
    const key = /^\{(\w+)\}$/.exec(part)?.[1];
    return <Fragment key={index}>{key && key in values ? values[key] : part}</Fragment>;
  });
}

/** Opens the dashboard in the visitor's language, e.g. `app.shortener.dev/signup?lang=fr` */
export function withLang(url: string, locale: Locale) {
  if (locale === DEFAULT_LOCALE) return url;
  return `${url}${url.includes('?') ? '&' : '?'}lang=${locale}`;
}
