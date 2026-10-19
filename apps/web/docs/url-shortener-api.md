---
title: Shorten URLs with the API
nav: Shorten URLs with the API
description: Create, list, update and delete short links with the Shortener.dev REST API, with examples in cURL, JavaScript and Python.
section: Team and API
order: 3
---

The Shortener.dev API is a JSON REST API at `https://api.shortener.dev/v1`. Everything you can do in the link builder, you can do with one `POST` request, which makes it easy to shorten URLs from a CMS, a newsletter tool, a spreadsheet script or your own app.

You need an [API key](/docs/api-keys). The examples read it from a `SHORTENER_API_KEY` environment variable.

## Create a short link

Send the destination as `url`. Add `key` for a custom back-half, or leave it out to get a random one:

```bash
curl -X POST https://api.shortener.dev/v1/links \
  -H "Authorization: Bearer $SHORTENER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/blog/spring-launch",
    "key": "spring-launch"
  }'
```

The response is the saved link, with the URL to share in `short_url`:

```json
{
  "key": "spring-launch",
  "url": "https://example.com/blog/spring-launch",
  "short_url": "https://srt1.link/spring-launch",
  "is_enabled": true,
  "created_at": "2030-03-01T10:00:00Z"
}
```

The same request in JavaScript:

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

And in Python with `requests`:

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

## Add link options

Every option in the dashboard is a field on the same request. This one uses all of them:

```json
{
  "url": "https://example.com/shop",
  "key": "summer-shop",
  "expire_at": "2030-08-31T23:59:00Z",
  "params": {
    "utm_source": "newsletter",
    "utm_medium": "email",
    "utm_campaign": "summer_sale"
  },
  "title": "Summer sale, up to 40% off",
  "description": "Our biggest sale of the year ends August 31.",
  "image": "https://example.com/images/summer-og.png",
  "password": "sunny-days",
  "ios": "https://apps.apple.com/us/app/your-app/id000000000",
  "android": "https://play.google.com/store/apps/details?id=com.example.app",
  "geo": [{ "country": "GB", "url": "https://example.co.uk/shop" }]
}
```

| Field | Notes |
| --- | --- |
| `url` | Required. Must be on a [verified or whitelisted domain](/docs/verify-domain). |
| `key` | Custom back-half, up to 32 characters. Lowercased, with spaces turned into hyphens. |
| `expire_at` | ISO 8601 date-time at least 5 minutes ahead. See [expiration](/docs/link-expiration). |
| `params` | Query parameters added to the destination. See [UTM parameters](/docs/utm-parameters). |
| `title`, `description`, `image` | Social preview, limited to 60 and 155 characters. See [social preview](/docs/social-media-preview). |
| `password` | Up to 32 characters. See [password protection](/docs/password-protected-links). |
| `ios`, `android` | App store or deep link URLs. See [app targeting](/docs/ios-android-app-links). |
| `geo` | Array of `country` and `url` pairs. See [geo targeting](/docs/geo-targeting). |

## List, update and delete links

| Method | Endpoint | What it does |
| --- | --- | --- |
| `GET` | `/v1/links?search=spring&limit=50` | List links, newest first. `search` matches the exact back-half or part of the destination. |
| `GET` | `/v1/links/{key}` | Get one link |
| `PUT` | `/v1/links/{key}` | Update a link's destination or options |
| `DELETE` | `/v1/links/{key}` | Delete a link permanently |

## Handle errors

Errors come back with a JSON `message` that you can show to users or log:

| Status | Meaning |
| --- | --- |
| `400` | The request is invalid, for example `url: Invalid URL` or a back-half that's already taken |
| `401` | The API key is missing or invalid |
| `402` | Your plan's link limit is reached |
| `403` | The destination domain isn't verified |
| `429` | Too many requests. Wait and retry with backoff. |

The [API reference](/docs/api) lists every endpoint, including domains, analytics, reports and team members, and you can send test requests from it.
