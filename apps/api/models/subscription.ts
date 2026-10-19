export enum SubscriptionGateway {
  Stripe = 'Stripe',
  Paypal = 'Paypal',
  NEFT = 'NEFT',
}

export enum SubscriptionFrequency {
  month = 'month',
  quarter = 'quarter',
  year = 'year',
  lifetime = 'lifetime',
}

export enum SubscriptionStatus {
  active = 'active',
  cancelled = 'cancelled',
  expired = 'expired',
  cancellation_requested = 'cancellation_requested',
}

export interface Subscription {
  subscription_id?: number;
  account_id?: number;
  user_id?: number;
  plan?: string;
  plan_id?: string;
  amount?: number;
  currency?: string;
  frequency?: SubscriptionFrequency;
  payment_gateway: SubscriptionGateway;
  pg_subscr_id?: string;
  pg_customer_id?: string;
  status: SubscriptionStatus;
  start_date?: Date | string;
  last_pay_date?: Date | string;
  next_pay_date?: Date | string;
  cancel_date?: Date | string;
  is_recent?: boolean;
  cancel_reason?: string;
}
