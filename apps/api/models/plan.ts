export enum PlanType {
  Free = 'Free',
  Basic = 'Basic',
  Pro = 'Pro',
  Business = 'Business',
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

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.Free]: {
    links_limit: 10,
    projects_limit: 0,
    domains_limit: 0,
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
  [PlanType.Pro]: {
    links_limit: 1000,
    projects_limit: 5,
    domains_limit: 3,
    analytics_limit: 30,
    users_limit: 50,
    qr_limit: 500,
    pages_limit: 5,
    api_access: true,
  },
  [PlanType.Business]: {
    links_limit: 5000,
    projects_limit: 10,
    domains_limit: 5,
    analytics_limit: 60,
    users_limit: 10,
    qr_limit: 1000,
    pages_limit: 10,
    api_access: true,
  },
  [PlanType.Enterprise]: {
    links_limit: 10000,
    projects_limit: 25,
    domains_limit: 10,
    analytics_limit: 90,
    users_limit: 100,
    qr_limit: 5000,
    pages_limit: 25,
    api_access: true,
  },
};

export const getPlanLimits = (plan?: PlanType | string): PlanLimits =>
  PLAN_LIMITS[plan as PlanType] ?? PLAN_LIMITS[PlanType.Free];
