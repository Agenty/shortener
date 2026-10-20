export enum PlanType {
  Free = 'Free',
  /** Legacy plan, no longer sold */
  Basic = 'Basic',
  Starter = 'Starter',
  Pro = 'Pro',
  Business = 'Business',
  /** Legacy plan, no longer sold */
  Advanced = 'Advanced',
  Enterprise = 'Enterprise',
}

export interface PlanLimits {
  links_limit: number;
  projects_limit: number;
  domains_limit: number;
  analytics_limit: number;
  users_limit: number;
  qr_limit: number;
  pages_limit: number;
  api_access: boolean;
}

/**
 * Mirrors the pricing in apps/web/src/data/plans.ts and the billing page in
 * apps/app/src/app/billings/data.ts. Keep all three in sync.
 * `users_limit` includes the account owner.
 */
const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.Free]: {
    links_limit: 50,
    projects_limit: 0,
    domains_limit: 1,
    analytics_limit: 7,
    users_limit: 0,
    qr_limit: 1,
    pages_limit: 1,
    api_access: false,
  },
  [PlanType.Basic]: {
    links_limit: 500,
    projects_limit: 3,
    domains_limit: 1,
    analytics_limit: 7,
    users_limit: 2,
    qr_limit: 100,
    pages_limit: 2,
    api_access: true,
  },
  [PlanType.Starter]: {
    links_limit: 500,
    projects_limit: 3,
    domains_limit: 2,
    analytics_limit: 30,
    users_limit: 2,
    qr_limit: 100,
    pages_limit: 2,
    api_access: true,
  },
  [PlanType.Pro]: {
    links_limit: 2000,
    projects_limit: 5,
    domains_limit: 10,
    analytics_limit: 60,
    users_limit: 5,
    qr_limit: 500,
    pages_limit: 5,
    api_access: true,
  },
  [PlanType.Business]: {
    links_limit: 15000,
    projects_limit: 10,
    domains_limit: 25,
    analytics_limit: 90,
    users_limit: 10,
    qr_limit: 1000,
    pages_limit: 10,
    api_access: true,
  },
  [PlanType.Advanced]: {
    links_limit: 50000,
    projects_limit: 25,
    domains_limit: 25,
    analytics_limit: 90,
    users_limit: 20,
    qr_limit: 5000,
    pages_limit: 25,
    api_access: true,
  },
  // Unlimited links and users, up to 3 years of analytics history, domains and
  // projects are raised per contract
  [PlanType.Enterprise]: {
    links_limit: 1000000,
    projects_limit: 100,
    domains_limit: 50,
    analytics_limit: 1095,
    users_limit: 1000,
    qr_limit: 10000,
    pages_limit: 100,
    api_access: true,
  },
};

export const getPlanLimits = (plan?: PlanType | string): PlanLimits =>
  PLAN_LIMITS[plan as PlanType] ?? PLAN_LIMITS[PlanType.Free];
