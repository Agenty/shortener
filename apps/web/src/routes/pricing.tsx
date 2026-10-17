import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { Faq } from '@/components/faq';
import { PageHero } from '@/components/page-hero';
import { PricingCards } from '@/components/pricing-cards';
import { Section } from '@/components/section';
import { buttonVariants } from '@/components/ui/button';
import { enterprise, lifetime, pricingFaqs } from '@/data/plans';
import { faqJsonLd, seo } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/pricing')({
  head: () =>
    seo({
      title: 'Pricing',
      description:
        'Shorten links for free, or choose a plan from $7 a month for custom domains, team members, click reports and API access. Enterprise adds unlimited links and compliance support.',
      path: '/pricing',
      jsonLd: [faqJsonLd(pricingFaqs)],
    }),
  component: Pricing,
});

const matrix: Array<[string, ...Array<string | boolean>]> = [
  ['Short links', '10', '500/mo', '1,000/mo', '5,000/mo', 'Unlimited'],
  ['Clicks', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'],
  ['Analytics history', '7 days', '7 days', '30 days', '60 days', '90 days'],
  ['Custom domains', false, '1', '3', '5', 'Custom'],
  ['Projects', false, '3', '5', '10', 'Custom'],
  ['Team members', false, '2', '50', '10', 'Unlimited'],
  ['Click reports', false, true, true, true, true],
  ['API access', false, true, true, true, true],
  ['UTM builder and social preview', true, true, true, true, true],
  ['Expiration and passwords', true, true, true, true, true],
  ['Device and geo targeting', true, true, true, true, true],
  ['Compliance audit support', false, false, false, false, true],
  ['Contract, invoicing and DPA', false, false, false, false, true],
  ['Dedicated support', false, false, false, false, true],
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-brand-3" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not included" />;
  return <span>{value}</span>;
}

function Pricing() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        tone="violet"
        title="Pay for links,"
        accent="not for clicks."
        description="Start free with 10 links. Paid plans add custom domains, team members, click reports and the API. Every plan has unlimited clicks."
      />

      <div className="container">
        <PricingCards />

        <div className="mt-4 grid gap-6 rounded-2xl border bg-neutral-950 p-6 text-white md:grid-cols-[1fr_1.6fr] md:p-8 dark:bg-card">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">{enterprise.name}</h2>
            <p className="mt-2 text-sm text-white/70">{enterprise.tagline}</p>
            <p className="mt-6 text-3xl font-semibold tracking-tight">Custom pricing</p>
            <Link
              to="/contact"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'mt-6 self-start rounded-xl bg-white text-neutral-900 hover:bg-white/90 md:mt-auto'
              )}
            >
              {enterprise.cta.label} <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
          <ul className="grid content-start gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {enterprise.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-3" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-surface p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold">Lifetime deal · ${lifetime.price} once</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Basic plan features with {lifetime.links}, no subscription.
              </p>
            </div>
            <Link to="/lifetime-deal" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'rounded-xl')}>
              Details <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        </div>
      </div>

      <Section>
        <h2 className="text-3xl font-semibold tracking-[-0.03em]">Compare plans</h2>
        <div className="mt-8 overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-surface">
              <tr>
                <th scope="col" className="p-4 text-left font-medium text-muted-foreground">
                  Feature
                </th>
                {['Free', 'Basic', 'Pro', 'Business', 'Enterprise'].map((name) => (
                  <th key={name} scope="col" className="p-4 text-center font-semibold">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(([label, ...values]) => (
                <tr key={label} className="border-t">
                  <th scope="row" className="p-4 text-left font-medium">
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
        <p className="mt-4 text-xs text-muted-foreground">
          Prices in USD, excluding local taxes. Paid plans count links created in the last 30 days.
        </p>
      </Section>

      <Section surface>
        <Faq faqs={pricingFaqs} />
      </Section>
    </>
  );
}
