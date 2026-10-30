import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Copy, Globe, LineChart, MousePointerClick, ShieldCheck, Sparkles } from 'lucide-react';
import { BrowserFrame } from '@/components/browser-frame';
import { StoreButtons } from '@/components/extension';
import { Faq } from '@/components/faq';
import { PageHero } from '@/components/page-hero';
import { Eyebrow, Section, SectionHeader, Showcase } from '@/components/section';
import { extensionFaqs } from '@/data/extension';
import { breadcrumbJsonLd, faqJsonLd, seo } from '@/lib/seo';
import { CHROME_EXTENSION_URL, GITHUB_URL, SITE_NAME } from '@/lib/site';

export const Route = createFileRoute('/extension/')({
  head: () =>
    seo({
      title: 'URL Shortener Extension for Chrome and Firefox',
      description:
        'Shorten the page you are on in one click, right click any link to shorten it, and see link clicks in the browser side panel. Free for Chrome and Firefox.',
      path: '/extension',
      jsonLd: [
        {
          '@type': 'SoftwareApplication',
          name: `${SITE_NAME} - URL Shortener`,
          applicationCategory: 'BrowserApplication',
          operatingSystem: 'Chrome, Firefox',
          downloadUrl: CHROME_EXTENSION_URL,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        breadcrumbJsonLd([
          { name: SITE_NAME, path: '/' },
          { name: 'Browser extension', path: '/extension' },
        ]),
        faqJsonLd(extensionFaqs),
      ],
    }),
  component: ExtensionPage,
});

const features = [
  {
    icon: MousePointerClick,
    title: 'One click from the toolbar',
    body: 'The panel opens with the current tab already filled in. Add a back-half like summer-sale if you want one.',
  },
  {
    icon: Copy,
    title: 'Copied before you look for it',
    body: 'The short link goes to your clipboard as soon as it is created, so you can paste it straight into a post or an email.',
  },
  {
    icon: Sparkles,
    title: 'Right click any link',
    body: 'Shorten this link and Shorten this page sit in the context menu, so you can grab links from search results or a newsletter without opening them.',
  },
  {
    icon: LineChart,
    title: 'Clicks next to every link',
    body: 'Recent links show their click count, and every link has its own chart with referrers, countries, devices and browsers.',
  },
  {
    icon: Globe,
    title: 'Your own website',
    body: 'Add your domain and verify it with an email code or Google Search Console without leaving the panel.',
  },
  {
    icon: ShieldCheck,
    title: 'Small set of permissions',
    body: 'No access to all sites, no content scripts and no history. The extension sees a tab address only when you open it there.',
  },
];

const screens = [
  {
    name: 'links',
    url: 'shortener.dev',
    eyebrow: 'Links',
    tone: 'blue',
    title: 'All your short links, beside the page you are reading.',
    description:
      'Search by back-half or destination, copy a link again, or open it to see its numbers. Click counts cover the last 30 days.',
    doc: { slug: 'browser-extension', label: 'How the panel works' },
  },
  {
    name: 'analytics',
    url: 'shortener.dev/docs',
    eyebrow: 'Analytics',
    tone: 'violet',
    title: 'See which link is working without opening a dashboard.',
    description:
      'Clicks per day, top links, referrers, countries, devices, browsers and operating systems, for the whole account or one link.',
    doc: { slug: 'click-analytics', label: 'Reading click analytics' },
  },
  {
    name: 'domains',
    url: 'github.com/Agenty/shortener',
    eyebrow: 'Domains',
    tone: 'green',
    title: 'Verify your website without leaving the page.',
    description:
      'Popular sites work right away. For your own domain, send a code to an address on it or connect Google Search Console, then link to any page on it.',
    doc: { slug: 'verify-domain', label: 'Verify a domain' },
  },
] as const;

function ExtensionPage() {
  return (
    <>
      <PageHero
        eyebrow="Chrome and Firefox extension"
        tone="blue"
        title="Shorten the page you are on."
        accent="Without leaving it."
        description="The Shortener.dev extension opens in your browser's side panel. Click the toolbar icon, press Shorten link, and the short link is on your clipboard. Your links and their clicks stay one click away."
      >
        <StoreButtons className="mt-8" />
        <p className="mt-4 text-sm text-muted-foreground">
          Free, works with a free Shortener.dev account. Also runs in Edge, Brave and Opera.
        </p>
      </PageHero>

      <div className="container">
        <Showcase className="mt-0">
          <BrowserFrame url="github.com/Agenty/shortener" label="Side panel">
            <img
              src="/images/extension/shorten.webp"
              alt="The Shortener.dev side panel next to a GitHub page, with the page URL filled in and a custom back-half"
              width={1158}
              height={609}
              loading="eager"
              decoding="async"
              className="block h-auto w-full"
            />
          </BrowserFrame>
        </Showcase>
      </div>

      <Section>
        <SectionHeader
          eyebrow="How it works"
          tone="amber"
          title="Three steps, and the first one you only do once."
          points={[
            'Add the extension and pin it to the toolbar',
            'Sign in with your Shortener.dev account',
            'Open any page and click Shorten link',
          ]}
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="bg-background p-6">
              <item.icon className="size-5 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {screens.map((screen, index) => (
        <Section key={screen.name} surface={index % 2 === 0}>
          <SectionHeader
            eyebrow={screen.eyebrow}
            tone={screen.tone}
            title={screen.title}
            description={screen.description}
          />
          <Link
            to="/docs/$slug"
            params={{ slug: screen.doc.slug }}
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            {screen.doc.label} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <Showcase>
            <BrowserFrame url={screen.url}>
              <img
                src={`/images/extension/${screen.name}.webp`}
                alt={`${screen.eyebrow} in the Shortener.dev extension side panel`}
                width={1158}
                height={609}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
            </BrowserFrame>
          </Showcase>
        </Section>
      ))}

      <Section>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:gap-16">
          <div>
            <Eyebrow tone="green">Privacy</Eyebrow>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              It only sees the tab you open it on.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              The extension asks for four permissions and none of them lets it read pages. It never runs on a
              website in the background, and the code is{' '}
              <a href={`${GITHUB_URL}/tree/main/apps/extension`} className="underline underline-offset-2">
                on GitHub
              </a>{' '}
              if you want to check.
            </p>
          </div>
          <dl className="divide-y border-y text-[15px]">
            {[
              ['activeTab', 'The address of the tab where you open the panel'],
              ['storage', 'Your sign in token and theme, kept in the browser'],
              ['contextMenus', 'The two right click menu items'],
              ['sidePanel', 'Showing the panel (Chrome only)'],
            ].map(([name, why]) => (
              <div key={name} className="flex items-baseline gap-4 py-3.5">
                <dt className="w-28 shrink-0 font-mono text-xs text-muted-foreground">{name}</dt>
                <dd>{why}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section surface>
        <Faq faqs={extensionFaqs} title="Questions about the extension" />
        <p className="mt-10 text-sm text-muted-foreground">
          Step by step guide with screenshots:{' '}
          <Link to="/docs/$slug" params={{ slug: 'browser-extension' }} className="font-medium text-foreground underline underline-offset-2">
            Shorten links from Chrome and Firefox
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
