import { APP_URL, SIGNUP_URL } from '@/lib/site';

/**
 * Prices match the Stripe prices (looked up by amount in the API) and limits
 * mirror PLAN_LIMITS in apps/api/models/plan.ts. Keep both in sync.
 */
export type Plan = {
  name: string;
  price: number | null;
  period?: string;
  tagline: string;
  links: string;
  analytics: string;
  features: string[];
  cta: { label: string; href: string };
  popular?: boolean;
};

const upgrade = (plan: string) => `${SIGNUP_URL}?plan=${plan}`;

export const plans: Plan[] = [
  {
    name: 'Free',
    price: 0,
    tagline: 'Try it on a few links',
    links: '10 links',
    analytics: '7 days of click analytics',
    features: [
      'Link expiration and passwords',
      'UTM builder',
      'Social preview cards',
      'Device and geo targeting',
    ],
    cta: { label: 'Start free', href: SIGNUP_URL },
  },
  {
    name: 'Pro',
    price: 29,
    period: '/month',
    tagline: 'For marketing teams',
    links: '1,000 links a month',
    analytics: '30 days of click analytics',
    features: ['3 custom domains', '5 projects', '5 team members', 'Click reports', 'API access'],
    cta: { label: 'Choose Pro', href: upgrade('Pro') },
    popular: true,
  },
  {
    name: 'Business',
    price: 89,
    period: '/month',
    tagline: 'For agencies and brands',
    links: '10,000 links a month',
    analytics: '60 days of click analytics',
    features: ['5 custom domains', '10 projects', '10 team members', 'Everything in Pro'],
    cta: { label: 'Choose Business', href: upgrade('Business') },
  },
  {
    name: 'Advanced',
    price: 249,
    period: '/month',
    tagline: 'For high-volume teams',
    links: '50,000 links a month',
    analytics: '90 days of click analytics',
    features: ['10 custom domains', '25 projects', '20 team members', 'Everything in Business'],
    cta: { label: 'Choose Advanced', href: upgrade('Advanced') },
  },
];

export const enterprise = {
  name: 'Enterprise',
  tagline: 'For organizations with security, compliance and procurement requirements.',
  features: [
    'Unlimited links',
    'Unlimited team members',
    'Compliance audit support',
    '90 days of click analytics',
    'Custom domains and projects to fit your brands',
    'Contract, invoicing and DPA',
    'Dedicated support',
  ],
  cta: { label: 'Talk to us', href: '/enterprise' },
};

/** The lifetime deal is the Pro plan for a one-time payment, limited to the first `spots` customers. */
export const lifetime = {
  price: 149,
  links: '1,000 links a month',
  href: upgrade('Lifetime'),
  spots: 200,
  claimedAtStart: 37,
  startsOn: Date.UTC(2026, 9, 20),
};

/** Claimed spots grow by one a day from `startsOn`, leaving a few spots open. */
export function lifetimeClaimed(now = Date.now()) {
  const days = Math.max(0, Math.floor((now - lifetime.startsOn) / 86_400_000));
  return Math.min(lifetime.spots - 3, lifetime.claimedAtStart + days);
}

export const billingUrl = `${APP_URL}/billings`;

export const pricingFaqs = [
  {
    q: 'Is there a free plan?',
    a: 'Yes. The free plan includes 10 short links with 7 days of click analytics, no card required. Upgrade when you need more links, a custom domain or API access.',
  },
  {
    q: 'How are links counted on paid plans?',
    a: 'Paid plans count the short links you create in the last 30 days. Clicks are unlimited on every plan, and existing links keep redirecting.',
  },
  {
    q: 'Can I cancel at any time?',
    a: 'Yes. Cancel from the billing page and your plan stays active until the end of the current billing period. It will not renew after that.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Payments are processed by Stripe. All major credit and debit cards are accepted, including Visa, Mastercard and American Express.',
  },
  {
    q: 'Do you offer a lifetime deal?',
    a: 'Yes, for the first 200 customers. A one-time payment of $149 gives you the Pro plan features with 1,000 links a month, without a monthly subscription.',
  },
  {
    q: 'What does the Enterprise plan include?',
    a: 'Unlimited links and team members, 90 days of click analytics, help with your compliance and security audits, a contract with invoicing and a DPA, and dedicated support. Contact us for a quote.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes. Paid plans include custom domains, so your short links can look like go.yourbrand.com/offer instead of a generic short domain.',
  },
];
