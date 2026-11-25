import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { NumberedList, Section } from '@/components/section';
import { rich, useI18n } from '@/i18n';
import { seo } from '@/lib/seo';
import { AGENTY_URL, GITHUB_URL } from '@/lib/site';

export const Route = createFileRoute('/about')({
  head: ({ match }) => {
    const { locale, messages: t } = match.context;
    return seo({
      title: t.about.metaTitle,
      description: t.about.metaDescription,
      path: '/about',
      locale,
      jsonLd: [
        {
          '@type': 'AboutPage',
          name: 'About Shortener.dev',
          url: 'https://shortener.dev/about',
        },
      ],
    });
  },
  component: About,
});

function About() {
  const { t } = useI18n();
  const copy = t.about;
  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        tone="blue"
        title={copy.title}
        accent={copy.accent}
        description={copy.description}
      />
      <Section surface>
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>{copy.body1}</p>
            <p>{copy.body2}</p>
            <p>
              {rich(copy.body3, {
                company: (
                  <a
                    href={AGENTY_URL}
                    target="_blank"
                    rel="noopener"
                    className="text-foreground underline underline-offset-4"
                  >
                    Agenty Analytics Pvt. Ltd.
                  </a>
                ),
              })}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">{copy.valuesTitle}</h2>
            <NumberedList className="mt-3" items={copy.values} />
          </div>
        </div>
      </Section>
      <Section>
        <h2 className="text-3xl font-semibold tracking-[-0.03em]">{copy.team}</h2>
        <div className="mt-8 flex max-w-md items-center gap-5 rounded-2xl border p-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold">
            VR
          </div>
          <div>
            <p className="font-semibold">Vikash Rathee</p>
            <p className="text-sm text-muted-foreground">{copy.founder}</p>
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
          {rich(copy.questions, {
            contact: (
              <Link to="/contact" className="text-foreground underline underline-offset-2">
                {copy.contactUs}
              </Link>
            ),
            github: (
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2"
              >
                GitHub
              </a>
            ),
          })}
        </p>
      </Section>
    </>
  );
}
