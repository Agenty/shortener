import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  FolderKanban,
  Globe,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import { BrowserFrame, ThemedScreenshot } from '@/components/browser-frame';
import { Faq } from '@/components/faq';
import { ToolIcon } from '@/components/tool-icon';
import { LinkBuilder } from '@/components/link-builder';
import { AnalyticsMockup, ApiMockup, TargetingMockup } from '@/components/mockups';
import { PricingCards } from '@/components/pricing-cards';
import { Eyebrow, Section, SectionHeader, Showcase } from '@/components/section';
import { buttonVariants } from '@/components/ui/button';
import { otherTools, shortenerTools } from '@/data/tools';
import { faqJsonLd, seo, softwareJsonLd } from '@/lib/seo';
import { API_URL, SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'What is a URL shortener?',
    a: 'A URL shortener turns a long web address into a short link, like shortener.dev/spring, that redirects to the original page. Short links are easier to share and let you count the clicks.',
  },
  {
    q: 'Is Shortener.dev free?',
    a: 'Yes. The free plan includes 10 short links with click analytics, and you can shorten a link without an account from the form on this page. Paid plans start at $29 a month.',
  },
  {
    q: 'Can I change where a short link points after I share it?',
    a: 'Yes. Edit the destination at any time from the dashboard or the API, and the same short link sends visitors to the new page.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes. Paid plans include custom domains, so your links can look like go.yourbrand.com/offer.',
  },
  {
    q: 'What does the click analytics include?',
    a: 'Clicks over time with country, city, referrer, browser, operating system and device, plus raw click reports on paid plans.',
  },
  {
    q: 'How do you stop abuse?',
    a: 'Destinations are checked against blocklists and safe browsing services before a link is created, and anyone can report a suspicious short link.',
  },
];

export const Route = createFileRoute('/')({
  head: () =>
    seo({
      title: 'Shortener.dev - URL shortener with click analytics',
      description:
        'Free URL shortener to create short links on your own domain, with click analytics, UTM builder, expiration, passwords, device and geo targeting, and an API.',
      path: '/',
      jsonLd: [softwareJsonLd, faqJsonLd(faqs)],
    }),
  component: Home,
});

const steps = ['Paste a long link', 'Share the short one', 'Read the clicks'];

const extras = [
  { icon: Globe, title: 'Custom domains', body: 'Short links on go.yourbrand.com instead of a generic domain.' },
  { icon: FolderKanban, title: 'Projects', body: 'Group links by campaign, client or brand.' },
  { icon: Users, title: 'Team members', body: 'Invite colleagues to create and manage links together.' },
  { icon: CalendarClock, title: 'Expiration', body: 'Links stop working after the date you set.' },
  { icon: ShieldCheck, title: 'Safe by default', body: 'Destinations are checked before a link goes live.' },
  { icon: Zap, title: 'Fast redirects', body: 'Served from Cloudflare’s network, close to every visitor.' },
];

function Home() {
  return (
    <>
      {/* Hero */}
      <div className="container pt-14 md:pt-24">
        <h1 className="text-5xl leading-[1.02] font-semibold tracking-[-0.045em] sm:text-6xl md:text-[5.5rem]">
          Shorten any link
          <br />
          <span className="font-medium text-muted-foreground italic">Share it anywhere</span>
          <br />
          See every click
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Short links on your own domain with click analytics, UTM parameters, expiration,
          passwords, and device and geo targeting.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={SIGNUP_URL} className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5 text-base')}>
            Start free
          </a>
          <Link to="/pricing" className={cn(buttonVariants({ size: 'lg', variant: 'ghost' }), 'h-11 rounded-xl text-base')}>
            See pricing
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Free for 10 links with click analytics, no card required.
        </p>

        <Showcase className="mt-14 lg:pb-24">
          <div className="relative lg:min-h-[34rem]">
            <BrowserFrame
              url="app.shortener.dev/links"
              label="Your team"
              className="hidden lg:absolute lg:top-0 lg:right-0 lg:block lg:w-[68%]"
            >
              <ThemedScreenshot name="app-links" alt="Shortener.dev dashboard listing short links" eager />
            </BrowserFrame>
            <BrowserFrame
              url="shortener.dev"
              label="Try it"
              className="relative lg:absolute lg:top-24 lg:left-0 lg:w-[52%]"
              bodyClassName="p-4 sm:p-6"
            >
              <p className="text-lg font-semibold tracking-tight">Shorten a link</p>
              <p className="mb-4 text-sm text-muted-foreground">No account needed for a 24-hour link.</p>
              <LinkBuilder
                className="border-0 bg-transparent p-0 shadow-none"
                examples={[{ url: 'https://github.com/dayschedule/idm', key: 'github' }]}
              />
            </BrowserFrame>
          </div>
          <ol className="mt-5 flex flex-wrap justify-center gap-2 px-3 lg:absolute lg:inset-x-0 lg:bottom-5 lg:mt-0">
            {steps.map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm shadow-sm"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] text-background">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Showcase>
      </div>

      {/* Link builder */}
      <Section surface className="mt-24">
        <SectionHeader
          eyebrow="Short links"
          tone="blue"
          title="Every option, on every link"
          description="Pick the back-half, add UTM parameters, write the social preview, set a password or an expiry date. All link options are on every plan, including free."
          points={[
            'Your own back-half and domain',
            'UTM builder and social preview card',
            'Expiration, password, device and geo rules',
          ]}
        />
        <Showcase>
          <BrowserFrame url="app.shortener.dev/links" label="Short link builder">
            <ThemedScreenshot
              name="app-create"
              width={896}
              height={810}
              alt="Short link builder with expiration, UTM, social preview, password and targeting options"
            />
          </BrowserFrame>
        </Showcase>
      </Section>

      {/* Analytics */}
      <Section>
        <SectionHeader
          eyebrow="Analytics"
          tone="violet"
          title="Know who clicked, and from where"
          description="Every click is counted with its country, city, referrer, browser, operating system and device, so you can see which post, email or poster is working."
          points={['Clicks by day, country and city', 'Referrer, browser, OS and device', 'Raw click reports on paid plans']}
        />
        <Showcase>
          <AnalyticsMockup />
        </Showcase>
      </Section>

      {/* Targeting */}
      <Section surface>
        <SectionHeader
          eyebrow="Targeting"
          tone="green"
          title="One link, the right destination"
          description="Send iPhone users to the App Store, Android users to Google Play and visitors from each country to their own page, all from the same short link."
          points={['iOS and Android app links', 'Per-country destinations', 'Change the destination any time']}
        />
        <Showcase>
          <TargetingMockup />
        </Showcase>
      </Section>

      {/* API */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <Eyebrow tone="amber">Developers</Eyebrow>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              Shorten from your code
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              A REST API for everything in the dashboard: links, domains, projects, analytics and
              click reports. Create an API key and send one request.
            </p>
            <ul className="mt-6 divide-y border-y">
              {['Create, update and delete links', 'Read analytics and click reports', 'OpenAPI spec for any language'].map(
                (item, index) => (
                  <li key={item} className="flex items-baseline gap-4 py-3.5">
                    <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                    <span className="text-[15px]">{item}</span>
                  </li>
                )
              )}
            </ul>
            <a
              href={`${API_URL.replace(/\/v1$/, '')}/openapi.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              OpenAPI spec <ArrowUpRight className="size-4" />
            </a>
          </div>
          <ApiMockup />
        </div>
      </Section>

      {/* Extras */}
      <Section surface>
        <div className="max-w-2xl">
          <Eyebrow tone="blue">And more</Eyebrow>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            Built for teams that share a lot of links
          </h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {extras.map((item) => (
            <div key={item.title} className="bg-background p-6">
              <item.icon className="size-5 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="violet" className="justify-center">
            Pricing
          </Eyebrow>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            Start free. Upgrade when it works.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Clicks are unlimited on every plan. Pay for the links you create.
          </p>
        </div>
        <PricingCards className="mt-12" />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Prefer to pay once?{' '}
          <Link to="/lifetime-deal" className="font-medium text-foreground underline underline-offset-2">
            Lifetime deal for $149
          </Link>
        </p>
      </Section>

      {/* Tools */}
      <Section surface>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow tone="green">Free tools</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              Link shorteners for the apps you use
            </h2>
          </div>
          <Link to="/tools" className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
            All free tools <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {shortenerTools.map((tool) => (
            <Link
              key={tool.slug}
              to="/tools/$slug"
              params={{ slug: tool.slug }}
              className="group flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm transition-colors hover:border-foreground/20"
            >
              <ToolIcon domain={tool.domain} icon={tool.icon} />
              {tool.title}
            </Link>
          ))}
          {otherTools.map((tool) => (
            <Link
              key={tool.slug}
              to={tool.to}
              className="group flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm transition-colors hover:border-foreground/20"
            >
              <ToolIcon domain={tool.domain} icon={tool.icon} />
              {tool.title}
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <Faq faqs={faqs} />
      </Section>
    </>
  );
}
