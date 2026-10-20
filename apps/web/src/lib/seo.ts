import { DEFAULT_LOCALE, LOCALES, type Locale, langTag, ogLocale } from '@/i18n/languages';
import { localizePath } from '@/i18n/routing';
import { OG_IMAGE, SITE_NAME, SITE_URL } from './site';

type SeoInput = {
  title: string;
  description: string;
  /** Path of the page, e.g. `/pricing` */
  path: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** JSON-LD objects to embed in the page */
  jsonLd?: Array<Record<string, unknown>>;
  /**
   * Language of a translated page. Adds the localized canonical, hreflang
   * alternates for every language and `og:locale`. Leave it out on English-only
   * pages so their `/{locale}` copies canonicalize to English.
   */
  locale?: Locale;
};

const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`;

/**
 * Title, description, canonical, Open Graph, Twitter card and JSON-LD for a
 * route's `head()`. Every page goes through this so none ships without meta.
 */
export function seo({
  title,
  description,
  path,
  image = OG_IMAGE,
  type = 'website',
  noindex,
  jsonLd = [],
  locale,
}: SeoInput) {
  const url = absoluteUrl(locale ? localizePath(path, locale) : path);
  const fullTitle = path === '/' ? title : `${title} | ${SITE_NAME}`;
  const alternates = locale
    ? [
        ...LOCALES.map((alt) => ({
          rel: 'alternate',
          hrefLang: langTag(alt),
          href: absoluteUrl(localizePath(path, alt)),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: absoluteUrl(path) },
      ]
    : [];

  return {
    meta: [
      { title: fullTitle },
      { name: 'description', content: description },
      { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow' },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { property: 'og:locale', content: ogLocale(locale ?? DEFAULT_LOCALE) },
      ...(locale
        ? LOCALES.filter((alt) => alt !== locale).map((alt) => ({
            property: 'og:locale:alternate',
            content: ogLocale(alt),
          }))
        : []),
    ],
    links: [{ rel: 'canonical', href: url }, ...alternates],
    scripts: jsonLd.map((data) => ({
      type: 'application/ld+json',
      children: JSON.stringify({ '@context': 'https://schema.org', ...data }),
    })),
  };
}

export const faqJsonLd = (faqs: Array<{ q: string; a: string }>) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
});

export const breadcrumbJsonLd = (items: Array<{ name: string; path: string }>) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

export const softwareJsonLd = {
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'URL shortener with branded links, click analytics, device and geo targeting, and an API.',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '0',
    highPrice: '99',
  },
};
