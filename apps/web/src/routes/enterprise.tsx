import { createFileRoute } from '@tanstack/react-router';
import { Check, Mail } from 'lucide-react';
import { MailForm } from '@/components/mail-form';
import { PageHero } from '@/components/page-hero';
import { NumberedList, Section } from '@/components/section';
import { enterprise } from '@/data/plans';
import { seo } from '@/lib/seo';
import { GITHUB_URL, SUPPORT_EMAIL } from '@/lib/site';

export const Route = createFileRoute('/enterprise')({
  head: () =>
    seo({
      title: 'Enterprise',
      description:
        'Shortener.dev for enterprises: unlimited links, a contract with invoicing and a DPA, dedicated support, and a commercial license for self-hosting without AGPLv3 obligations.',
      path: '/enterprise',
      jsonLd: [
        {
          '@type': 'ContactPage',
          name: 'Shortener.dev Enterprise',
          url: 'https://shortener.dev/enterprise',
        },
      ],
    }),
  component: Enterprise,
});

function Enterprise() {
  return (
    <>
      <div className="container grid gap-12 pb-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <PageHero
          contained={false}
          eyebrow="Enterprise"
          tone="violet"
          title="Short links at scale."
          accent="On your terms."
          description="For organizations with security, compliance and procurement requirements, on our hosted service or on your own Cloudflare account."
        >
          <ul className="mt-10 grid gap-3 text-[15px]">
            {enterprise.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <Check className="size-4 text-brand-3" />
                {feature}
              </li>
            ))}
          </ul>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Shortener.dev Enterprise')}`}
            className="mt-10 flex items-center gap-3 rounded-xl border p-4 text-sm hover:bg-surface"
          >
            <Mail className="size-4 text-muted-foreground" />
            {SUPPORT_EMAIL}
          </a>
        </PageHero>
        <div className="lg:pt-24">
          <MailForm
            subject="Shortener.dev Enterprise inquiry"
            fields={[
              { name: 'name', label: 'Name', required: true },
              { name: 'email', label: 'Work email', type: 'email', required: true },
              { name: 'company', label: 'Company', required: true },
              {
                name: 'volume',
                label: 'Links per month (approx.)',
                placeholder: 'e.g. 100,000',
              },
              {
                name: 'message',
                label: 'What do you need?',
                type: 'textarea',
                required: true,
                placeholder: 'Hosted plan, commercial license, self-hosting support, SSO, a DPA…',
              },
            ]}
          />
        </div>
      </div>
      <Section surface>
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
              Open source, with a commercial license
            </h2>
            <p>
              The full source of Shortener.dev is on{' '}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2"
              >
                GitHub
              </a>{' '}
              under the AGPLv3. You can self-host it, including commercially, as long as you publish
              the source of any modified version you run as a network service.
            </p>
            <p>
              If your organization can’t meet those terms, or needs features, support or guarantees
              that the open-source edition doesn’t include, a commercial license from{' '}
              <span className="text-foreground">Agenty Analytics Pvt. Ltd.</span> covers it.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">A commercial license lets you</h3>
            <NumberedList
              className="mt-3"
              items={[
                'Run a modified version without publishing your changes',
                'Embed Shortener.dev in a proprietary product',
                'Get enterprise features built by the core team',
                'Have a support agreement and SLA for your deployment',
              ]}
            />
          </div>
        </div>
      </Section>
    </>
  );
}
