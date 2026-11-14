---
title: Change where a short link goes
nav: Change the destination
description: Point an existing short link at a new URL without changing the link itself, so printed QR codes and links you already shared keep working.
section: Short links
order: 4
updated: 2026-11-14
---

You can change the destination of a short link after you've shared it. The short URL, such as `srt1.link/spring-menu`, stays the same, so a QR code on a printed flyer or a link in last week's newsletter starts sending people to the new page.

Common reasons to do it:

- The page moved, for example from `/blog/spring-launch` to `/blog/2026/spring-launch`.
- A campaign ended and you want the link to land on your current offer instead of an empty page.
- You printed a QR code before the final URL was ready.

The dashboard doesn't have an edit button yet, so changing a link is done with the [API](/docs/url-shortener-api). You need an [API key](/docs/api-keys), which is included on paid plans.

## Send the whole link, not only the field you change

`PUT /v1/links/{key}` replaces the link's settings with what you send. If you send only `url`, any expiration, UTM parameters, password, social preview, app targeting, geo targeting or project on the link is removed. The one exception is `is_enabled`, which keeps its current value when you leave it out.

So the safe way to edit a link is to read it, change the field, and send it back.

## Change the destination

1. Get the current link:

   ```bash
   curl https://api.shortener.dev/v1/links/spring-menu \
     -H "Authorization: Bearer $SHORTENER_API_KEY"
   ```

2. Copy the JSON from the response and change `url`:

   ```json
   {
     "url": "https://example.com/menu/summer",
     "project_id": 3,
     "params": { "utm_source": "flyer", "utm_medium": "print" },
     "title": "Our summer menu",
     "geo": []
   }
   ```

3. Send it back:

   ```bash
   curl -X PUT https://api.shortener.dev/v1/links/spring-menu \
     -H "Authorization: Bearer $SHORTENER_API_KEY" \
     -H "Content-Type: application/json" \
     -d @link.json
   ```

The response is the updated link. Read-only fields like `short_url` and `created_at` can stay in the body you send, they're ignored.

Here's the same thing in JavaScript:

```js
const api = 'https://api.shortener.dev/v1/links';
const headers = {
  Authorization: `Bearer ${process.env.SHORTENER_API_KEY}`,
  'Content-Type': 'application/json',
};

async function changeDestination(key, newUrl) {
  const link = await fetch(`${api}/${key}`, { headers }).then((res) => res.json());
  const res = await fetch(`${api}/${key}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ ...link, url: newUrl }),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

await changeDestination('spring-menu', 'https://example.com/menu/summer');
```

## When the change shows up

Short links are cached for up to a minute at the edge. Some visitors can still land on the old destination for about 60 seconds after you update the link.

## Things that can block the update

- The new URL has to be on a [verified domain](/docs/verify-domain) or a whitelisted site, the same as when you create a link. Otherwise you get `Domain not verified`.
- If the link has an `expire_at` that is already in the past, the update fails with `Must be greater then current date time + 5 minutes or empty`. Set a new date at least 5 minutes ahead, or send `null` to remove the expiration. This is also how you bring an expired link back.
- The back-half can't be changed. To use a different back-half, [create a new link](/docs/create-short-link) and [disable](/docs/disable-short-link) or delete the old one.

## Frequently asked questions

### Can I change the destination of a short link after sharing it?

Yes. Update the link's `url` with `PUT /v1/links/{key}` in the Shortener.dev API. The short URL stays the same, so everyone who clicks it, or scans a QR code made from it, reaches the new page.

### Do I need to reprint a QR code when the destination changes?

No. A Shortener.dev QR code encodes the short link, not the destination, so changing where the short link goes also changes where the QR code goes.

### Do clicks reset when I change the destination?

No. Clicks are recorded against the short link, so the history in [click analytics](/docs/click-analytics) covers both the old and the new destination.
