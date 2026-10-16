import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { upgradeSchema } from '../models/upgrade';
import { jsonValidator } from '../helper/validator';
import {
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
import { supportEmail } from '../services/emailer.service';

const subscription = new Hono<{ Bindings: CloudflareBindings }>();

subscription.post(
  '/create-checkout-session',
  jsonValidator(upgradeSchema),
  async (ctx) => {
    const { cf } = ctx.req.raw;
    const authUser: AuthUser = ctx.req['user'];
    const upgrade = ctx.req.valid('json');
    upgrade.currency = cf.country == 'IN' ? 'INR' : 'USD';
    const subscriptions = await getSubscritions(ctx.env, authUser);
    const session = await createCheckoutSession(
      ctx.env,
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
    throw new HTTPException(404, { message: 'No subscription' });
  }
  return ctx.json(subscriptions, 200);
});

subscription.delete('/:id', async (ctx) => {
  const id = Number(ctx.req.param('id'));
  const cancel_reason = ctx.req.query('cancel_reason');
  const authUser: AuthUser = ctx.req['user'];
  const subscriptions = await getSubscritions(ctx.env, authUser);
  if (!subscriptions || !subscriptions.length) {
    throw new HTTPException(404, { message: 'No subscription found' });
  }
  const subscription = subscriptions.find((x) => x.subscription_id === id);
  if (!subscription) {
    throw new HTTPException(404, { message: 'No subscription found' });
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

export { subscription };
