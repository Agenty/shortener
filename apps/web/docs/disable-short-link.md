---
title: Turn a short link off without deleting it
nav: Disable a link
description: Disable a short link to stop it redirecting while keeping its back-half, settings and click history, then turn it back on later.
section: Short links
order: 5
updated: 2026-11-14
---

Disabling a short link stops it from redirecting but keeps everything else: the back-half, the destination, the options and the click history. Turn it back on and it works exactly as before. Deleting is permanent, so disable a link when you might need it again, for example a seasonal promotion you run every year or a link pointing at a page that's down for maintenance.

The **Status** column on the **Links** page shows **Enabled** or **Disabled** for each link. Switching a link on or off is done with the [API](/docs/url-shortener-api) for now, using an [API key](/docs/api-keys).

## Disable a link

Send `is_enabled: false` with the link's current settings:

```bash
curl https://api.shortener.dev/v1/links/black-friday \
  -H "Authorization: Bearer $SHORTENER_API_KEY" > link.json

# set "is_enabled": false in link.json, then:
curl -X PUT https://api.shortener.dev/v1/links/black-friday \
  -H "Authorization: Bearer $SHORTENER_API_KEY" \
  -H "Content-Type: application/json" \
  -d @link.json
```

Send the whole link, not only `is_enabled`. An update replaces the link's settings, so fields you leave out, such as UTM parameters or a password, are removed. See [Change where a short link goes](/docs/edit-short-link) for the details.

To turn the link back on, send the same request with `is_enabled: true`.

## What visitors see

A disabled link returns a page that says "This link is not available" with HTTP status `404`. It's the same page a deleted link shows, so visitors can't tell the difference.

For comparison, a link past its [expiration date](/docs/link-expiration) shows "This link has expired" with status `410`.

The change reaches every visitor within about a minute, because short links are cached briefly at the edge.

## Disable, expire or delete

| You want to | Use |
| --- | --- |
| Stop a link now and maybe bring it back later | Disable |
| Stop a link automatically at a set date and time | [Expiration](/docs/link-expiration) |
| Remove a link for good and free up the back-half | [Delete](/docs/manage-links#delete-a-short-link) |

A disabled link still counts toward your plan's link limit, and its back-half stays reserved for you.
