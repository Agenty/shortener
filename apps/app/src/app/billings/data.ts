/**
 * Mirrors the pricing in apps/web/src/data/plans.ts. Prices must match a
 * Stripe price (the API looks it up by amount) and limits must match
 * PLAN_LIMITS in apps/api/models/plan.ts. Keep all three in sync.
 */
export type Plan = {
  name: string;
  price: number;
  period?: string;
  tagline: string;
  links: string;
  analytics: string;
  features: string[];
  popular?: boolean;
};

export const plans: Plan[] = [
  {
    name: "Free",
    price: 0,
    tagline: "Try it on a few links",
    links: "10 links",
    analytics: "7 days of click analytics",
    features: [
      "Link expiration and passwords",
      "UTM builder",
      "Social preview cards",
      "Device and geo targeting",
    ],
  },
  {
    name: "Pro",
    price: 29,
    period: "/month",
    tagline: "For marketing teams",
    links: "1,000 links a month",
    analytics: "30 days of click analytics",
    features: ["3 custom domains", "5 projects", "5 team members", "Click reports", "API access"],
    popular: true,
  },
  {
    name: "Business",
    price: 89,
    period: "/month",
    tagline: "For agencies and brands",
    links: "10,000 links a month",
    analytics: "60 days of click analytics",
    features: ["5 custom domains", "10 projects", "10 team members", "Everything in Pro"],
  },
  {
    name: "Advanced",
    price: 249,
    period: "/month",
    tagline: "For high-volume teams",
    links: "50,000 links a month",
    analytics: "90 days of click analytics",
    features: ["10 custom domains", "25 projects", "20 team members", "Everything in Business"],
  },
];

/** The lifetime deal is the Pro plan for a one-time payment */
export const lifetime = {
  name: "Lifetime",
  price: 149,
  links: "1,000 links a month",
};

export const enterprise = {
  name: "Enterprise",
  tagline: "For organizations with security, compliance and procurement requirements.",
  features: [
    "Unlimited links",
    "Unlimited team members",
    "Compliance audit support",
    "90 days of click analytics",
    "Custom domains and projects to fit your brands",
    "Contract, invoicing and DPA",
    "Dedicated support",
  ],
  href: "https://shortener.dev/enterprise",
};
