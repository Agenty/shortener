<p align="center">
  <a href="https://shortener.dev">
    <img src=".github/assets/logo-light.svg#gh-light-mode-only" alt="shortener.dev" height="48">
    <img src=".github/assets/logo-dark.svg#gh-dark-mode-only" alt="shortener.dev" height="48">
  </a>
</p>

<p align="center">
  An open-source URL shortener with click analytics, custom back-halves, UTM tracking, geo and app targeting, built on Cloudflare Workers.
</p>

<p align="center">
  <a href="https://shortener.dev"><strong>Website</strong></a> ·
  <a href="https://app.shortener.dev"><strong>Dashboard</strong></a> ·
  <a href="https://shortener.dev/docs"><strong>Docs</strong></a> ·
  <a href="https://shortener.dev/docs/api"><strong>API reference</strong></a> ·
  <a href="https://shortener.dev/report"><strong>Report a link</strong></a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue" alt="License: AGPLv3"></a>
  <a href="https://shortener.dev"><img src="https://img.shields.io/badge/website-shortener.dev-black" alt="shortener.dev"></a>
  <a href="https://shortener.dev/docs/api"><img src="https://img.shields.io/badge/API-REST%20%2B%20OpenAPI-green" alt="REST API"></a>
</p>

<p align="center">
  <a href="https://shortener.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="apps/web/public/images/app-links-dark.webp">
      <img src="apps/web/public/images/app-links-light.webp" alt="Links page in the Shortener.dev dashboard">
    </picture>
  </a>
</p>

## About

[Shortener.dev](https://shortener.dev) turns a long URL into a short link like `srt1.link/spring-sale` and records every click: when it happened, where the visitor came from, and which country, browser and device they used.

You can use the hosted version at [shortener.dev](https://shortener.dev) or run your own copy on Cloudflare. This repository holds the full source: the API, the dashboard and the marketing site.

## Features

- **Short links** with custom back-halves or random 7-character keys
- **Click analytics** by date, country, city, referrer, browser, OS and device
- **Click reports** with the raw log of every click
- **Link expiration** after a date and time
- **UTM builder** to append `utm_source`, `utm_medium`, `utm_campaign` and other parameters
- **Social preview** with a custom title, description and image
- **Password-protected links**
- **iOS and Android targeting** to send mobile visitors to your app
- **Geo targeting** to send visitors from a country to a different URL
- **Domain verification** by email code or Google Search Console (see [Responsible link shortening](#responsible-link-shortening))
- **Teams** with roles, projects and API keys
- **REST API** with an OpenAPI spec and examples in cURL, JavaScript and Python
- **Docs for AI agents** at [`/llms.txt`](https://shortener.dev/llms.txt), and every docs page as markdown by adding `.md` to its URL

## Responsible link shortening

Short links hide their destination, which makes them a favorite tool for phishing. So Shortener.dev only shortens links to **domains you've verified** or to trusted sites on a whitelist.

- **Verify first.** Prove ownership with an email code or Google Search Console. Subdomains are included.
- **Popular sites just work.** YouTube, LinkedIn, Amazon and other trusted sites need no verification.
- **Abused destinations are blocked.** Free hosts, tunnels, other shorteners and risky TLDs like `.zip` are denied ([list](apps/api/data/blocked.ts)).
- **Anyone can [report a link](https://shortener.dev/report).**

The result: visitors can trust every link, your brand can't be misused, and the short domain stays off spam blocklists.

Self-hosting? Please keep these checks enabled (`assertVerifiedDestinations` in [`domain.service.ts`](apps/api/services/domain.service.ts)). More: [Verify a domain](https://shortener.dev/docs/verify-domain).

## API

The REST API lives at `https://api.shortener.dev/v1`. Create an [API key](https://shortener.dev/docs/api-keys) in the dashboard under **Settings > API Keys**, then send it as a bearer token.

### Create a short link

```bash
curl -X POST https://api.shortener.dev/v1/links \
  -H "Authorization: Bearer $SHORTENER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/blog/spring-launch",
    "key": "spring-launch"
  }'
```

Response:

```json
{
  "key": "spring-launch",
  "url": "https://example.com/blog/spring-launch",
  "short_url": "https://srt1.link/spring-launch",
  "is_enabled": true,
  "created_at": "2030-03-01T10:00:00Z"
}
```

### JavaScript

```js
const response = await fetch('https://api.shortener.dev/v1/links', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.SHORTENER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com/blog/spring-launch',
    key: 'spring-launch',
  }),
});

if (!response.ok) {
  const { message } = await response.json();
  throw new Error(message);
}

const link = await response.json();
console.log(link.short_url);
```

### Python

```python
import os
import requests

response = requests.post(
    "https://api.shortener.dev/v1/links",
    headers={"Authorization": f"Bearer {os.environ['SHORTENER_API_KEY']}"},
    json={"url": "https://example.com/blog/spring-launch", "key": "spring-launch"},
)
response.raise_for_status()
print(response.json()["short_url"])
```

### Link options

Every option in the dashboard is a field on the same request:

```json
{
  "url": "https://example.com/shop",
  "key": "summer-shop",
  "expire_at": "2030-08-31T23:59:00Z",
  "params": { "utm_source": "newsletter", "utm_medium": "email", "utm_campaign": "summer_sale" },
  "title": "Summer sale, up to 40% off",
  "description": "Our biggest sale of the year ends August 31.",
  "image": "https://example.com/images/summer-og.png",
  "password": "sunny-days",
  "ios": "https://apps.apple.com/us/app/your-app/id000000000",
  "android": "https://play.google.com/store/apps/details?id=com.example.app",
  "geo": [{ "country": "GB", "url": "https://example.co.uk/shop" }]
}
```

### Other endpoints

| Method   | Endpoint                           | Description                             |
| -------- | ---------------------------------- | --------------------------------------- |
| `GET`    | `/v1/links?search=spring&limit=50` | List links, newest first                |
| `GET`    | `/v1/links/{key}`                  | Get one link                            |
| `PUT`    | `/v1/links/{key}`                  | Update a link                           |
| `DELETE` | `/v1/links/{key}`                  | Delete a link                           |
| `POST`   | `/v1/domains`                      | Add a domain                            |
| `POST`   | `/v1/domains/{id}/otp`             | Email a verification code to the domain |
| `POST`   | `/v1/domains/{id}/verify`          | Verify the domain with the code         |
| `GET`    | `/v1/analytics`                    | Click analytics                         |
| `GET`    | `/v1/reports`                      | Raw click log                           |

Errors return a JSON `message`. Common status codes: `400` invalid request, `401` missing or invalid API key, `402` plan limit reached, `403` destination domain not verified, `429` rate limited.

The full spec is at [`api.shortener.dev/openapi.json`](https://api.shortener.dev/openapi.json), and the interactive [API reference](https://shortener.dev/docs/api) lets you send test requests.

## Repository structure

This is a [Turborepo](https://turborepo.dev) monorepo with npm workspaces.

| Path                                                       | Description                                                                   | Runs on                   |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------- |
| [`apps/api`](apps/api)                                     | REST API (`api.shortener.dev`): links, domains, analytics, auth, billing, emails | Cloudflare Workers + Hono |
| [`apps/app`](apps/app)                                     | Dashboard (`app.shortener.dev`): React single-page app                        | Cloudflare Workers assets |
| [`apps/web`](apps/web)                                     | Marketing site and docs (`shortener.dev`): TanStack Start with SSR            | Cloudflare Workers        |
| [`packages/eslint-config`](packages/eslint-config)         | Shared ESLint config                                                          |                           |
| [`packages/typescript-config`](packages/typescript-config) | Shared `tsconfig.json` files                                                  |                           |
| [`packages/ui`](packages/ui)                               | Shared React components                                                       |                           |

Each app has its own README with details: [API](apps/api/README.md), [Dashboard](apps/app/README.md), [Website](apps/web/README.md).

### Tech stack

- [Cloudflare Workers](https://workers.cloudflare.com/) with D1, KV, R2, Queues, Analytics Engine, Rate Limiting and Email Routing
- [Hono](https://hono.dev/) and [`@hono/zod-openapi`](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) for the API and its OpenAPI spec
- [React](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) for the dashboard
- [TanStack Start](https://tanstack.com/start) for the website
- [React Email](https://react.email/) for transactional emails
- [Stripe](https://stripe.com/) for billing
- TypeScript everywhere

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 24 or later
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (the free plan is enough for local development)

Wrangler is installed with the project dependencies.

### 1. Clone and install

```bash
git clone https://github.com/Agenty/shortener.git
cd shortener
npm install
```

### 2. Configure the API

Create `apps/api/.dev.vars`. See [Environment variables](apps/api/README.md#environment-variables) in the API README for the full list. The minimum to sign up and create links locally:

```ini
ENVIRONMENT=development
JWT_SECRET=a-long-random-string
APP_URL=http://localhost:5173
API_URL=http://localhost:8787
DOMAIN=localhost
```

### 3. Create the local database

```bash
cd apps/api
npm run sql:dev
```

This runs [`schema/query.sql`](apps/api/schema/query.sql) against a local D1 database in `.wrangler/`.

### 4. Run everything

From the repository root:

```bash
npm run dev
```

| App       | URL                   |
| --------- | --------------------- |
| API       | http://localhost:8787 |
| Dashboard | http://localhost:5173 |
| Website   | http://localhost:3000 |

To run a single app, use a filter, for example `npx turbo dev --filter=shortener-api`.

Other root scripts:

```bash
npm run build         # build every app
npm run lint          # lint every app
npm run check-types   # type-check every app
npm run format        # format with Prettier
```

## Deploying to Cloudflare

Each app deploys as its own Worker. The `wrangler.json` files in this repository point to the resources used by shortener.dev, so replace their IDs with your own.

### 1. Create the Cloudflare resources

```bash
cd apps/api
npx wrangler login
npx wrangler d1 create shortener
npx wrangler kv namespace create KVCACHE
npx wrangler kv namespace create LINKS
npx wrangler r2 bucket create shortener
npx wrangler queues create shortener-queue
```

Copy the D1 `database_id` and the two KV `id` values into [`apps/api/wrangler.json`](apps/api/wrangler.json), in both the top-level config and the `previews` block.

### 2. Create the production database

```bash
npm run sql
```

### 3. Add production secrets

Add each value from `.dev.vars` as a secret, with production URLs:

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put APP_URL
# ...repeat for the rest
```

### 4. Deploy

```bash
# API
cd apps/api && npm run deploy

# Dashboard
cd apps/app && npm run build && npx wrangler deploy

# Website
cd apps/web && npm run deploy
```

Then add a custom domain to each Worker in the Cloudflare dashboard, and update:

- the API URL in [`apps/app/src/env.ts`](apps/app/src/env.ts) and [`apps/web/src/lib/site.ts`](apps/web/src/lib/site.ts)
- the short link domain (`SHORT_DOMAIN`) in [`apps/api/services/links.service.ts`](apps/api/services/links.service.ts) and [`apps/app/src/env.ts`](apps/app/src/env.ts)

## Contributing

Issues and pull requests are welcome.

1. Fork the repository and create a branch from `development`.
2. Make your change and run `npm run lint` and `npm run check-types`.
3. Open a pull request describing what changed and why.

To report a security issue, email [support@shortener.dev](mailto:support@shortener.dev) instead of opening a public issue.

## License

Shortener.dev is built and maintained by Agenty Analytics Pvt. Ltd. as open core: the core product is fully open source under the AGPLv3(LICENSE), and a commercial license is available for organizations that need more than the AGPLv3 allows.

For a commercial license, the hosted Enterprise plan or self-hosting support, [contact us at shortener.dev/enterprise](https://shortener.dev/enterprise).

---

<p align="center">
  Built and hosted at <a href="https://shortener.dev"><strong>shortener.dev</strong></a>, the free URL shortener with click analytics.
</p>
