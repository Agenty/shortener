import { createFileRoute } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { Faq } from '@/components/faq';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/section';
import { buttonVariants } from '@/components/ui/button';
import { lifetime } from '@/data/plans';
import { faqJsonLd, seo } from '@/lib/seo';
import { cn } from '@/lib/utils';

const included = [
  ['Links', `${lifetime.links}`],
  ['Click analytics', '7 days of history'],
  ['Custom domain', '1 domain'],
  ['Team members', '2'],
  ['Projects', '3'],
  ['API access', 'Included'],
  ['UTM builder and social preview', 'Included'],
  ['Expiration and password protection', 'Included'],
  ['iOS, Android and geo targeting', 'Included'],
];

const faqs = [
  {
    q: 'What does the lifetime deal include?',
    a: `The features of the Basic plan, with ${lifetime.links}, for a one-time payment of $${lifetime.price} instead of a monthly subscription.`,
  },
  {
    q: 'Is there a limit on the number of links?',
    a: `Yes, you can create up to ${lifetime.links}. Clicks are unlimited.`,
  },
  {
    q: 'Can I upgrade later?',
    a: 'Yes. If you outgrow the lifetime plan, you can move to a monthly Pro or Business plan at any time.',
  },
  {
    q: 'Is this deal on AppSumo or other marketplaces?',
    a: 'No. The lifetime deal is only sold on this website.',
  },
  {
    q: 'Is there a refund?',
    a: 'Lifetime purchases are not refundable, so try the free plan first to make sure the product fits your needs.',
  },
];

export const Route = createFileRoute('/lifetime-deal')({
  head: () =>
    seo({
      title: 'Lifetime deal: URL shortener',
      description: `Pay $${lifetime.price} once for a URL shortener with ${lifetime.links}, custom domain, click analytics, UTM builder, social preview, passwords and device and geo targeting.`,
      path: '/lifetime-deal',
      jsonLd: [
        {
          '@type': 'Product',
          name: 'Shortener.dev lifetime deal',
          description: `URL shortener with ${lifetime.links}, one-time payment.`,
          offers: { '@type': 'Offer', price: String(lifetime.price), priceCurrency: 'USD' },
        },
        faqJsonLd(faqs),
      ],
    }),
  component: LifetimeDeal,
});

function LifetimeDeal() {
  return (
    <>
      <PageHero
        eyebrow="Lifetime deal"
        tone="amber"
        title="Pay once."
        accent="Shorten every month."
        description={`Get the Basic plan for a one-time $${lifetime.price}: ${lifetime.links} with click analytics, a custom domain and the API. No subscription.`}
      />
      <div className="container">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-end justify-between gap-4 border-b bg-surface p-6">
            <div>
              <p className="text-sm text-muted-foreground">One-time price</p>
              <p className="mt-1 text-5xl font-semibold tracking-tight">${lifetime.price}</p>
            </div>
            <a href={lifetime.href} rel="nofollow" className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5')}>
              Buy lifetime deal
            </a>
          </div>
          <ul className="divide-y">
            {included.map(([label, value]) => (
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
        <Faq faqs={faqs} />
      </Section>
    </>
  );
}
