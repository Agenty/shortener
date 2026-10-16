import { Hono } from 'hono';
import {
  paypalSubscriptionWebhook,
  stripeWebhookHandler,
} from '../services/stripe.service';

const webhook = new Hono<{ Bindings: CloudflareBindings }>();

webhook.post('/stripe', async (ctx) => {
  const event = await ctx.req.json();
  const stripeObject = event.data.object;
  const stripeEvent = event.type;
  await stripeWebhookHandler(ctx.env, stripeEvent, stripeObject);
  return ctx.json({ success: true }, 200);
});

webhook.post('/paypal', async (ctx) => {
  const bodyText = await ctx.req.text();
  await paypalSubscriptionWebhook(ctx.env, bodyText);
  return ctx.json({ success: true }, 200);
});

export { webhook };
