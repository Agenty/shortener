---
title: Self-host Shortener.dev on Cloudflare
nav: Self-hosting
description: Run your own copy of the open-source Shortener.dev URL shortener on Cloudflare Workers with D1, KV and R2, on your own short domain.
section: Help
order: 4
updated: 2026-11-14
---

Shortener.dev is open source under the AGPLv3, and the [repository](https://github.com/Agenty/shortener) has everything that runs shortener.dev: the API, the dashboard and the website. You can run your own copy on your Cloudflare account and serve short links from your own domain.

Self-hosting makes sense if you want short links on your own domain, need data to stay in your Cloudflare account, or want to change how the shortener works. If you just want short links, the hosted version at [shortener.dev](https://shortener.dev) is less work.

## What runs where

| App | What it is | Runs on |
| --- | --- | --- |
| `apps/api` | REST API, and the short link redirects | Cloudflare Workers with Hono |
| `apps/app` | Dashboard | Static assets on Cloudflare Workers |
| `apps/web` | Website and docs (optional) | Cloudflare Workers |

The API Worker also serves the short links. Any request for a path like `/spring-sale` that isn't an API route is treated as a short link, so your short domain points at the same Worker as the API.

It uses these Cloudflare products: D1 for the database, two KV namespaces (cache and short link lookups), R2 for uploaded images, a Queue, Analytics Engine for clicks and request logs, rate limiting, and Email for verification codes. Check Cloudflare's pricing for the ones your account plan includes.

## Run it locally

You need Node.js 24 or later and a Cloudflare account.

```bash
git clone https://github.com/Agenty/shortener.git
cd shortener
npm install
```

Create `apps/api/.dev.vars` with at least:

```ini
ENVIRONMENT=development
JWT_SECRET=a-long-random-string
APP_URL=http://localhost:5173
API_URL=http://localhost:8787
DOMAIN=localhost
```

Create the local database and start everything:

```bash
cd apps/api && npm run sql:dev && cd ../..
npm run dev
```

The API runs on `http://localhost:8787`, the dashboard on `http://localhost:5173` and the website on `http://localhost:3000`. The [API README](https://github.com/Agenty/shortener/blob/main/apps/api/README.md#environment-variables) lists the optional variables for Google and GitHub sign-in, Search Console verification, analytics and Stripe.

## Deploy to Cloudflare

1. Create the resources from `apps/api`:

   ```bash
   npx wrangler login
   npx wrangler d1 create shortener
   npx wrangler kv namespace create KVCACHE
   npx wrangler kv namespace create LINKS
   npx wrangler r2 bucket create shortener
   npx wrangler queues create shortener-queue
   ```

2. Copy the D1 `database_id` and both KV `id` values into `apps/api/wrangler.json`, in the top-level config and in the `previews` block. The file in the repository points to the shortener.dev resources, so every ID has to be replaced.
3. Create the production tables with `npm run sql`.
4. Add each value from `.dev.vars` as a secret with production URLs, for example `npx wrangler secret put JWT_SECRET`.
5. Deploy the API with `npm run deploy` in `apps/api`, and the dashboard with `npm run build && npx wrangler deploy` in `apps/app`.

## Use your own short domain

1. In the Cloudflare dashboard, add two custom domains to the API Worker: one for the API, such as `api.example.com`, and your short domain, such as `go.example.com`.
2. Set `SHORT_DOMAIN` in `apps/api/services/links.service.ts` and in `apps/app/src/env.ts` to your short domain.
3. Update the API URL in `apps/app/src/env.ts`, and in `apps/web/src/lib/site.ts` if you deploy the website.
4. Deploy again.

New links are returned as `https://go.example.com/your-back-half`.

## Keep the safety checks on

The API only creates links to verified or whitelisted domains and refuses blocked ones. The check is `assertVerifiedDestinations` in `apps/api/services/domain.service.ts`. Leave it on: without it, anyone with an account on your instance can create links to phishing pages on your domain, and your short domain ends up on browser and email blocklists. See [Is srt1.link safe?](/docs/is-srt1-link-safe) for what the checks do.

## License

The AGPLv3 requires you to share your changes when you run a modified version as a public service. For a commercial license or help with a self-hosted setup, [contact us](/enterprise).
