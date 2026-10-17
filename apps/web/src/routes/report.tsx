import { createFileRoute } from '@tanstack/react-router';
import { MailForm } from '@/components/mail-form';
import { PageHero } from '@/components/page-hero';
import { NumberedList } from '@/components/section';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/report')({
  head: () =>
    seo({
      title: 'Report a URL',
      description:
        'Report a short link used for phishing, malware, scams or other abuse. The Shortener.dev team reviews every report and disables harmful links.',
      path: '/report',
    }),
  component: Report,
});

function Report() {
  return (
    <div className="container grid gap-12 pb-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
      <PageHero
        contained={false}
        eyebrow="Trust & safety"
        tone="amber"
        title="Report a link."
        accent="We act on every report."
        description="Short links are created by our users, so we can’t review each one by hand. If a Shortener.dev link leads to phishing, malware, a scam or other abuse, tell us and we’ll disable it."
      >
        <h2 className="mt-10 text-sm font-semibold">What happens next</h2>
        <NumberedList
          className="mt-3"
          items={[
            'We check the destination of the short link',
            'Harmful links are disabled and show a warning page',
            'Accounts that break our terms are suspended',
          ]}
        />
      </PageHero>
      <div className="lg:pt-24">
        <MailForm
          subject="Report a short link"
          submitLabel="Send report"
          fields={[
            { name: 'short_url', label: 'Short link', type: 'url', placeholder: 'https://shortener.dev/…', required: true },
            { name: 'reason', label: 'What’s wrong with it?', type: 'textarea', placeholder: 'Phishing page for a bank login…', required: true },
            { name: 'email', label: 'Your email (optional)', type: 'email' },
          ]}
        />
      </div>
    </div>
  );
}
