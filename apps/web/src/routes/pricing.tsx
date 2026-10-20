import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { Faq } from '@/components/faq';
import { LifetimeOffer } from '@/components/lifetime-offer';
import { PageHero } from '@/components/page-hero';
import { PricingCards } from '@/components/pricing-cards';
import { Section } from '@/components/section';
import { buttonVariants } from '@/components/ui/button';
import { enterprise, plans } from '@/data/plans';
import { fmt, useI18n, type Messages } from '@/i18n';
import { faqJsonLd, seo } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/pricing')({
  head: ({ match }) => {
    const { locale, messages: t } = match.context;
    return seo({
      title: t.pricing.metaTitle,
      description: t.pricing.metaDescription,
      path: '/pricing',
      locale,
      jsonLd: [faqJsonLd(t.plans.faqs)],
    });
  },
  component: Pricing,
});

type Value = string | boolean;

/** Rows of the comparison table, one value per plan and Enterprise last */
const matrix = (t: Messages): Array<[string, ...Value[]]> => {
  const { rows, unlimited, custom } = t.pricing;
  const perMonth = (n: string) => fmt(t.pricing.perMonth, { n });
  const days = (n: number) => fmt(t.pricing.days, { n });
  return [
    [rows.shortLinks, '10', perMonth('1,000'), perMonth('10,000'), perMonth('50,000'), unlimited],
    [rows.clicks, unlimited, unlimited, unlimited, unlimited, unlimited],
    [rows.history, days(7), days(30), days(60), days(90), days(90)],
    [rows.domains, false, '3', '5', '10', custom],
    [rows.projects, false, '5', '10', '25', custom],
    [rows.team, false, '5', '10', '20', unlimited],
    [rows.reports, false, true, true, true, true],
    [rows.api, false, true, true, true, true],
    [rows.utm, true, true, true, true, true],
    [rows.expiration, true, true, true, true, true],
    [rows.targeting, true, true, true, true, true],
    [rows.compliance, false, false, false, false, true],
    [rows.contract, false, false, false, false, true],
    [rows.support, false, false, false, false, true],
  ];
};

function Cell({ value }: { value: Value }) {
  const { t } = useI18n();
  if (value === true) return <Check className="mx-auto size-4 text-brand-3" aria-label={t.common.included} />;
  if (value === false)
    return <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label={t.common.notIncluded} />;
  return <span>{value}</span>;
}

function Pricing() {
  const { t } = useI18n();
  const copy = t.pricing;

  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        tone="violet"
        title={copy.title}
        accent={copy.accent}
        description={copy.description}
      />

      <div className="container">
        <LifetimeOffer className="mb-6" />
        <PricingCards />

        <div className="mt-4 grid gap-6 rounded-2xl border bg-neutral-950 p-6 text-white md:grid-cols-[1fr_1.6fr] md:p-8 dark:bg-card">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">{enterprise.name}</h2>
            <p className="mt-2 text-sm text-white/70">{t.plans.enterprise.tagline}</p>
            <p className="mt-6 text-3xl font-semibold tracking-tight">{t.plans.customPricing}</p>
            <Link
              to="/contact"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'mt-6 self-start rounded-xl bg-white text-neutral-900 hover:bg-white/90 md:mt-auto'
              )}
            >
              {t.plans.enterprise.cta} <ArrowRight data-icon="inline-end" className="rtl:rotate-180" />
            </Link>
          </div>
          <ul className="grid content-start gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {t.plans.enterprise.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-3" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Section>
        <h2 className="text-3xl font-semibold tracking-[-0.03em]">{copy.compare}</h2>
        <div className="mt-8 overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-surface">
              <tr>
                <th scope="col" className="p-4 text-start font-medium text-muted-foreground">
                  {copy.feature}
                </th>
                {[...plans.map((plan) => plan.name), enterprise.name].map((name) => (
                  <th key={name} scope="col" className="p-4 text-center font-semibold">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix(t).map(([label, ...values]) => (
                <tr key={label} className="border-t">
                  <th scope="row" className="p-4 text-start font-medium">
                    {label}
                  </th>
                  {values.map((value, index) => (
                    <td key={index} className="p-4 text-center text-muted-foreground">
                      <Cell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{copy.note}</p>
      </Section>

      <Section surface>
        <Faq faqs={t.plans.faqs} />
      </Section>
    </>
  );
}
