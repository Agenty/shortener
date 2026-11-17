---
title: Change where a short link goes
nav: Edit a link
description: Edit an existing short link in the dashboard to point it at a new URL or change its options, without changing the link itself, so printed QR codes and links you already shared keep working.
section: Short links
order: 4
updated: 2026-11-17
---

You can change the destination of a short link after you've shared it. The short URL, such as `srt1.link/spring-menu`, stays the same, so a QR code on a printed flyer or a link in last week's newsletter starts sending people to the new page.

Common reasons to do it:

- The page moved, for example from `/blog/spring-launch` to `/blog/2026/spring-launch`.
- A campaign ended and you want the link to land on your current offer instead of an empty page.
- You printed a QR code before the final URL was ready.
- A UTM value was wrong and your analytics files the visits in the wrong channel.

Editing works on every plan, including Free.

## Edit a link in the dashboard

1. Open **Links** in the sidebar.
2. Click the **...** menu on the link's row, or on its card in grid view, and choose **Edit**.
3. The **Edit Short Link** dialog opens with the link's current settings. Change **Original URL**, or any option below it.
4. Click **Save Changes**.

![Edit option in the actions menu of a short link](/docs/images/link-actions-menu.webp)

![Edit Short Link dialog with the current destination and options](/docs/images/edit-link-dialog.webp)

Every option can be changed the same way: [expiration](/docs/link-expiration), [UTM parameters](/docs/utm-parameters), [social preview](/docs/social-media-preview), [password](/docs/password-protected-links), [iOS and Android targeting](/docs/ios-android-app-links), [geo targeting](/docs/geo-targeting) and the [project](/docs/projects). To remove an option, clear its fields before saving. Whether the link is enabled or [disabled](/docs/disable-short-link) doesn't change when you edit it.

The back-half is shown but can't be edited. To use a different back-half, [create a new link](/docs/create-short-link) and [disable](/docs/disable-short-link) or delete the old one.

## When the change shows up

New clicks use the new settings within a few seconds. In rare cases, a Cloudflare location that served the link just before your change keeps the old version for up to a minute.

Clicks are recorded against the back-half, so the link's history in [click analytics](/docs/click-analytics) covers both the old and the new destination.

## Things that can block the update

- The new URL has to be on a [verified domain](/docs/verify-domain) or a whitelisted site, the same as when you create a link. If it isn't, the dashboard offers to verify the domain.
- A link that was [blocked](/docs/manage-links#blocked-links) for an unsafe destination can't be edited, in the dashboard or with the API. **Edit** is greyed out in its menu, and the API returns `403` with `This link is blocked and can't be edited`.
- If the link's expiration date is already in the past, saving fails with `Must be greater then current date time + 5 minutes or empty`. Set a new date at least 5 minutes ahead, or clear the expiration. This is also how you bring an expired link back.

## Change a link with the API

On paid plans, you can update links from your own code with `PUT /v1/links/{key}`. You need an [API key](/docs/api-keys).

The update replaces the link's settings with what you send. If you send only `url`, any expiration, UTM parameters, password, social preview, app targeting, geo targeting or project on the link is removed. The one exception is `is_enabled`, which keeps its current value when you leave it out. So read the link first, change the field, and send it all back:

```bash
curl https://api.shortener.dev/v1/links/spring-menu \
  -H "Authorization: Bearer $SHORTENER_API_KEY" > link.json

# edit "url" in link.json, then:
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

To update many links at once, such as after a website move, see [Website migration](/docs/website-migration-short-links).

## Frequently asked questions

### Can I change the destination of a short link after sharing it?

Yes. Open the link's **...** menu on the **Links** page, choose **Edit**, change **Original URL** and click **Save Changes**. The short URL stays the same, so everyone who clicks it, or scans a QR code made from it, reaches the new page.

### Can I change the back-half of a short link?

No. The back-half identifies the link everywhere it was shared, so it can't be renamed. Create a new link with the back-half you want instead.

### Do I need to reprint a QR code when the destination changes?

No. A Shortener.dev QR code encodes the short link, not the destination, so changing where the short link goes also changes where the QR code goes.

### Do clicks reset when I change the destination?

No. Clicks are recorded against the short link, so the history in [click analytics](/docs/click-analytics) covers both the old and the new destination.
