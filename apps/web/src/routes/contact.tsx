import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Mail, ShieldAlert } from 'lucide-react';
import { MailForm } from '@/components/mail-form';
import { PageHero } from '@/components/page-hero';
import { useI18n } from '@/i18n';
import { seo } from '@/lib/seo';
import { SUPPORT_EMAIL } from '@/lib/site';

export const Route = createFileRoute('/contact')({
  head: ({ match }) => {
    const { locale, messages: t } = match.context;
    return seo({
      title: t.contact.metaTitle,
      description: t.contact.metaDescription,
      path: '/contact',
      locale,
      jsonLd: [
        {
          '@type': 'ContactPage',
          name: 'Contact Shortener.dev',
          url: 'https://shortener.dev/contact',
        },
      ],
    });
  },
  component: Contact,
});

function Contact() {
  const { t } = useI18n();
  const copy = t.contact;
  return (
    <div className="container grid gap-12 pb-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
      <PageHero
        contained={false}
        eyebrow={copy.eyebrow}
        tone="blue"
        title={copy.title}
        accent={copy.accent}
        description={copy.description}
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
              {copy.report}
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </PageHero>
      <div className="lg:pt-24">
        <MailForm
          subject="Shortener.dev inquiry"
          fields={[
            { name: 'name', label: t.mailForm.name, required: true },
            { name: 'email', label: t.mailForm.email, type: 'email', required: true },
            { name: 'company', label: t.mailForm.company },
            { name: 'message', label: t.mailForm.message, type: 'textarea', required: true },
          ]}
        />
      </div>
    </div>
  );
}
