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
import { lifetime } from '@/data/plans';
import { fmt, useI18n, withLang } from '@/i18n';
import { faqJsonLd, seo, softwareJsonLd } from '@/lib/seo';
import { API_URL, SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/')({
  head: ({ match }) => {
    const { locale, messages: t } = match.context;
    return seo({
      title: t.home.metaTitle,
      description: t.home.metaDescription,
      path: '/',
      locale,
      jsonLd: [softwareJsonLd, faqJsonLd(t.home.faqs)],
    });
  },
  component: Home,
});

const extras = [
  { id: 'domains', icon: Globe },
  { id: 'projects', icon: FolderKanban },
  { id: 'team', icon: Users },
  { id: 'expiration', icon: CalendarClock },
  { id: 'safe', icon: ShieldCheck },
  { id: 'fast', icon: Zap },
] as const;

function Home() {
  const { locale, t } = useI18n();
  const copy = t.home;
  return (
    <>
      {/* Hero */}
      <div className="container pt-14 md:pt-24">
        <h1 className="text-5xl leading-[1.02] font-semibold tracking-[-0.045em] sm:text-6xl md:text-[5.5rem]">
          {copy.heroLine1}
          <br />
          <span className="font-medium text-muted-foreground italic">{copy.heroLine2}</span>
          <br />
          {copy.heroLine3}
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {copy.heroDescription}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={withLang(SIGNUP_URL, locale)}
            className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5 text-base')}
          >
            {t.common.startFree}
          </a>
          <Link to="/pricing" className={cn(buttonVariants({ size: 'lg', variant: 'ghost' }), 'h-11 rounded-xl text-base')}>
            {copy.seePricing}
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t.common.freeNote}
        </p>

        <Showcase className="mt-14 lg:pb-24">
          <div className="relative lg:min-h-[34rem]">
            <BrowserFrame
              url="app.shortener.dev/links"
              label={copy.yourTeam}
              className="hidden lg:absolute lg:top-0 lg:right-0 lg:block lg:w-[68%]"
            >
              <ThemedScreenshot name="app-links" alt={copy.dashboardAlt} eager />
            </BrowserFrame>
            <BrowserFrame
              url="shortener.dev"
              label={copy.tryIt}
              className="relative lg:absolute lg:top-24 lg:left-0 lg:w-[52%]"
              bodyClassName="p-4 sm:p-6"
            >
              <p className="text-lg font-semibold tracking-tight">{copy.shortenTitle}</p>
              <p className="mb-4 text-sm text-muted-foreground">{copy.shortenSubtitle}</p>
              <LinkBuilder
                className="border-0 bg-transparent p-0 shadow-none"
                examples={[{ url: 'https://github.com/Agenty/shortener', key: 'github' }]}
              />
            </BrowserFrame>
          </div>
          <ol className="mt-5 flex flex-wrap justify-center gap-2 px-3 lg:absolute lg:inset-x-0 lg:bottom-5 lg:mt-0">
            {copy.steps.map((step, index) => (
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
          eyebrow={copy.builderEyebrow}
          tone="blue"
          title={copy.builderTitle}
          description={copy.builderDescription}
          points={copy.builderPoints}
        />
        <Showcase>
          <BrowserFrame url="app.shortener.dev/links" label={copy.builderLabel}>
            <ThemedScreenshot name="app-create" width={896} height={810} alt={copy.builderAlt} />
          </BrowserFrame>
        </Showcase>
      </Section>

      {/* Analytics */}
      <Section>
        <SectionHeader
          eyebrow={copy.analyticsEyebrow}
          tone="violet"
          title={copy.analyticsTitle}
          description={copy.analyticsDescription}
          points={copy.analyticsPoints}
        />
        <Showcase>
          <AnalyticsMockup />
        </Showcase>
      </Section>

      {/* Targeting */}
      <Section surface>
        <SectionHeader
          eyebrow={copy.targetingEyebrow}
          tone="green"
          title={copy.targetingTitle}
          description={copy.targetingDescription}
          points={copy.targetingPoints}
        />
        <Showcase>
          <TargetingMockup />
        </Showcase>
      </Section>

      {/* API */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <Eyebrow tone="amber">{copy.apiEyebrow}</Eyebrow>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              {copy.apiTitle}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{copy.apiDescription}</p>
            <ul className="mt-6 divide-y border-y">
              {copy.apiPoints.map((item, index) => (
                <li key={item} className="flex items-baseline gap-4 py-3.5">
                  <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                  <span className="text-[15px]">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href={`${API_URL.replace(/\/v1$/, '')}/openapi.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {copy.openApi} <ArrowUpRight className="size-4" />
            </a>
          </div>
          <ApiMockup />
        </div>
      </Section>

      {/* Extras */}
      <Section surface>
        <div className="max-w-2xl">
          <Eyebrow tone="blue">{copy.extrasEyebrow}</Eyebrow>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            {copy.extrasTitle}
          </h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {extras.map((item) => (
            <div key={item.id} className="bg-background p-6">
              <item.icon className="size-5 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">{copy.extras[item.id].title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {copy.extras[item.id].body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="violet" className="justify-center">
            {t.common.pricing}
          </Eyebrow>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            {copy.pricingTitle}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{copy.pricingDescription}</p>
        </div>
        <PricingCards className="mt-12" />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {copy.payOnce}{' '}
          <Link to="/lifetime-deal" className="font-medium text-foreground underline underline-offset-2">
            {fmt(copy.lifetimeLink, { price: lifetime.price })}
          </Link>
        </p>
      </Section>

      {/* Tools */}
      <Section surface>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow tone="green">{t.common.freeTools}</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              {copy.toolsTitle}
            </h2>
          </div>
          <Link to="/tools" className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
            {t.nav.allTools} <ArrowRight className="size-4 rtl:rotate-180" />
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
        <Faq faqs={copy.faqs} />
      </Section>
    </>
  );
}
