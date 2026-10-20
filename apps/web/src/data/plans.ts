import { APP_URL, SIGNUP_URL } from '@/lib/site';

/**
 * Prices match the Stripe prices (looked up by amount in the API) and limits
 * mirror PLAN_LIMITS in apps/api/models/plan.ts. Keep both in sync. The copy
 * for each plan lives in `plans` of the i18n messages.
 */
export type PlanId = 'free' | 'pro' | 'business' | 'advanced';

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  monthly: boolean;
  href: string;
  popular?: boolean;
};

const upgrade = (plan: string) => `${SIGNUP_URL}?plan=${plan}`;

export const plans: Plan[] = [
  { id: 'free', name: 'Free', price: 0, monthly: false, href: SIGNUP_URL },
  { id: 'pro', name: 'Pro', price: 29, monthly: true, href: upgrade('Pro'), popular: true },
  { id: 'business', name: 'Business', price: 89, monthly: true, href: upgrade('Business') },
  { id: 'advanced', name: 'Advanced', price: 249, monthly: true, href: upgrade('Advanced') },
];

export const enterprise = { name: 'Enterprise' };

/** The lifetime deal is the Pro plan for a one-time payment, limited to the first `spots` customers. */
export const lifetime = {
  price: 149,
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
