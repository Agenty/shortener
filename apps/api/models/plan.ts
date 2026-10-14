export enum PlanType {
  Free = 'Free',
  Basic = 'Basic',
  Pro = 'Pro',
  Business = 'Business',
  Enterprise = 'Enterprise',
}

export class Plan {
  links_limit?: number;
  projects_limit?: number;
  domains_limit?: number;
  analytics_limit?: number;
  api_access?: boolean;
  users_limit?: number;
  qr_limit?: number;
  pages_limit?: number;

  constructor(plan: PlanType) {
    switch (plan) {
      case PlanType.Basic:
        this.links_limit = 500;
        this.projects_limit = 3;
        this.domains_limit = 1;
        this.analytics_limit = 7;
        this.users_limit = 2;
        this.qr_limit = 100;
        this.pages_limit = 2;
        this.api_access = true;
        break;

      case PlanType.Pro:
        this.links_limit = 1000;
        this.projects_limit = 5;
        this.domains_limit = 3;
        this.analytics_limit = 30;
        this.users_limit = 50;
        this.qr_limit = 500;
        this.pages_limit = 5;
        this.api_access = true;
        break;

      case PlanType.Business:
        this.links_limit = 5000;
        this.projects_limit = 10;
        this.domains_limit = 5;
        this.analytics_limit = 60;
        this.users_limit = 10;
        this.qr_limit = 1000;
        this.pages_limit = 10;
        this.api_access = true;
        break;

      case PlanType.Enterprise:
        this.links_limit = 10000;
        this.projects_limit = 25;
        this.domains_limit = 10;
        this.analytics_limit = 90;
        this.users_limit = 100;
        this.qr_limit = 5000;
        this.pages_limit = 25;
        this.api_access = true;
        break;

      default:
        this.links_limit = 10;
        this.projects_limit = 0;
        this.domains_limit = 0;
        this.analytics_limit = 7;
        this.users_limit = 0;
        this.qr_limit = 1;
        this.pages_limit = 1;
        this.api_access = false;
        break;
    }
  }
}
