import { createFileRoute } from '@tanstack/react-router';
import { alternatives } from '@/data/alternatives';
import { otherTools, shortenerTools } from '@/data/tools';
import { docPath, docs } from '@/lib/docs';
import { SITE_URL } from '@/lib/site';

const staticPaths = [
  '/',
  '/pricing',
  '/short-links-builder',
  '/lifetime-deal',
  '/alternatives',
  '/tools',
  '/about',
  '/contact',
  '/report',
  '/terms',
  '/privacy',
];

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const paths = [
          ...staticPaths,
          ...alternatives.map((item) => `/alternatives/${item.slug}`),
          ...[...shortenerTools, ...otherTools].map((tool) => `/tools/${tool.slug}`),
          ...docs.map((doc) => docPath(doc.slug)),
          '/docs/api',
        ];
        const urls = paths
          .map((path) => `  <url><loc>${SITE_URL}${path === '/' ? '' : path}</loc></url>`)
          .join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
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
