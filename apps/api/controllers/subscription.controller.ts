import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { Bindings } from '../types/bindings';
import { Upgrade, upgradeSchema } from '../models/upgrade';
import {
  applyStripeCoupon,
  cancelStripeSubscription,
  createCheckoutSession,
} from '../services/stripe.service';
import { AuthUser } from '../models/auth-user';
import {
  cancelSubscription,
  getSubscritions,
} from '../services/subscription.service';
import {
  SubscriptionGateway,
  SubscriptionStatus,
} from '../models/subscription';
import { contactEmail, supportEmail } from '../services/emailer.service';

const subscription = new Hono<{ Bindings: Bindings }>();

subscription.post(
  '/create-checkout-session',
  validator('json', (value, ctx) => {
    const parsed = upgradeSchema.safeParse(value);
    if (!parsed.success) {
      return ctx.json(parsed, 400);
    }
    return parsed.data as Upgrade;
  }),
  async (ctx) => {
    const { cf } = ctx.req.raw;
    const authUser: AuthUser = ctx.req['user'];
    const upgrade = ctx.req.valid('json');
    upgrade.currency = cf.country == 'IN' ? 'INR' : 'USD';
    const subscriptions = await getSubscritions(ctx.env, authUser);
    const session = await createCheckoutSession(
      ctx,
      upgrade,
      authUser,
      subscriptions
    );
    return ctx.json({ id: session.id }, 200);
  }
);

subscription.get('/', async (ctx) => {
  const authUser: AuthUser = ctx.req['user'];
  const subscriptions = await getSubscritions(ctx.env, authUser);
  if (!subscriptions) {
    return ctx.json({ message: 'No subscription' }, 404);
  }
  return ctx.json(subscriptions, 200);
});

subscription.delete('/:id', async (ctx) => {
  const id = Number(ctx.req.param('id'));
  const cancel_reason = ctx.req.query('cancel_reason');
  const authUser: AuthUser = ctx.req['user'];
  const subscriptions = await getSubscritions(ctx.env, authUser);
  if (!subscriptions || !subscriptions.length) {
    return ctx.json({ message: 'No subscription found' }, 404);
  }
  const subscription = subscriptions.find((x) => x.subscription_id === id);
  if (!subscription) {
    return ctx.json({ message: 'No subscription found' }, 404);
  }

  subscription.status = SubscriptionStatus.cancellation_requested;
  subscription.cancel_reason = cancel_reason;
  await cancelSubscription(ctx.env, subscription);

  if (subscription.payment_gateway == SubscriptionGateway.Stripe) {
    await cancelStripeSubscription(ctx.env, subscription);
  } else {
    await supportEmail(
      ctx.env,
      'Subscription cancellation request',
      subscription
    );
  }
  return ctx.json({ message: 'Subscription cancelled successfully' }, 200);
});

subscription.get('/:id/coupon', async (ctx) => {
  const id = Number(ctx.req.param('id'));
  const authUser: AuthUser = ctx.req['user'];
  const subscriptions = await getSubscritions(ctx.env, authUser);
  if (!subscriptions || !subscriptions.length) {
    return ctx.json({ message: 'No subscription found' }, 404);
  }
  const subscription = subscriptions.find((x) => x.subscription_id === id);
  if (!subscription) {
    return ctx.json({ message: 'No subscription found' }, 404);
  }

  await applyStripeCoupon(ctx.env, subscription);
  return ctx.json({ message: 'Coupon applied successfully' }, 200);
});

export { subscription };
