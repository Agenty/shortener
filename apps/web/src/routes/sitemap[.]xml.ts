import { createFileRoute } from '@tanstack/react-router';
import { alternatives } from '@/data/alternatives';
import { otherTools, shortenerTools } from '@/data/tools';
import { LOCALES, langTag } from '@/i18n/languages';
import { TRANSLATED_PATHS, localizePath } from '@/i18n/routing';
import { docPath, docs } from '@/lib/docs';
import { SITE_URL } from '@/lib/site';

/** English only, listed once */
const englishPaths = ['/alternatives', '/tools', '/report', '/terms', '/privacy'];

const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;

/** One entry per language, each listing every translation as an hreflang alternate */
const translatedEntries = (path: string) => {
  const alternates = [
    ...LOCALES.map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${langTag(locale)}" href="${absoluteUrl(localizePath(path, locale))}"/>`
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(path)}"/>`,
  ].join('\n');
  return LOCALES.map(
    (locale) => `  <url>\n    <loc>${absoluteUrl(localizePath(path, locale))}</loc>\n${alternates}\n  </url>`
  );
};

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const paths = [
          ...englishPaths,
          ...alternatives.map((item) => `/alternatives/${item.slug}`),
          ...[...shortenerTools, ...otherTools].map((tool) => `/tools/${tool.slug}`),
          ...docs.map((doc) => docPath(doc.slug)),
          '/docs/api',
        ];
        const urls = [
          ...TRANSLATED_PATHS.flatMap(translatedEntries),
          ...paths.map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`),
        ].join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          },
        });
      },
    },
  },
});
