import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import {
  paypalSubscriptionWebhook,
  stripeWebhookHandler,
  verifyStripeWebhook,
} from '../services/stripe.service';
import {
  paypalWebhookHandler,
  verifyPaypalIpn,
  verifyPaypalWebhook,
} from '../services/paypal.service';

const webhook = new Hono<{ Bindings: CloudflareBindings }>();

webhook.post('/stripe', async (ctx) => {
  const bodyText = await ctx.req.text();
  const event = await verifyStripeWebhook(
    ctx.env,
    bodyText,
    ctx.req.header('stripe-signature')
  );
  if (!event) {
    throw new HTTPException(401, { message: 'Invalid Stripe signature' });
  }
  const stripeObject = event.data.object;
  const stripeEvent = event.type;
  await stripeWebhookHandler(ctx.env, stripeEvent, stripeObject);
  return ctx.json({ success: true }, 200);
});

// PayPal REST webhooks are signed with `paypal-transmission-*` headers, legacy
// IPN messages for older subscriptions are form posts without them. Both are
// verified with PayPal before anything is registered.
webhook.post('/paypal', async (ctx) => {
  const bodyText = await ctx.req.text();

  if (ctx.req.header('paypal-transmission-sig')) {
    let event: any;
    try {
      event = JSON.parse(bodyText);
    } catch {
      throw new HTTPException(400, { message: 'Invalid webhook payload' });
    }
    const verified = await verifyPaypalWebhook(ctx.env, ctx.req.raw.headers, bodyText);
    if (!verified) {
      throw new HTTPException(401, { message: 'Invalid PayPal signature' });
    }
    await paypalWebhookHandler(ctx.env, event);
    return ctx.json({ success: true }, 200);
  }

  const verified = await verifyPaypalIpn(ctx.env, bodyText);
  if (!verified) {
    throw new HTTPException(401, { message: 'Invalid PayPal IPN' });
  }
  await paypalSubscriptionWebhook(ctx.env, bodyText);
  return ctx.json({ success: true }, 200);
});

export { webhook };
