import { createFileRoute } from '@tanstack/react-router';
import { Check, Mail } from 'lucide-react';
import { MailForm } from '@/components/mail-form';
import { PageHero } from '@/components/page-hero';
import { NumberedList, Section } from '@/components/section';
import { rich, useI18n } from '@/i18n';
import { seo } from '@/lib/seo';
import { AGENTY_URL, GITHUB_URL, SUPPORT_EMAIL } from '@/lib/site';

export const Route = createFileRoute('/enterprise')({
  head: ({ match }) => {
    const { locale, messages: t } = match.context;
    return seo({
      title: t.enterprise.metaTitle,
      description: t.enterprise.metaDescription,
      path: '/enterprise',
      locale,
      jsonLd: [
        {
          '@type': 'ContactPage',
          name: 'Shortener.dev Enterprise',
          url: 'https://shortener.dev/enterprise',
        },
      ],
    });
  },
  component: Enterprise,
});

function Enterprise() {
  const { t } = useI18n();
  const copy = t.enterprise;
  return (
    <>
      <div className="container grid gap-12 pb-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <PageHero
          contained={false}
          eyebrow={copy.eyebrow}
          tone="violet"
          title={copy.title}
          accent={copy.accent}
          description={copy.description}
        >
          <ul className="mt-10 grid gap-3 text-[15px]">
            {t.plans.enterprise.features.map((feature) => (
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
              { name: 'name', label: t.mailForm.name, required: true },
              { name: 'email', label: t.mailForm.workEmail, type: 'email', required: true },
              { name: 'company', label: t.mailForm.company, required: true },
              { name: 'volume', label: copy.volume, placeholder: copy.volumePlaceholder },
              {
                name: 'message',
                label: copy.need,
                type: 'textarea',
                required: true,
                placeholder: copy.needPlaceholder,
              },
            ]}
          />
        </div>
      </div>
      <Section surface>
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
              {copy.licenseTitle}
            </h2>
            <p>
              {rich(copy.licenseBody1, {
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
            <p>
              {rich(copy.licenseBody2, {
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
            <h3 className="text-sm font-semibold">{copy.licenseListTitle}</h3>
            <NumberedList className="mt-3" items={copy.licenseList} />
          </div>
        </div>
      </Section>
    </>
  );
}
