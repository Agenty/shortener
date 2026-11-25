import { createFileRoute } from '@tanstack/react-router';
import {
  BarChart3,
  CalendarClock,
  Globe2,
  Link2,
  Lock,
  Share2,
  Smartphone,
  Tags,
} from 'lucide-react';
import { BrowserFrame, ThemedScreenshot } from '@/components/browser-frame';
import { Faq } from '@/components/faq';
import { LinkBuilder } from '@/components/link-builder';
import { TargetingMockup } from '@/components/mockups';
import { PageHero } from '@/components/page-hero';
import { Section, SectionHeader, Showcase } from '@/components/section';
import { buttonVariants } from '@/components/ui/button';
import { useI18n, withLang } from '@/i18n';
import { faqJsonLd, seo } from '@/lib/seo';
import { SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const features = [
  { id: 'backHalf', icon: Link2 },
  { id: 'utm', icon: Tags },
  { id: 'social', icon: Share2 },
  { id: 'password', icon: Lock },
  { id: 'expiration', icon: CalendarClock },
  { id: 'apps', icon: Smartphone },
  { id: 'geo', icon: Globe2 },
  { id: 'analytics', icon: BarChart3 },
] as const;

export const Route = createFileRoute('/short-links-builder')({
  head: ({ match }) => {
    const { locale, messages: t } = match.context;
    return seo({
      title: t.shortLinks.metaTitle,
      description: t.shortLinks.metaDescription,
      path: '/short-links-builder',
      locale,
      jsonLd: [faqJsonLd(t.shortLinks.faqs)],
    });
  },
  component: ShortLinks,
});

function ShortLinks() {
  const { locale, t } = useI18n();
  const copy = t.shortLinks;

  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        tone="blue"
        title={copy.title}
        accent={copy.accent}
        description={copy.description}
      >
        <div className="mt-8 flex gap-3">
          <a
            href={withLang(SIGNUP_URL, locale)}
            className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5')}
          >
            {t.common.startFree}
          </a>
        </div>
      </PageHero>

      <div className="container">
        <Showcase className="mt-0">
          <BrowserFrame url="app.shortener.dev/links" label={t.home.builderLabel}>
            <ThemedScreenshot
              name="app-create"
              width={896}
              height={810}
              eager
              alt={t.home.builderAlt}
            />
          </BrowserFrame>
        </Showcase>
      </div>

      <Section>
        <SectionHeader eyebrow={copy.optionsEyebrow} tone="blue" title={copy.optionsTitle} />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.id} className="bg-background p-6">
              <feature.icon className="size-5 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">{copy.features[feature.id].title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {copy.features[feature.id].body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section surface>
        <SectionHeader
          eyebrow={copy.targetingEyebrow}
          tone="green"
          title={copy.targetingTitle}
          description={copy.targetingDescription}
        />
        <Showcase>
          <TargetingMockup />
        </Showcase>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-semibold tracking-[-0.03em]">{copy.tryNow}</h2>
          <LinkBuilder className="mt-8" />
        </div>
      </Section>

      <Section surface>
        <Faq faqs={copy.faqs} />
      </Section>
    </>
  );
}
