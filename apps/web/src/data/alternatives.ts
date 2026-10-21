export const categories = [
  'Link management platforms',
  'Simple URL shorteners',
  'Open-source shorteners',
] as const;

export type Category = (typeof categories)[number];

export type Alternative = {
  slug: string;
  name: string;
  domain: string;
  website: string;
  pricingUrl: string;
  category: Category;
  /** One line for the index card */
  positioning: string;
  /** Hero paragraph on the detail page */
  summary: string;
  /** Why shortener.dev is a good alternative */
  angle: string;
  /** When the competitor may be the better fit */
  bestFor: string;
  considerations: string[];
  /** Keyed by `comparisonFeatures[].key`; missing cells render as "See their docs" */
  cells: Partial<Record<FeatureKey, string>>;
};

export type FeatureKey =
  | 'pricing'
  | 'free'
  | 'domains'
  | 'analytics'
  | 'targeting'
  | 'protection'
  | 'preview'
  | 'api'
  | 'hosting';

export const comparisonFeatures: Array<{ key: FeatureKey; label: string; ours: string }> = [
  { key: 'pricing', label: 'Pricing', ours: 'From $9 a month, or $99 one-time' },
  { key: 'free', label: 'Free plan', ours: '50 links with 7 days of analytics' },
  { key: 'domains', label: 'Domains', ours: '1 to 25 whitelisted domains, by plan' },
  {
    key: 'analytics',
    label: 'Click analytics',
    ours: 'Country, city, referrer, browser, OS and device, 7 days to 3 years by plan',
  },
  {
    key: 'targeting',
    label: 'Device and geo targeting',
    ours: 'iOS, Android and per-country destinations on every plan',
  },
  {
    key: 'protection',
    label: 'Expiration and passwords',
    ours: 'Both, on every plan',
  },
  {
    key: 'preview',
    label: 'Social preview cards',
    ours: 'Custom title, description and image per link',
  },
  { key: 'api', label: 'REST API', ours: 'OpenAPI-documented API on paid plans' },
  { key: 'hosting', label: 'Hosting', ours: 'Managed, on Cloudflare’s global network' },
];

const managedAngle = (name: string) =>
  `Shortener.dev covers the link features most teams use from ${name} (click analytics, UTM parameters, expiration, passwords, device and geo targeting) and keeps every link option available on every plan. Paid plans start at $9 a month, and there is a one-time lifetime option.`;

export const alternatives: Alternative[] = [
  {
    slug: 'bitly-alternative',
    name: 'Bitly',
    domain: 'bitly.com',
    website: 'https://bitly.com/',
    pricingUrl: 'https://bitly.com/pages/pricing',
    category: 'Link management platforms',
    positioning:
      'The best-known link shortener, with QR codes and link-in-bio pages for large brands.',
    summary:
      'Bitly is the most widely recognized URL shortener, with branded domains, QR codes and link-in-bio pages, and plans that scale up to enterprise contracts. Shortener.dev focuses on short links and their analytics, with all link options on every plan.',
    angle: managedAngle('Bitly'),
    bestFor:
      'You need QR code and link-in-bio management in the same tool, or an enterprise agreement with a long-established vendor.',
    considerations: [
      'Check which link options (deep links, redirects after creation) are limited to higher Bitly tiers before comparing price.',
      'Count how many links you create per month; both products price by monthly link volume.',
    ],
    cells: {
      pricing: 'Free plan, paid tiers billed monthly or yearly',
      free: 'Yes, with monthly link and QR code limits',
      domains: 'On paid plans',
      analytics: 'Yes, history depends on plan',
      targeting: 'Mobile deep links; check plan',
      protection: 'Check plan',
      preview: 'Check plan',
      api: 'Yes',
      hosting: 'Managed SaaS',
    },
  },
  {
    slug: 'rebrandly-alternative',
    name: 'Rebrandly',
    domain: 'rebrandly.com',
    website: 'https://www.rebrandly.com/',
    pricingUrl: 'https://www.rebrandly.com/pricing',
    category: 'Link management platforms',
    positioning: 'Branded links first, with domain management and team workspaces.',
    summary:
      'Rebrandly is built around branded short links, with tools to buy and manage domains, team workspaces and an API. Shortener.dev offers the same core link options at a lower entry price.',
    angle: managedAngle('Rebrandly'),
    bestFor:
      'You manage many branded domains and want to register them through the same vendor.',
    considerations: [
      'Compare how many custom domains each plan includes against the domains you already own.',
      'Check the click-history retention on the plan you would pick.',
    ],
    cells: {
      pricing: 'Free plan, paid tiers',
      free: 'Yes, limited links',
      domains: 'Yes, central to the product',
      analytics: 'Yes',
      targeting: 'Check plan',
      protection: 'Check plan',
      api: 'Yes',
      hosting: 'Managed SaaS',
    },
  },
  {
    slug: 'shortio-alternative',
    name: 'Short.io',
    domain: 'short.io',
    website: 'https://short.io/',
    pricingUrl: 'https://short.io/pricing',
    category: 'Link management platforms',
    positioning: 'Branded short links on your own domains, popular with small businesses.',
    summary:
      'Short.io lets small teams create branded links on their own domains, with click statistics, targeting and an API. Shortener.dev is a close fit with simpler pricing and a lifetime option.',
    angle: managedAngle('Short.io'),
    bestFor: 'You want a free plan on your own domain from day one.',
    considerations: [
      'Compare the monthly link limits on the plan you need; both products count new links per month.',
      'Check which integrations you rely on, since Short.io has a broader integration list.',
    ],
    cells: {
      pricing: 'Free plan, paid tiers',
      free: 'Yes, on a custom domain',
      domains: 'Yes, multiple domains',
      analytics: 'Yes',
      targeting: 'Yes, device and geo',
      protection: 'Yes, on paid plans',
      api: 'Yes',
      hosting: 'Managed SaaS',
    },
  },
  {
    slug: 'blink-alternative',
    name: 'BL.INK',
    domain: 'bl.ink',
    website: 'https://www.bl.ink/',
    pricingUrl: 'https://www.bl.ink/pricing',
    category: 'Link management platforms',
    positioning: 'Enterprise link management with governance and integrations.',
    summary:
      'BL.INK targets enterprise marketing teams with branded links, governance features and integrations. Shortener.dev suits teams that want the same link options without an enterprise sales cycle.',
    angle: managedAngle('BL.INK'),
    bestFor: 'You need enterprise governance, SSO and procurement support from day one.',
    considerations: [
      'If you mainly need branded links and click analytics, check whether a self-serve plan covers you.',
      'Ask both vendors about link retention and data export before migrating.',
    ],
    cells: {
      pricing: 'Paid tiers and enterprise contracts',
      domains: 'Yes',
      analytics: 'Yes',
      api: 'Yes',
      hosting: 'Managed SaaS',
    },
  },
  {
    slug: 'tinyurl-alternative',
    name: 'TinyURL',
    domain: 'tinyurl.com',
    website: 'https://tinyurl.com/',
    pricingUrl: 'https://tinyurl.com/app/pricing',
    category: 'Simple URL shorteners',
    positioning: 'One of the oldest shorteners, free to use without an account.',
    summary:
      'TinyURL has shortened links since 2002 and still lets anyone shorten a URL without signing up, with paid plans for branded domains and analytics. Shortener.dev adds targeting, social previews and detailed analytics to the free plan.',
    angle:
      'If you started on TinyURL and now want to know who clicks, Shortener.dev adds country, referrer and device analytics, plus device and geo targeting, UTM parameters and social preview cards on every plan.',
    bestFor: 'You only need a quick, anonymous short link and no analytics.',
    considerations: [
      'Anonymous links are convenient but cannot be edited or tracked later.',
      'Check whether your existing TinyURL links need to keep working before you switch.',
    ],
    cells: {
      pricing: 'Free shortening, paid tiers',
      free: 'Yes, even without an account',
      domains: 'On paid plans',
      analytics: 'On paid plans',
      api: 'Yes',
      hosting: 'Managed SaaS',
    },
  },
  {
    slug: 'tly-alternative',
    name: 'T.LY',
    domain: 't.ly',
    website: 'https://t.ly/',
    pricingUrl: 'https://t.ly/pricing',
    category: 'Simple URL shorteners',
    positioning: 'A fast shortener with browser extensions and a very short domain.',
    summary:
      'T.LY offers a very short domain, browser extensions and paid plans with custom domains and analytics. Shortener.dev focuses on per-link options and team features for marketing campaigns.',
    angle:
      'Shortener.dev gives each link expiration, password, UTM parameters, social preview, device and geo targeting, organizes links into projects and lets your team share one account.',
    bestFor: 'You shorten links mostly from the browser toolbar and want the shortest domain.',
    considerations: [
      'Check whether you need team members and projects, or a single-user account is enough.',
    ],
    cells: {
      pricing: 'Free plan, paid tiers',
      free: 'Yes',
      domains: 'On paid plans',
      analytics: 'Yes',
      api: 'Yes',
      hosting: 'Managed SaaS',
    },
  },
  {
    slug: 'dubco-alternative',
    name: 'Dub.co',
    domain: 'dub.co',
    website: 'https://dub.co/',
    pricingUrl: 'https://dub.co/pricing',
    category: 'Open-source shorteners',
    positioning: 'Open-source link management with conversion and affiliate tracking.',
    summary:
      'Dub is an open-source link management platform with a hosted version, analytics, and conversion and partner tracking. Shortener.dev focuses on short links and click analytics with simpler pricing.',
    angle: managedAngle('Dub'),
    bestFor:
      'You need conversion attribution or an affiliate program built into your link tool.',
    considerations: [
      'Self-hosting Dub requires running several services; compare that effort with a managed plan.',
      'Check where each plan’s targeting features start.',
    ],
    cells: {
      pricing: 'Free plan, paid tiers',
      free: 'Yes',
      domains: 'Yes',
      analytics: 'Yes',
      targeting: 'Yes, on paid plans',
      protection: 'Yes, on paid plans',
      preview: 'Yes',
      api: 'Yes',
      hosting: 'Managed SaaS or self-hosted',
    },
  },
  {
    slug: 'kutt-alternative',
    name: 'Kutt',
    domain: 'kutt.it',
    website: 'https://kutt.it/',
    pricingUrl: 'https://github.com/thedevs-network/kutt',
    category: 'Open-source shorteners',
    positioning: 'A free, open-source shortener you can self-host.',
    summary:
      'Kutt is a free and open-source URL shortener with custom domains, link expiration, passwords and basic statistics, designed to be self-hosted. Shortener.dev gives you a managed alternative with deeper analytics and targeting.',
    angle:
      'Shortener.dev runs on Cloudflare’s network, so there is no server, database or backup to maintain, and adds device and geo targeting, social preview cards and team accounts.',
    bestFor: 'You want full control of the data on your own server and are fine maintaining it.',
    considerations: [
      'Self-hosting means you own uptime, updates, backups and abuse handling.',
    ],
    cells: {
      pricing: 'Free, open source',
      free: 'Yes',
      domains: 'Yes',
      analytics: 'Basic statistics',
      protection: 'Yes',
      api: 'Yes',
      hosting: 'Self-hosted',
    },
  },
  {
    slug: 'yourls-alternative',
    name: 'YOURLS',
    domain: 'yourls.org',
    website: 'https://yourls.org/',
    pricingUrl: 'https://github.com/YOURLS/YOURLS',
    category: 'Open-source shorteners',
    positioning: 'The classic self-hosted PHP shortener with a plugin ecosystem.',
    summary:
      'YOURLS (Your Own URL Shortener) is a long-running open-source PHP and MySQL project with a plugin system. Shortener.dev is a managed option with team accounts, targeting and modern analytics.',
    angle:
      'Shortener.dev replaces the server, plugins and updates with a managed service, with device and geo targeting, social previews, projects and team members built in.',
    bestFor: 'You already run PHP hosting and want to extend a shortener with plugins.',
    considerations: ['Several YOURLS features depend on third-party plugins and their upkeep.'],
    cells: {
      pricing: 'Free, open source',
      free: 'Yes',
      domains: 'Your own domain',
      analytics: 'Basic statistics',
      api: 'Yes',
      hosting: 'Self-hosted (PHP, MySQL)',
    },
  },
  {
    slug: 'shlink-alternative',
    name: 'Shlink',
    domain: 'shlink.io',
    website: 'https://shlink.io/',
    pricingUrl: 'https://shlink.io/documentation/',
    category: 'Open-source shorteners',
    positioning: 'A self-hosted, API-first shortener with multi-domain support.',
    summary:
      'Shlink is an open-source, self-hosted URL shortener with a REST API, multiple domains, visit tracking and redirect rules. Shortener.dev gives you similar capabilities as a managed service.',
    angle:
      'Shortener.dev offers an API, multiple domains and device and geo targeting without running your own containers, with a dashboard and team accounts for non-developers.',
    bestFor: 'You are a developer who wants to run the shortener inside your own infrastructure.',
    considerations: ['You will maintain the database, GeoIP updates and the web client yourself.'],
    cells: {
      pricing: 'Free, open source',
      free: 'Yes',
      domains: 'Yes, multiple',
      analytics: 'Visit tracking',
      targeting: 'Redirect rules',
      api: 'Yes, API-first',
      hosting: 'Self-hosted',
    },
  },
];

export const getAlternative = (slug: string) => alternatives.find((item) => item.slug === slug);

export const featuredAlternatives = ['bitly-alternative', 'rebrandly-alternative', 'shortio-alternative', 'dubco-alternative'];
