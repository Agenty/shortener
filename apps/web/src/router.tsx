import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { NotFound } from '@/components/not-found';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/languages';
import { localizePath, splitLocale } from '@/i18n/routing';

export function getRouter() {
  // One router per request on the server, so this never leaks across visitors
  let locale: Locale = DEFAULT_LOCALE;

  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultNotFoundComponent: NotFound,
    // Routes are defined without the language, `/fr/pricing` matches `/pricing`
    // and every link built on a French page gets the `/fr` prefix back
    rewrite: {
      input: ({ url }) => {
        const parsed = splitLocale(url.pathname);
        locale = parsed.locale;
        url.pathname = parsed.pathname;
        return url;
      },
      output: ({ url }) => {
        url.pathname = localizePath(url.pathname, locale);
        return url;
      },
    },
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
