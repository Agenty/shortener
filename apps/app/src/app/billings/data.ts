export const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For personal projects",
    features: ["50 links/month", "Basic analytics", "1 custom domain", "Community support"],
    current: true,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For growing teams",
    features: ["Unlimited links", "Advanced analytics", "5 custom domains", "Priority support", "API access", "UTM parameters"],
    current: false,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "For large organizations",
    features: ["Everything in Pro", "Unlimited domains", "SSO / SAML", "Dedicated support", "Custom integrations", "SLA guarantee"],
    current: false,
  },
];
