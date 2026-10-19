---
name: shortener-dev
description: Create and manage short links with the Shortener.dev URL shortener API, including custom back-halves, UTM parameters, expiration dates, passwords, iOS and Android app targeting, geo targeting, domain verification and click analytics. Use when a user asks to shorten a URL, create a tracked or branded short link, or read click statistics for srt1.link short links.
---

# Shortener.dev URL shortener

Shortener.dev turns long URLs into short links like `https://srt1.link/spring-sale` and records the clicks on them.

- API base URL: `https://api.shortener.dev/v1`
- OpenAPI spec: `https://api.shortener.dev/openapi.json`
- Human docs: `https://shortener.dev/docs` (append `.md` to any page URL for markdown)

## Authentication

Every request needs an API key in the `Authorization` header:

```
Authorization: Bearer <API key>
```

Ask the user for their key, or read it from an environment variable such as `SHORTENER_API_KEY`. Users create keys in the dashboard at https://app.shortener.dev/settings/api-keys. The key is shown only once. Never print it back, put it in a URL, or commit it to a repository.

## Create a short link

```
POST /v1/links
Content-Type: application/json

{"url": "https://example.com/blog/spring-launch", "key": "spring-launch"}
```

The response contains `short_url`. Give that URL to the user.

Only `url` is required. Optional fields:

| Field | Type | Rules |
| --- | --- | --- |
| `key` | string | Custom back-half, max 32 characters. Lowercased, spaces become hyphens, other symbols are removed. Random 7 characters when omitted. Unique across all accounts. |
| `expire_at` | ISO 8601 date-time | At least 5 minutes in the future |
| `params` | object of strings | Appended to the destination, e.g. `{"utm_source": "newsletter", "utm_medium": "email", "utm_campaign": "spring"}` |
| `title` | string | Social preview title, max 60 characters |
| `description` | string | Social preview description, max 155 characters |
| `image` | URL | Social preview image, must end with .jpg, .jpeg, .png, .gif, .bmp or .webp |
| `password` | string | Max 32 characters |
| `ios` | URL | Destination for iPhone and iPad visitors |
| `android` | URL | Destination for Android visitors |
| `geo` | array | `[{"country": "GB", "url": "https://example.co.uk"}]`, ISO 3166-1 alpha-2 codes (`GB`, not `UK`), max 195 |

## Other link endpoints

- `GET /v1/links?search=&offset=0&limit=25` lists links, newest first. `search` matches the exact back-half or part of the destination URL.
- `GET /v1/links/{key}` gets one link.
- `PUT /v1/links/{key}` updates a link.
- `DELETE /v1/links/{key}` deletes a link permanently. Confirm with the user before deleting.

## Destination domains

Every destination (`url`, `ios`, `android` and each `geo` URL) must be on a domain that is verified in the user's account or on the global whitelist. Subdomains are covered. Popular sites (social networks, YouTube, app stores, Amazon and similar) are whitelisted; check with `GET /v1/domains/whitelisted`.

If creation fails with `403` and `Domain not verified: example.com`, the user must verify the domain:

1. `POST /v1/domains` with `{"domain": "example.com"}` returns a `domain_id`.
2. `POST /v1/domains/{id}/otp` with `{"email": "admin@example.com"}` sends a 6-digit code, valid for 10 minutes. The email must end with `@` and the domain. Public and disposable email providers are rejected.
3. Ask the user for the code, then `POST /v1/domains/{id}/verify` with `{"code": 123456}`.

Users can also verify with Google Search Console from the dashboard at https://app.shortener.dev/domains.

## Click analytics

All analytics endpoints accept `interval` (days, default 7) and `url` (a short link or its back-half) to filter to one link:

- `GET /v1/analytics` clicks per day
- `GET /v1/analytics/top` top short links
- `GET /v1/analytics/referer`, `/country`, `/city`, `/browser`, `/os`, `/device` breakdowns
- `GET /v1/reports?offset=0&limit=100` raw click log

The history is limited by plan: 7 days on Free, 30 on Pro, 60 on Business, 90 on Advanced. A longer `interval` returns `402`.

## Errors

Errors are JSON with a `message` field. Show the message to the user.

- `400` invalid input, or the back-half is already used. Suggest another `key` or omit it.
- `401` missing or invalid API key
- `402` plan limit reached (links or analytics history). Point the user to https://shortener.dev/pricing.
- `403` destination domain not verified, see above
- `429` rate limited. Wait before retrying.
