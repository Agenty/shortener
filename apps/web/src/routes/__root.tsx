/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { GithubStarToast } from '@/components/github-star-toast';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { NotFound } from '@/components/not-found';
import { I18nProvider, loadMessages, useI18n } from '@/i18n';
import { langTag, localeDir } from '@/i18n/languages';
import { splitLocale } from '@/i18n/routing';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import appCss from '@/styles.css?url';

export const Route = createRootRoute({
  // The router strips the language from the URL, read it back from the public href
  beforeLoad: async ({ location }) => {
    const { locale } = splitLocale(new URL(location.publicHref, SITE_URL).pathname);
    return { locale, messages: await loadMessages(locale) };
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'application-name', content: SITE_NAME },
      { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: '#0a0a0a', media: '(prefers-color-scheme: dark)' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'api-catalog', href: '/.well-known/api-catalog' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.svg`,
          parentOrganization: { '@type': 'Organization', name: 'Agenty Analytics Pvt. Ltd.' },
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  const { locale, messages } = Route.useRouteContext();
  return (
    <I18nProvider locale={locale} messages={messages}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </I18nProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  const { locale, t } = useI18n();
  return (
    <html lang={langTag(locale)} dir={localeDir(locale)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2"
          >
            {t.common.skipToContent}
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <GithubStarToast />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
