import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { NumberedList, Section } from '@/components/section';
import { seo } from '@/lib/seo';
import { GITHUB_URL } from '@/lib/site';

export const Route = createFileRoute('/about')({
  head: () =>
    seo({
      title: 'About us',
      description:
        'Shortener.dev is a URL shortener with click analytics for marketing teams and developers, built on Cloudflare by Agenty Analytics.',
      path: '/about',
      jsonLd: [
        {
          '@type': 'AboutPage',
          name: 'About Shortener.dev',
          url: 'https://shortener.dev/about',
        },
      ],
    }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        tone="blue"
        title="Short links,"
        accent="and what happens after the click."
        description="Shortener.dev helps marketing teams and developers create short links, route each visitor to the right page, and see where their clicks come from."
      />
      <Section surface>
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              We started as IDM (idm.in), a link shortener and analytics tool for marketing teams.
              Shortener.dev is the next version: rebuilt on Cloudflare Workers so redirects are fast
              everywhere, with a cleaner dashboard and a documented API.
            </p>
            <p>
              Every link option, from UTM parameters to geo targeting, is on every plan. You pay for
              the number of links you create, never for clicks.
            </p>
            <p>
              Shortener.dev is built by{' '}
              <span className="text-foreground">Agenty Analytics Pvt. Ltd.</span>, the team behind
              Agenty, in India.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">What we care about</h2>
            <NumberedList
              className="mt-3"
              items={[
                'Fast redirects, served close to every visitor',
                'Simple pricing, with unlimited clicks',
                'Safe links, with abuse taken seriously',
                'An API for everything in the dashboard',
              ]}
            />
          </div>
        </div>
      </Section>
      <Section>
        <h2 className="text-3xl font-semibold tracking-[-0.03em]">Team</h2>
        <div className="mt-8 flex max-w-md items-center gap-5 rounded-2xl border p-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold">
            VR
          </div>
          <div>
            <p className="font-semibold">Vikash Rathee</p>
            <p className="text-sm text-muted-foreground">Founder</p>
            <div className="mt-2 flex gap-4 text-sm">
              <a
                href="https://www.linkedin.com/in/vikashrathee/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                LinkedIn <ArrowUpRight className="size-3.5" />
              </a>
              <a
                href="https://x.com/vikashrathee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                X <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
        <p className="mt-10 text-muted-foreground">
          Questions?{' '}
          <Link to="/contact" className="text-foreground underline underline-offset-2">
            Contact us
          </Link>{' '}
          or see the code on{' '}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">
            GitHub
          </a>
          .
        </p>
      </Section>
    </>
  );
}
