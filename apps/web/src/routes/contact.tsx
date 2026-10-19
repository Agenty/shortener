import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Mail, ShieldAlert } from 'lucide-react';
import { MailForm } from '@/components/mail-form';
import { PageHero } from '@/components/page-hero';
import { seo } from '@/lib/seo';
import { SUPPORT_EMAIL } from '@/lib/site';

export const Route = createFileRoute('/contact')({
  head: () =>
    seo({
      title: 'Contact us',
      description:
        'Contact the Shortener.dev team with questions about short links, analytics, plans, enterprise pricing or the API.',
      path: '/contact',
      jsonLd: [
        {
          '@type': 'ContactPage',
          name: 'Contact Shortener.dev',
          url: 'https://shortener.dev/contact',
        },
      ],
    }),
  component: Contact,
});

function Contact() {
  return (
    <div className="container grid gap-12 pb-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
      <PageHero
        contained={false}
        eyebrow="Contact"
        tone="blue"
        title="Talk to us."
        accent="A person replies."
        description="Questions about plans, enterprise pricing, migrating from another shortener or the API? Send a message and we’ll get back to you."
      >
        <div className="mt-10 grid gap-3">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-3 rounded-xl border p-4 text-sm hover:bg-surface"
          >
            <Mail className="size-4 text-muted-foreground" />
            {SUPPORT_EMAIL}
          </a>
          <Link
            to="/report"
            className="group flex items-center justify-between gap-3 rounded-xl border p-4 text-sm hover:bg-surface"
          >
            <span className="flex items-center gap-3">
              <ShieldAlert className="size-4 text-muted-foreground" />
              Report a malicious or phishing link
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </PageHero>
      <div className="lg:pt-24">
        <MailForm
          subject="Shortener.dev inquiry"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'company', label: 'Company' },
            { name: 'message', label: 'Message', type: 'textarea', required: true },
          ]}
        />
      </div>
    </div>
  );
}
