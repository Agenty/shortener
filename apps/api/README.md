<p align="center">
  <a href="https://shortener.dev">
    <img src="../../.github/assets/logo.svg" alt="shortener.dev" width="480">
  </a>
</p>

# shortener-api

The REST API behind [Shortener.dev](https://shortener.dev), served at `https://api.shortener.dev`. It runs on Cloudflare Workers with [Hono](https://hono.dev/), and generates its OpenAPI spec from the route definitions with [`@hono/zod-openapi`](https://github.com/honojs/middleware/tree/main/packages/zod-openapi).

- API reference: [shortener.dev/docs/api](https://shortener.dev/docs/api)
- OpenAPI spec: [api.shortener.dev/openapi.json](https://api.shortener.dev/openapi.json)
- Guide: [Shorten URLs with the API](https://shortener.dev/docs/url-shortener-api)

## Example

```bash
curl -X POST https://api.shortener.dev/v1/links \
  -H "Authorization: Bearer $SHORTENER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "url": "https://example.com/blog/spring-launch", "key": "spring-launch" }'
```

```json
{
  "key": "spring-launch",
  "url": "https://example.com/blog/spring-launch",
  "short_url": "https://srt1.link/spring-launch",
  "is_enabled": true,
  "created_at": "2030-03-01T10:00:00Z"
}
```

Locally, replace `https://api.shortener.dev` with `http://localhost:8787`.

## Scripts

```bash
npm run dev           # wrangler dev on http://localhost:8787
npm run build         # dry-run deploy into dist/
npm run deploy        # deploy to Cloudflare
npm run check-types   # tsc --noEmit
npm run sql:dev       # apply schema/query.sql to the local D1 database
npm run sql           # apply schema/query.sql to the remote D1 database
npm run cf-typegen    # regenerate worker-configuration.d.ts from wrangler.json
```

## Layout

| Path           | Contents                                                                          |
| -------------- | --------------------------------------------------------------------------------- |
| `index.ts`     | App entry: CORS, rate limiting, auth, route mounting, `/openapi.json`, queue handler |
| `controllers/` | One Hono router per resource, mounted under `/v1`                                  |
| `services/`    | Business logic and D1, KV, R2 and Analytics Engine access                          |
| `models/`      | Zod schemas, used for validation and the OpenAPI spec                              |
| `middleware/`  | JWT and API key auth, rate limiting, request logging                               |
| `emails/`      | React Email templates (OTP, welcome, domain verification, password reset)          |
| `data/`        | Built-in whitelisted and blocked domains                                           |
| `schema/`      | D1 schema (`query.sql`)                                                            |

## Routes

| Prefix             | Auth     | Purpose                                         |
| ------------------ | -------- | ----------------------------------------------- |
| `/v1/public`       | None     | Link metadata for the website's preview tool    |
| `/v1/auth`         | None     | Sign up, sign in, password reset                |
| `/v1/oauth`        | None     | Google and GitHub sign-in, Search Console       |
| `/v1/links`        | Required | Create, list, update and delete short links     |
| `/v1/domains`      | Required | Add and verify destination domains              |
| `/v1/analytics`    | Required | Click totals by country, referrer, device, etc. |
| `/v1/reports`      | Required | Raw click log                                   |
| `/v1/projects`     | Required | Group links into projects                       |
| `/v1/users`        | Required | Team members                                    |
| `/v1/apikeys`      | Required | API keys                                        |
| `/v1/subscription` | Required | Stripe billing                                  |
| `/healthcheck`     | None     | Health check                                    |

## Domain verification

The API only creates short links to destinations on a domain that the account has verified, or that is on the global whitelist. Blocked domains and TLDs are denied even when verified. This keeps the service from being used for phishing, malware and scams, keeps the short domain off blocklists, and protects domain owners from having their brand misused.

- Check: `assertVerifiedDestinations` in [`services/domain.service.ts`](services/domain.service.ts)
- Whitelist: [`data/whitelisted.ts`](data/whitelisted.ts) plus domains whitelisted by admins in D1
- Blocklist: [`data/blocked.ts`](data/blocked.ts) plus domains blocked by admins in D1
- Verification: email OTP to an address on the domain, or Google Search Console ownership

If you self-host, please keep this check in place. See [Safety](../../README.md#safety).

## Cloudflare bindings

Defined in [`wrangler.json`](wrangler.json). Replace the IDs with your own resources when you deploy.

| Binding                            | Type             | Used for                                  |
| ---------------------------------- | ---------------- | ----------------------------------------- |
| `DB`                               | D1               | Accounts, users, links, domains, API keys |
| `KVCACHE`                          | KV               | Cache and OTP codes                       |
| `LINKS`                            | KV               | Short link lookups                        |
| `BUCKET`                           | R2               | Uploaded files such as preview images     |
| `API_LOGS`, `SHORTENER_ANALYTICS`  | Analytics Engine | Request logs and click analytics          |
| `QUEUE`                            | Queue            | Background jobs                           |
| `PUBLIC_RATE_LIMITER`, `PRO_RATE_LIMITER` | Rate limiting | 5 and 150 requests per minute          |
| `EMAIL`                            | Send Email       | OTP and transactional emails              |

## Environment variables

Put these in `.dev.vars` for local development (git-ignored), and add them with `npx wrangler secret put <NAME>` in production.

| Name                                         | Required | Description                                                     |
| -------------------------------------------- | -------- | --------------------------------------------------------------- |
| `ENVIRONMENT`                                | Yes      | `development` or `production`. Production hides error stacks.   |
| `JWT_SECRET`                                 | Yes      | Secret for signing session tokens and API keys                  |
| `APP_URL`                                    | Yes      | Dashboard URL, e.g. `http://localhost:5173`                     |
| `API_URL`                                    | Yes      | This API's URL, e.g. `http://localhost:8787`                    |
| `DOMAIN`                                     | Yes      | Root domain for cookies, OAuth redirects and file URLs, e.g. `localhost` |
| `CF_ACCOUNT_ID`, `CF_API_KEY`                | For analytics | Query Analytics Engine through the Cloudflare SQL API      |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`   | Optional | Google sign-in and Search Console domain verification           |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`   | Optional | GitHub sign-in                                                  |
| `RECAPTCHA_KEY`                              | Optional | reCAPTCHA secret, checked on sign-up in production              |
| `STRIPE_SECRET_KEY`                          | Optional | Stripe billing                                                  |
| `STRIPE_WEBHOOK_SECRET`                      | With Stripe | Signing secret (`whsec_...`) of the Stripe webhook endpoint  |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`   | Optional | PayPal billing, from a PayPal REST app                          |
| `PAYPAL_WEBHOOK_ID`                          | With PayPal | ID of the app's webhook, used to verify webhook signatures   |
| `PAYPAL_API_URL`                             | Optional | `https://api-m.sandbox.paypal.com` for sandbox, live by default |
| `AGENTY_KEY`                                 | Optional | Invoice generation through the Agenty API                      |

## Run locally

From the repository root, after `npm install`:

```bash
cd apps/api
npm run sql:dev
npm run dev
```

## License

[AGPLv3](../../LICENSE). Built for [shortener.dev](https://shortener.dev).
