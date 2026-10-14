import { Context } from 'hono';
import { AuthUser } from '../models/auth-user';
import { Upgrade } from '../models/upgrade';
import Stripe from 'stripe';
import { HTTPException } from 'hono/http-exception';
import {
  Subscription,
  SubscriptionFrequency,
  SubscriptionGateway,
  SubscriptionStatus,
} from '../models/subscription';
import {
  cancelSubscription,
  createSubscription,
  getSubscriptionByCustomerId,
  updateSubscription,
} from './subscription.service';
import { Bindings } from '../types/bindings';
import { refreshAccountLimit } from './account.service';
import { PlanType } from '../models/plan';
import dayjs from '../lib/dayjsSetup';
import { Invoice, InvoiceItem } from '../models/invoice';
import { addInvoice } from './invoice.service';
import stripe from 'stripe';

const stripeClient = (env: Bindings) => {
  return new Stripe(env.STRIPE_SECRET_KEY);
};

export const createCheckoutSession = async (
  ctx: Context,
  upgrade: Upgrade,
  authUser: AuthUser,
  subscriptions: Array<Subscription>
) => {
  const stripe = stripeClient(ctx.env);
  const price = await getPriceId(stripe, upgrade);
  if (!price) {
    throw new HTTPException(400, { message: 'Invalid plan' });
  }

  const options: Stripe.Checkout.SessionCreateParams = {
    currency: upgrade.currency,
    payment_method_types: ['card'],
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: { user_id: authUser.user_id, account_id: authUser.account_id },
    client_reference_id: `{account_id:${authUser.account_id},user_id:${authUser.user_id}}`,
    allow_promotion_codes: true,
    success_url: `${ctx.env.APP_URL}/billings?return=success`,
    cancel_url: `${ctx.env.APP_URL}/billings?return=error`,
    billing_address_collection: 'required',
  };

  if (price.recurring) {
    options.mode = 'subscription';
    options.subscription_data = {
      metadata: {
        user_id: authUser.user_id,
        account_id: authUser.account_id,
      },
    };
  } else {
    options.mode = 'payment';
    options.payment_intent_data = {
      metadata: {
        user_id: authUser.user_id,
        account_id: authUser.account_id,
        plan: upgrade.plan,
      },
    };
  }

  if (subscriptions && subscriptions.length) {
    options.customer = subscriptions.find(
      (x) =>
        x.payment_gateway == SubscriptionGateway.Stripe &&
        x.currency == upgrade.currency
    )?.pg_customer_id;
  }

  if (!options.customer) {
    options.customer_email = authUser.email;
  }

  // Offer free trial for first time buyers only and not to repeat buyers or re-subscribers
  // https://github.com/Agenty/dayschedule-api/issues/374
  if (
    authUser.trial_end_at &&
    dayjs(dayjs()).isSameOrBefore(authUser.trial_end_at) &&
    !subscriptions?.length
  ) {
    options.subscription_data.trial_period_days = 7;
    // Add one-time Trial activation fee plan to verify card
    options.line_items.push({
      price: 'price_1Pyu27AnVXGCdVEDWUXUn5yO',
      quantity: 1,
    });
  }

  return await stripe.checkout.sessions.create(options);
};

export const getPriceId = async (stripe: Stripe, upgrade: Upgrade) => {
  const prices = await stripe.prices.list({
    expand: ['data.product'], // Get product data as well
  });
  return prices.data.find((x) => x.unit_amount == upgrade.price * 100);
};

export const retrieveSubscription = async (
  env: Bindings,
  subscription: Subscription
) => {
  return await stripeClient(env).subscriptions.retrieve(
    subscription.pg_customer_id
  );
};

const invoiceHandler = async (env: Bindings, event: stripe.Event) => {
  // if (event.type == 'invoice.payment_action_required') {
  //   const invoice = event.data.object as stripe.Invoice;
  //   if (invoice.billing_reason == 'subscription_cycle') {
  //     await invoiceActionRequiredEmail(env, invoice);
  //   }
  // } else

  if (
    event.type == 'payment_intent.payment_failed' ||
    event.type == 'payment_intent.canceled'
  ) {
    return;
  } else if (event.type === 'payment_intent.succeeded') {
    const invc = event.data.object as stripe.PaymentIntent;
    const subscription: any = await getSubscriptionByCustomerId(
      env,
      invc.customer.toString()
    );
    if (!subscription) return;

    //object for invoice
    const amount = Number(invc.amount_received / 100);
    const tax = amount - amount / (0.18 + 1);
    const taxInclusive = invc.currency.toUpperCase() == 'INR' ? true : false;
    //https://www.quora.com/What-is-the-formula-for-calculating-the-inclusive-tax-amount-from-a-given-amount

    const invoice: Invoice = {
      account_id: subscription.account_id,
      user_id: subscription.user_id,
      subscription_id: subscription.subscription_id,
      initial: 'IDM',
      amount_paid: amount,
      currency: invc.currency.toUpperCase(),
      tax_inclusive: taxInclusive,
      tax_percent: taxInclusive ? 18 : 0,
      tax_amount: taxInclusive ? tax : 0,
      status: invc.status,
      paid_at: new Date(invc.created * 1000).toISOString(),
      period_start_at: subscription.start_date
        ? new Date(subscription.start_date).toISOString()
        : null,
      period_end_at: subscription.next_pay_date
        ? new Date(subscription.next_pay_date).toISOString()
        : null,
      payment_gateway: SubscriptionGateway.Stripe,
      transaction_id: invc.id,
      transaction_fee: null,
    };

    //get subscription detail by subscription id from stripe
    const invoiceItem: InvoiceItem = {
      product_id: subscription.plan_id,
      product_name: subscription.plan,
    };
    if (subscription.pg_customer_id) {
      const stripeSubscription = await retrieveSubscription(env, subscription);
      // const taxItem = stripeSubscription.items.data[0].tax_rates[0];

      if (stripeSubscription.status == 'trialing') {
        invoiceItem.product_description = `Trial activation fee`;
        invoiceItem.unit_price = amount - tax;
        invoiceItem.quantity = 1;
      } else {
        invoiceItem.product_description = `${subscription.plan} plan at ${subscription.currency} ${subscription.amount} per ${subscription.frequency}`;
        invoiceItem.unit_price = amount - tax;
        invoiceItem.quantity = 1;
      }
    } else {
      invoiceItem.product_description = `${subscription.plan} plan per ${subscription.frequency}`;
      invoiceItem.unit_price = amount - tax;
      invoiceItem.quantity = 1;
    }
    invoice.items = [invoiceItem];
    await addInvoice(env, invoice);
  }
};

export const stripeWebhookHandler = async (
  env: Bindings,
  stripeEvent: string,
  stripeObject: any
) => {
  if (stripeEvent.includes('customer.subscription')) {
    await subscriptionHandler(env, stripeObject, stripeEvent);
  } else if (stripeEvent.includes('payment_intent.succeeded')) {
    const { metadata } = stripeObject;
    if (metadata.plan == 'Lifetime') {
      await createLifetimeSubscription(env, stripeObject, stripeEvent);
    }
  } else {
    await invoiceHandler(env, stripeObject);
  }
};

export const subscriptionHandler = async (
  env: Bindings,
  stripeObject: any,
  stripeEvent: string
) => {
  const subscription: Subscription = {
    account_id: Number(stripeObject.metadata.account_id),
    user_id: Number(stripeObject.metadata.user_id),
    payment_gateway: SubscriptionGateway.Stripe,
    pg_customer_id: stripeObject.customer,
    pg_subscr_id: stripeObject.id,
    status: stripeObject.status,
  };

  // Test user
  if (!stripeObject.livemode) {
    subscription.account_id = 1;
    subscription.user_id = null;
  }

  // Get customer details from existing subscriptions, if empty
  if (!subscription.account_id) {
    const customer: any = await getSubscriptionByCustomerId(
      env,
      subscription.pg_customer_id
    );
    subscription.account_id = customer.account_id;
    subscription.user_id = customer.user_id || subscription.user_id;
  }

  if (stripeEvent === 'customer.subscription.deleted') {
    subscription.cancel_date = new Date().toISOString();
  } else {
    const item = stripeObject.items.data[0];
    const stripe = stripeClient(env);
    const price: any = await getPriceId(stripe, {
      currency: item.plan.currency,
      price: item.plan.amount / 100,
    } as Upgrade);

    subscription.plan =
      price && price.product ? price.product.name : item.plan.id;
    subscription.plan_id = item.plan.id;
    subscription.amount = (item.plan.amount / 100) * item.quantity;
    subscription.currency = item.plan.currency.toUpperCase();
    subscription.frequency = item.plan.interval;
    subscription.start_date = new Date(
      stripeObject.current_period_start * 1000
    ).toISOString();
    subscription.last_pay_date = new Date().toISOString();
    subscription.next_pay_date = new Date(
      stripeObject.current_period_end * 1000
    ).toISOString();
    subscription.cancel_date = null;
  }

  // Recheck status if incomplete etc
  if (
    subscription.status != SubscriptionStatus.active &&
    (stripeEvent === 'customer.subscription.created' ||
      stripeEvent === 'customer.subscription.updated')
  ) {
    const stripe = stripeClient(env);
    const sub = await stripe.subscriptions.retrieve(subscription.pg_subscr_id);
    subscription.status = sub.status.toString() as SubscriptionStatus;
  }

  if (stripeEvent === 'customer.subscription.created') {
    await createSubscription(env, subscription); // Use the update always to create or update
  } else if (stripeEvent === 'customer.subscription.updated') {
    const updatedSuccessfull = await updateSubscription(env, subscription);
    if (!updatedSuccessfull) {
      // Create new subscription if 0 rows affected as the update request may arrived early
      // due to race-condition on Stripe webhook
      // https://github.com/Agenty/dayschedule-api/issues/375
      await createSubscription(env, subscription);
    }
  } else if (stripeEvent === 'customer.subscription.deleted') {
    // Set seats to 1 and plan to Free after canceled
    // Users are not allowed to convert from paid to basic, so deactivate the account
    const result = await cancelSubscription(env, subscription);
    if (!result) {
      throw new HTTPException(400, {
        message: `Failed to cancel subscription or no subscription exist with ${subscription.pg_customer_id}`,
      });
    }
  } else {
    throw new Error(`No webhook configured for stripe event: ${stripeEvent}`);
  }

  await refreshAccountLimit(env, subscription);
};

export const createLifetimeSubscription = async (
  env: Bindings,
  stripeObject: any,
  stripeEvent: string
) => {
  const subscription: Subscription = {
    account_id: Number(stripeObject.metadata.account_id),
    user_id: Number(stripeObject.metadata.user_id),
    payment_gateway: SubscriptionGateway.Stripe,
    pg_customer_id: stripeObject.customer,
    pg_subscr_id: stripeObject.id,
    status: SubscriptionStatus.active,
    plan: PlanType.Basic,
    plan_id: 'lifetime',
    amount: stripeObject.amount / 100,
    currency: stripeObject.currency.toUpperCase(),
    frequency: SubscriptionFrequency.lifetime,
    start_date: new Date().toISOString(),
    last_pay_date: new Date().toISOString(),
    next_pay_date: dayjs().add(100, 'years').toISOString(),
    cancel_date: null,
  };

  // Test user
  if (!stripeObject.livemode) {
    subscription.account_id = 1;
  }

  // Create of update
  await createSubscription(env, subscription);
  await refreshAccountLimit(env, subscription);
};

export const cancelStripeSubscription = async (
  env: Bindings,
  subscription: Subscription
) => {
  const stripe = stripeClient(env);
  await stripe.subscriptions.cancel(subscription.pg_subscr_id);
};

export const applyStripeCoupon = async (
  env: Bindings,
  subscription: Subscription
) => {
  const stripe = stripeClient(env);
  const couponId = env.ENVIRONMENT === 'production' ? '7TJQPeht' : 'tOVdTnfA';
  // Fetch subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.pg_subscr_id
  );

  // Check if the coupon has already been applied
  if (
    stripeSubscription.discount &&
    stripeSubscription.discount.coupon.id === couponId
  ) {
    throw new HTTPException(400, {
      message:
        'This coupon has already been used. Click on manage subscription button to see discounted prices.',
    });
  }

  // Apply the coupon if it hasn't been used
  await stripe.subscriptions.update(subscription.pg_subscr_id, {
    coupon: couponId,
  });
};

export const getPlan = (value: string) => {
  if (!value) return PlanType.Free;
  const keys = Object.keys(PlanType);
  const plan =
    keys.find((x) => x == value) || keys.find((x) => value.includes(x));
  return plan ? plan : PlanType.Free;
};

const getFrequency = (paypalEvent: any) => {
  if (paypalEvent.period3) {
    return paypalEvent.period3 == '1 M'
      ? SubscriptionFrequency.month
      : SubscriptionFrequency.year;
  }

  if (paypalEvent.item_number) {
    return paypalEvent.item_number.includes('_month')
      ? SubscriptionFrequency.month
      : SubscriptionFrequency.year;
  }
  return SubscriptionFrequency.month;
};

const parsePaypal = (queryString: any) => {
  let params = new URLSearchParams(queryString);
  let paypal: any = {};
  for (let [key, value] of params.entries()) {
    paypal[key] = value;
  }

  const [userId, orgId, seats] = paypal.custom
    ? paypal.custom.split('_').map(Number)
    : [0, 0, 1];

  const subscription: Subscription = {
    account_id: orgId,
    user_id: userId,
    plan: getPlan(paypal.item_name || paypal.item_number),
    plan_id: paypal.item_number,
    amount: Number(paypal.mc_gross || paypal.mc_amount3 || paypal.amount),
    currency: paypal.mc_currency || paypal.currency_code,
    frequency: getFrequency(paypal),
    payment_gateway: SubscriptionGateway.Paypal,
    pg_subscr_id: paypal.subscr_id || paypal.recurring_payment_id,
    pg_customer_id: paypal.payer_id,
    status: paypal.payment_status,
    last_pay_date: new Date().toISOString(),
  };

  subscription.frequency =
    subscription.frequency || SubscriptionFrequency.month;

  subscription.next_pay_date = dayjs()
    .add(1, subscription.frequency as dayjs.ManipulateType)
    .toDate()
    .toISOString();

  return { subscription, paypal };
};

export const paypalSubscriptionWebhook = async (
  env: Bindings,
  payPalObject: any
) => {
  const { subscription, paypal } = parsePaypal(payPalObject);
  
  // Get customer details from existing subscriptions, if empty
  if (!subscription.account_id) {
    const customer: any = await getSubscriptionByCustomerId(
      env,
      subscription.pg_customer_id
    );

    if (customer) {
      subscription.account_id = customer.account_id;
      subscription.user_id = customer.user_id || subscription.user_id;
    }
  }

  if (!subscription.account_id) {
    return;
  }

  const payPalEvent = paypal.txn_type?.toLowerCase().trim();
  const paymentStatus =
    paypal.payment_status?.replace('Completed', 'paid') || 'paid';
  subscription.status =
    paymentStatus == 'paid' ? SubscriptionStatus.active : paymentStatus;

  // Create the invoice
  if (
    ['completed', 'paid'].includes(paymentStatus) &&
    (payPalEvent == 'subscr_payment' || payPalEvent == 'web_accept')
  ) {
    const invoice: Invoice = {
      account_id: subscription.account_id,
      user_id: subscription.user_id,
      subscription_id: subscription.subscription_id,
      initial: 'IDM',
      amount_paid: subscription.amount,
      currency: subscription.currency.toUpperCase(),
      tax_percent: subscription.currency.toUpperCase() == 'INR' ? 18 : 0,
      //tax_amount: stripeObject.currency.toUpperCase() == 'INR' ? tax : 0, // 18% GST
      status: paymentStatus,
      paid_at: new Date().toISOString(),
      period_start_at: new Date().toISOString(),
      period_end_at: subscription.next_pay_date
        ? new Date(subscription.next_pay_date).toISOString()
        : null,
      payment_gateway: SubscriptionGateway.Paypal,
      transaction_fee: Number(paypal.payment_fee),
      transaction_id: paypal.txn_id,
    };

    //get subscription detail by subscription id from stripe
    invoice.items = [
      {
        product_id: subscription.plan_id,
        product_name: subscription.plan,
        product_description: `${subscription.plan} plan at ${subscription.currency} ${subscription.amount} per ${subscription.frequency}`,
        unit_price: subscription.amount,
        quantity: 1,
      },
    ];
    await addInvoice(env, invoice);
  }

  if (payPalEvent == 'subscr_signup') {
    subscription.start_date = new Date().toISOString();
    await createSubscription(env, subscription);
  } else if (payPalEvent == 'subscr_payment') {
    const isUpdated = await updateSubscription(env, subscription);
    if (!isUpdated) {
      subscription.start_date = new Date().toISOString();
      await createSubscription(env, subscription);
    }
  } else if (payPalEvent == 'subscr_cancel') {
    subscription.status = SubscriptionStatus.cancelled;
    subscription.cancel_date = new Date().toISOString();
    await cancelSubscription(env, subscription);
  } else if (
    [
      'subscr_eot',
      'subscr_failed',
      'recurring_payment_suspended_due_to_max_failed_payment',
    ].includes(payPalEvent)
  ) {
    subscription.status = SubscriptionStatus.expired;
    subscription.cancel_date = new Date().toISOString();
    await cancelSubscription(env, subscription);
  }

  await refreshAccountLimit(env, subscription);
};
