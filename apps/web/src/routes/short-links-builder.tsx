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
import { faqJsonLd, seo } from '@/lib/seo';
import { SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const features = [
  { icon: Link2, title: 'Custom back-half', body: 'srt1.link/spring-sale instead of a random code.' },
  { icon: Tags, title: 'UTM builder', body: 'Add utm_source, utm_medium and utm_campaign without editing the URL.' },
  { icon: Share2, title: 'Social preview', body: 'Set the title, description and image shown when the link is shared.' },
  { icon: Lock, title: 'Password protection', body: 'Visitors enter a password before they are redirected.' },
  { icon: CalendarClock, title: 'Expiration', body: 'The link stops redirecting after the date and time you choose.' },
  { icon: Smartphone, title: 'iOS and Android', body: 'Send phone visitors to your app in the right store.' },
  { icon: Globe2, title: 'Geo targeting', body: 'A different destination for each country.' },
  { icon: BarChart3, title: 'Click analytics', body: 'Country, city, referrer, browser, OS and device for every click.' },
];

const faqs = [
  {
    q: 'What is a short link builder?',
    a: 'A tool to create short links with options beyond the destination URL, like a custom back-half, UTM parameters, a social preview, expiration, password and targeting rules.',
  },
  {
    q: 'Are these options on the free plan?',
    a: 'Yes. Every link option is available on every plan. Paid plans add more links, custom domains, team members, click reports and the API.',
  },
  {
    q: 'Can I edit a link after creating it?',
    a: 'Yes. Change the destination, options or rules at any time; the short link stays the same.',
  },
];

export const Route = createFileRoute('/short-links-builder')({
  head: () =>
    seo({
      title: 'Short link builder with click tracking',
      description:
        'Create custom short links with UTM parameters, social preview, expiration, password protection, iOS and Android deep links, geo targeting and click analytics.',
      path: '/short-links-builder',
      jsonLd: [faqJsonLd(faqs)],
    }),
  component: ShortLinks,
});

function ShortLinks() {
  return (
    <>
      <PageHero
        eyebrow="Short links"
        tone="blue"
        title="Short links"
        accent="with everything attached."
        description="One form for the back-half, UTM parameters, social preview, expiration, password, and device and geo rules, with click analytics on every link."
      >
        <div className="mt-8 flex gap-3">
          <a href={SIGNUP_URL} className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5')}>
            Start free
          </a>
        </div>
      </PageHero>

      <div className="container">
        <Showcase className="mt-0">
          <BrowserFrame url="app.shortener.dev/links" label="Short link builder">
            <ThemedScreenshot
              name="app-create"
              width={896}
              height={810}
              eager
              alt="Short link builder with expiration, UTM, social preview, password and targeting options"
            />
          </BrowserFrame>
        </Showcase>
      </div>

      <Section>
        <SectionHeader eyebrow="Options" tone="blue" title="Eight options, one short link" />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="bg-background p-6">
              <feature.icon className="size-5 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section surface>
        <SectionHeader
          eyebrow="Targeting"
          tone="green"
          title="Route each visitor to the right page"
          description="Rules run at the edge before the redirect, so there is no extra page load for the visitor."
        />
        <Showcase>
          <TargetingMockup />
        </Showcase>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-semibold tracking-[-0.03em]">Try it now</h2>
          <LinkBuilder className="mt-8" />
        </div>
      </Section>

      <Section surface>
        <Faq faqs={faqs} />
      </Section>
    </>
  );
}
