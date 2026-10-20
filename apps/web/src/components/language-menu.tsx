import { useRouterState } from '@tanstack/react-router';
import { Check, Globe } from 'lucide-react';
import { useI18n } from '@/i18n';
import { SUPPORTED_LANGUAGES, langTag, type Locale } from '@/i18n/languages';
import { localizePath } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/** Shared with the dashboard on app.shortener.dev, which opens in the same language */
const rememberLanguage = (locale: Locale) => {
  const domain = window.location.hostname.endsWith('shortener.dev') ? '; domain=.shortener.dev' : '';
  document.cookie = `lang=${locale}; path=/; max-age=31536000; samesite=lax${domain}`;
};

/**
 * Plain links rather than router navigation: switching language reloads the
 * page in the new language, and crawlers find every translation from any page.
 */
function LanguageLinks({ className }: { className?: string }) {
  const { locale } = useI18n();
  const { pathname, searchStr } = useRouterState({
    select: (state) => ({ pathname: state.location.pathname, searchStr: state.location.searchStr }),
  });

  return (
    <ul className={className}>
      {SUPPORTED_LANGUAGES.map((language) => (
        <li key={language.code}>
          <a
            href={`${localizePath(pathname, language.code)}${searchStr}`}
            hrefLang={langTag(language.code)}
            lang={langTag(language.code)}
            onClick={() => rememberLanguage(language.code)}
            aria-current={language.code === locale ? 'true' : undefined}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-muted aria-[current]:font-medium"
          >
            <span aria-hidden="true">{language.flag}</span>
            <span className="flex-1">{language.label}</span>
            {language.code === locale && <Check className="size-3.5 text-muted-foreground" />}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Globe dropdown for the header, opens on hover and focus with CSS only */
export function LanguageMenu({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const current = SUPPORTED_LANGUAGES.find((language) => language.code === locale);

  return (
    <div className={cn('group/lang relative', className)}>
      <button
        type="button"
        aria-label={t.common.language}
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
      >
        <Globe className="size-4" />
        <span className="uppercase">{current?.code.split('-')[0]}</span>
      </button>
      <div className="invisible absolute top-full right-0 z-50 pt-2 opacity-0 transition-all group-focus-within/lang:visible group-focus-within/lang:opacity-100 group-hover/lang:visible group-hover/lang:opacity-100 rtl:right-auto rtl:left-0">
        <LanguageLinks className="grid max-h-[70vh] w-60 overflow-y-auto rounded-2xl border bg-popover p-2 shadow-xl" />
      </div>
    </div>
  );
}

/** Full list for the mobile menu */
export function LanguageList({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={className}>
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {t.common.language}
      </p>
      <LanguageLinks className="mt-2 grid grid-cols-2 gap-0.5 -mx-2.5" />
    </div>
  );
}
