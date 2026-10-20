import { createFileRoute } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { Faq } from '@/components/faq';
import { PageHero } from '@/components/page-hero';
import { LifetimeSpots } from '@/components/lifetime-offer';
import { Section } from '@/components/section';
import { buttonVariants } from '@/components/ui/button';
import { lifetime } from '@/data/plans';
import { fmt, useI18n, withLang, type Messages } from '@/i18n';
import { faqJsonLd, seo } from '@/lib/seo';
import { cn } from '@/lib/utils';

/** Values for the `{price}`, `{links}` and `{spots}` placeholders */
const dealValues = (t: Messages) => ({
  price: lifetime.price,
  links: t.lifetime.links,
  spots: lifetime.spots,
});

const dealFaqs = (t: Messages) =>
  t.lifetimeDeal.faqs.map((faq) => ({
    q: fmt(faq.q, dealValues(t)),
    a: fmt(faq.a, dealValues(t)),
  }));

const included = (t: Messages) => {
  const { rows } = t.lifetimeDeal;
  return [
    [rows.links, t.lifetime.links],
    [rows.analytics, rows.analyticsValue],
    [rows.domains, rows.domainsValue],
    [rows.team, '5'],
    [rows.projects, '5'],
    [rows.reports, t.common.included],
    [rows.api, t.common.included],
    [rows.utm, t.common.included],
    [rows.expiration, t.common.included],
    [rows.targeting, t.common.included],
  ];
};

export const Route = createFileRoute('/lifetime-deal')({
  head: ({ match }) => {
    const { locale, messages: t } = match.context;
    return seo({
      title: t.lifetimeDeal.metaTitle,
      description: fmt(t.lifetimeDeal.metaDescription, dealValues(t)),
      path: '/lifetime-deal',
      locale,
      jsonLd: [
        {
          '@type': 'Product',
          name: 'Shortener.dev lifetime deal',
          description: `URL shortener with ${t.lifetime.links}, one-time payment.`,
          offers: { '@type': 'Offer', price: String(lifetime.price), priceCurrency: 'USD' },
        },
        faqJsonLd(dealFaqs(t)),
      ],
    });
  },
  component: LifetimeDeal,
});

function LifetimeDeal() {
  const { locale, t } = useI18n();
  const copy = t.lifetimeDeal;

  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        tone="amber"
        title={copy.title}
        accent={copy.accent}
        description={fmt(copy.description, dealValues(t))}
      />
      <div className="container">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-end justify-between gap-4 border-b bg-surface p-6">
            <div>
              <p className="text-sm text-muted-foreground">{copy.oneTimePrice}</p>
              <p className="mt-1 text-5xl font-semibold tracking-tight">${lifetime.price}</p>
            </div>
            <a
              href={withLang(lifetime.href, locale)}
              rel="nofollow"
              className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5')}
            >
              {copy.buy}
            </a>
          </div>
          <LifetimeSpots className="border-b px-6 py-4" />
          <ul className="divide-y">
            {included(t).map(([label, value]) => (
              <li key={label} className="flex items-center justify-between gap-4 px-6 py-3.5 text-sm">
                <span className="flex items-center gap-2">
                  <Check className="size-4 text-brand-3" />
                  {label}
                </span>
                <span className="text-muted-foreground">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Section>
        <Faq faqs={dealFaqs(t)} />
      </Section>
    </>
  );
}
