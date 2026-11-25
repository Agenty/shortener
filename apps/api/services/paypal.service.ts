import { HTTPException } from 'hono/http-exception';
import { addMonths, addYears } from 'date-fns';
import { AuthUser } from '../models/auth-user';
import { Upgrade } from '../models/upgrade';
import { PLAN_PRICES, PlanType } from '../models/plan';
import { Invoice } from '../models/invoice';
import {
  Subscription,
  SubscriptionFrequency,
  SubscriptionGateway,
  SubscriptionStatus,
} from '../models/subscription';
import {
  cancelSubscription,
  createSubscription,
  getSubscriptionByGatewayId,
  updateSubscription,
} from './subscription.service';
import { refreshAccountLimit } from './account.service';
import { addInvoice } from './invoice.service';

// PayPal REST API, set PAYPAL_API_URL to https://api-m.sandbox.paypal.com for sandbox
// https://developer.paypal.com/api/rest/
const LIVE_API_URL = 'https://api-m.paypal.com';
const LIFETIME = 'Lifetime';

const apiUrl = (env: CloudflareBindings) => env.PAYPAL_API_URL || LIVE_API_URL;

const isSandbox = (env: CloudflareBindings) => apiUrl(env).includes('sandbox');

const getAccessToken = async (env: CloudflareBindings) => {
  // Keyed by client id so sandbox and live tokens never mix in a shared KV
  const cacheKey = `paypal:token:${env.PAYPAL_CLIENT_ID}`;
  const cached = await env.KVCACHE.get(cacheKey);
  if (cached) return cached;

  const r = await fetch(`${apiUrl(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`)}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) {
    throw new HTTPException(502, { message: 'PayPal authentication failed' });
  }

  const { access_token, expires_in } = await r.json<{
    access_token: string;
    expires_in: number;
  }>();
  // Refresh 5 minutes before PayPal expires the token
  await env.KVCACHE.put(cacheKey, access_token, {
    expirationTtl: Math.max(60, expires_in - 300),
  });
  return access_token;
};

const paypalRequest = async <T>(
  env: CloudflareBindings,
  path: string,
  init: { method?: string; body?: string; headers?: Record<string, string> } = {}
) => {
  const token = await getAccessToken(env);
  const r = await fetch(`${apiUrl(env)}${path}`, {
    method: init.method || 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...init.headers,
    },
    body: init.body,
  });
  if (!r.ok) {
    const error = await r.text();
    throw new HTTPException(502, {
      message: `PayPal ${init.method || 'GET'} ${path} failed with ${r.status}: ${error}`,
    });
  }
  return (r.status == 204 ? null : await r.json()) as T;
};

/** One PayPal catalog product for all plans, created on first checkout */
const getProductId = async (env: CloudflareBindings) => {
  const cacheKey = `paypal:product:${env.PAYPAL_CLIENT_ID}`;
  const cached = await env.KVCACHE.get(cacheKey);
  if (cached) return cached;

  const product = await paypalRequest<{ id: string }>(env, '/v1/catalogs/products', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Shortener',
      description: 'Shortener.dev subscription',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  });
  await env.KVCACHE.put(cacheKey, product.id);
  return product.id;
};

/** PayPal billing plan for a monthly plan at its price, created on first checkout */
const getPlanId = async (env: CloudflareBindings, plan: string) => {
  const price = PLAN_PRICES[plan];
  const cacheKey = `paypal:plan:${env.PAYPAL_CLIENT_ID}:${plan}:${price}`;
  const cached = await env.KVCACHE.get(cacheKey);
  if (cached) return cached;

  const productId = await getProductId(env);
  const created = await paypalRequest<{ id: string }>(env, '/v1/billing/plans', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      name: plan,
      description: `${plan} plan at USD ${price} per month`,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: price.toFixed(2), currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    }),
  });
  await env.KVCACHE.put(cacheKey, created.id);
  return created.id;
};

// `custom_id` carries the account through checkout, e.g. 12_34_Pro
const toCustomId = (authUser: AuthUser, plan: string) =>
  `${authUser.account_id}_${authUser.user_id}_${plan}`;

const parseCustomId = (customId?: string) => {
  const [accountId, userId, plan] = (customId || '').split('_');
  return {
    account_id: Number(accountId) || 0,
    user_id: Number(userId) || null,
    plan,
  };
};

const approveUrl = (links: Array<{ href: string; rel: string }>) =>
  links.find((x) => x.rel == 'approve' || x.rel == 'payer-action')?.href;

/**
 * Starts a PayPal subscription for monthly plans, or a one-time order for the
 * lifetime deal. Prices come from PLAN_PRICES, the client price is ignored.
 */
export const createPaypalCheckout = async (
  env: CloudflareBindings,
  upgrade: Upgrade,
  authUser: AuthUser
) => {
  if (!PLAN_PRICES[upgrade.plan]) {
    throw new HTTPException(400, { message: 'Invalid plan' });
  }
  if (upgrade.plan != LIFETIME && upgrade.frequency != 'month') {
    throw new HTTPException(400, {
      message: 'Only monthly billing is available with PayPal',
    });
  }

  const context = {
    brand_name: 'Shortener',
    shipping_preference: 'NO_SHIPPING',
    return_url: `${env.APP_URL}/billings?return=success`,
    cancel_url: `${env.APP_URL}/billings?return=error`,
  };

  if (upgrade.plan == LIFETIME) {
    const order = await paypalRequest<{ id: string; links: any[] }>(
      env,
      '/v2/checkout/orders',
      {
        method: 'POST',
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              custom_id: toCustomId(authUser, LIFETIME),
              description: 'Shortener Pro, lifetime deal',
              amount: {
                currency_code: 'USD',
                value: PLAN_PRICES[LIFETIME].toFixed(2),
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: { ...context, user_action: 'PAY_NOW' },
            },
          },
        }),
      }
    );
    return { id: order.id, url: approveUrl(order.links) };
  }

  const subscription = await paypalRequest<{ id: string; links: any[] }>(
    env,
    '/v1/billing/subscriptions',
    {
      method: 'POST',
      body: JSON.stringify({
        plan_id: await getPlanId(env, upgrade.plan),
        custom_id: toCustomId(authUser, upgrade.plan),
        subscriber: { email_address: authUser.email },
        application_context: { ...context, user_action: 'SUBSCRIBE_NOW' },
      }),
    }
  );
  return { id: subscription.id, url: approveUrl(subscription.links) };
};

export const cancelPaypalSubscription = async (
  env: CloudflareBindings,
  subscription: Subscription,
  reason?: string
) => {
  await paypalRequest(
    env,
    `/v1/billing/subscriptions/${subscription.pg_subscr_id}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Cancelled by customer' }),
    }
  );
};

/**
 * Asks PayPal whether the webhook was signed by PayPal for our webhook id.
 * The raw body is passed through untouched, re-serializing it can change the
 * bytes and fail verification.
 * https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
 */
export const verifyPaypalWebhook = async (
  env: CloudflareBindings,
  headers: Headers,
  rawBody: string
) => {
  if (!env.PAYPAL_WEBHOOK_ID) return false;

  const fields = {
    auth_algo: headers.get('paypal-auth-algo'),
    cert_url: headers.get('paypal-cert-url'),
    transmission_id: headers.get('paypal-transmission-id'),
    transmission_sig: headers.get('paypal-transmission-sig'),
    transmission_time: headers.get('paypal-transmission-time'),
    webhook_id: env.PAYPAL_WEBHOOK_ID,
  };
  if (Object.values(fields).some((x) => !x)) return false;

  // `rawBody` was already parsed by the caller, so it is a single JSON value
  const body = `${JSON.stringify(fields).slice(0, -1)},"webhook_event":${rawBody}}`;
  const result = await paypalRequest<{ verification_status: string }>(
    env,
    '/v1/notifications/verify-webhook-signature',
    { method: 'POST', body }
  );
  return result.verification_status == 'SUCCESS';
};

/**
 * Verifies a legacy IPN message by posting it back to PayPal
 * https://developer.paypal.com/api/nvp-soap/ipn/IPNImplementation/
 */
export const verifyPaypalIpn = async (env: CloudflareBindings, rawBody: string) => {
  const ipnUrl = isSandbox(env)
    ? 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr'
    : 'https://ipnpb.paypal.com/cgi-bin/webscr';
  const r = await fetch(ipnUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'shortener-ipn-verification',
    },
    body: `cmd=_notify-validate&${rawBody}`,
  });
  return r.ok && (await r.text()).trim() == 'VERIFIED';
};

const toStatus = (paypalStatus: string) =>
  ({
    ACTIVE: SubscriptionStatus.active,
    CANCELLED: SubscriptionStatus.cancelled,
    SUSPENDED: SubscriptionStatus.expired,
    EXPIRED: SubscriptionStatus.expired,
  })[paypalStatus];

/**
 * Creates or updates our subscription from a PayPal subscription resource.
 * New subscriptions are only registered when they are on our billing plan for
 * the plan in `custom_id`, since anyone with our public client id can create
 * a PayPal subscription.
 */
const syncSubscription = async (env: CloudflareBindings, resource: any) => {
  const status = toStatus(resource.status);
  if (!status) return; // Not approved yet

  const existing = await getSubscriptionByGatewayId(env, resource.id);
  const { account_id, user_id, plan } = parseCustomId(resource.custom_id);

  if (!existing) {
    if (
      !account_id ||
      plan == LIFETIME ||
      !PLAN_PRICES[plan] ||
      resource.plan_overridden ||
      resource.plan_id != (await getPlanId(env, plan))
    ) {
      console.warn(`Ignored PayPal subscription ${resource.id}, unknown plan`);
      return;
    }
  }

  const subscription: Subscription = {
    account_id: existing?.account_id || account_id,
    user_id: existing?.user_id || user_id,
    plan: existing?.plan || plan,
    plan_id: resource.plan_id,
    amount: existing?.amount || PLAN_PRICES[plan],
    currency: 'USD',
    frequency: SubscriptionFrequency.month,
    payment_gateway: SubscriptionGateway.Paypal,
    pg_subscr_id: resource.id,
    pg_customer_id: resource.subscriber?.payer_id || existing?.pg_customer_id,
    status,
    start_date: resource.start_time || new Date().toISOString(),
    last_pay_date:
      resource.billing_info?.last_payment?.time || new Date().toISOString(),
    next_pay_date:
      resource.billing_info?.next_billing_time ||
      addMonths(new Date(), 1).toISOString(),
    cancel_date: null,
  };

  if (status == SubscriptionStatus.active) {
    const isUpdated = existing && (await updateSubscription(env, subscription));
    if (!isUpdated) {
      await createSubscription(env, subscription);
    }
    await refreshAccountLimit(env, subscription);
  } else if (existing) {
    // Cancelled or suspended after failed payments, back to the Free plan
    subscription.cancel_date = new Date().toISOString();
    await cancelSubscription(env, subscription);
    await refreshAccountLimit(env, { ...subscription, plan: undefined });
  }
};

/** Renewal payment of a subscription, `resource` is a sale */
const subscriptionPayment = async (env: CloudflareBindings, resource: any) => {
  const subscriptionId = resource.billing_agreement_id;
  if (!subscriptionId) return;

  // Refresh the billing dates, the payment may also be the one that activates it
  const paypalSubscription = await paypalRequest<any>(
    env,
    `/v1/billing/subscriptions/${subscriptionId}`
  );
  await syncSubscription(env, paypalSubscription);

  const subscription = await getSubscriptionByGatewayId(env, subscriptionId);
  if (!subscription) return;

  await addPaypalInvoice(env, subscription, {
    amount: Number(resource.amount.total),
    currency: resource.amount.currency,
    transaction_id: resource.id,
    transaction_fee: Number(resource.transaction_fee?.value || 0),
  });
};

/** Lifetime deal order approved by the buyer, capture the payment */
const captureOrder = async (env: CloudflareBindings, resource: any) => {
  if (resource.intent != 'CAPTURE' || resource.status != 'APPROVED') return;
  await paypalRequest(env, `/v2/checkout/orders/${resource.id}/capture`, {
    method: 'POST',
    // Idempotent, so a retried webhook does not capture twice
    headers: { 'paypal-request-id': `capture-${resource.id}` },
  });
};

/** Lifetime deal payment captured, `resource` is a capture */
const lifetimePayment = async (env: CloudflareBindings, resource: any) => {
  const { account_id, user_id, plan } = parseCustomId(resource.custom_id);
  const amount = Number(resource.amount?.value);
  if (
    !account_id ||
    plan != LIFETIME ||
    resource.amount?.currency_code != 'USD' ||
    amount < PLAN_PRICES[LIFETIME]
  ) {
    console.warn(`Ignored PayPal capture ${resource.id}, unknown payment`);
    return;
  }

  // Webhooks are retried, register each capture once
  if (await getSubscriptionByGatewayId(env, resource.id)) return;

  const subscription: Subscription = {
    account_id,
    user_id,
    payment_gateway: SubscriptionGateway.Paypal,
    pg_customer_id: resource.supplementary_data?.related_ids?.order_id,
    pg_subscr_id: resource.id,
    status: SubscriptionStatus.active,
    plan: PlanType.Pro, // The lifetime deal is the Pro plan
    plan_id: 'lifetime',
    amount,
    currency: 'USD',
    frequency: SubscriptionFrequency.lifetime,
    start_date: new Date().toISOString(),
    last_pay_date: new Date().toISOString(),
    next_pay_date: addYears(new Date(), 100).toISOString(),
    cancel_date: null,
  };
  subscription.subscription_id = await createSubscription(env, subscription);
  await refreshAccountLimit(env, subscription);

  await addPaypalInvoice(env, subscription, {
    amount,
    currency: 'USD',
    transaction_id: resource.id,
    transaction_fee: Number(
      resource.seller_receivable_breakdown?.paypal_fee?.value || 0
    ),
  });
};

const addPaypalInvoice = async (
  env: CloudflareBindings,
  subscription: Subscription,
  payment: {
    amount: number;
    currency: string;
    transaction_id: string;
    transaction_fee: number;
  }
) => {
  const invoice: Invoice = {
    account_id: subscription.account_id,
    user_id: subscription.user_id,
    subscription_id: subscription.subscription_id,
    initial: 'SRT',
    amount_paid: payment.amount,
    currency: payment.currency.toUpperCase(),
    tax_percent: 0,
    status: 'paid',
    paid_at: new Date().toISOString(),
    period_start_at: new Date().toISOString(),
    period_end_at: subscription.next_pay_date
      ? new Date(subscription.next_pay_date).toISOString()
      : null,
    payment_gateway: SubscriptionGateway.Paypal,
    transaction_id: payment.transaction_id,
    transaction_fee: payment.transaction_fee,
    items: [
      {
        product_id: subscription.plan_id,
        product_name: subscription.plan,
        product_description:
          subscription.frequency == SubscriptionFrequency.lifetime
            ? `${subscription.plan} plan, lifetime deal`
            : `${subscription.plan} plan at ${subscription.currency} ${subscription.amount} per ${subscription.frequency}`,
        unit_price: payment.amount,
        quantity: 1,
      },
    ],
  };
  await addInvoice(env, invoice);
};

/** Handles a PayPal webhook event, call only after `verifyPaypalWebhook` */
export const paypalWebhookHandler = async (env: CloudflareBindings, event: any) => {
  const { event_type, resource } = event;
  switch (event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
    case 'BILLING.SUBSCRIPTION.RE-ACTIVATED':
    case 'BILLING.SUBSCRIPTION.UPDATED':
    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
    case 'BILLING.SUBSCRIPTION.EXPIRED':
      await syncSubscription(env, resource);
      break;
    case 'PAYMENT.SALE.COMPLETED':
      await subscriptionPayment(env, resource);
      break;
    case 'CHECKOUT.ORDER.APPROVED':
      await captureOrder(env, resource);
      break;
    case 'PAYMENT.CAPTURE.COMPLETED':
      await lifetimePayment(env, resource);
      break;
  }
};
