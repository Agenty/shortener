---
title: Do short links hurt SEO?
nav: Short links and SEO
description: Where short links are fine for SEO, where to use the full URL instead, and why links on srt1.link shouldn't be counted on to pass link equity.
section: Guides
order: 2
updated: 2026-11-14
---

Short links don't hurt your site's rankings. Search engines rank the destination page, not the short link, and a short link in a tweet or an email has no effect on how Google sees your site. Where short links matter for SEO is backlinks: a link you want to count toward your page's authority should point straight at your page.

## Where short links are fine

Use short links anywhere people, not search engines, are the audience:

- Social posts, bios and comments, where most platforms mark links `nofollow` anyway
- Email newsletters and SMS
- Printed material and [QR codes](/docs/qr-codes)
- Podcasts, videos and talks, where people type the link
- Ads and affiliate posts, where you want [UTM tracking](/docs/utm-parameters) and [click counts](/docs/click-analytics)

In all of these, the short link gives you click data and the option to [change the destination](/docs/edit-short-link) later, with no SEO cost.

## Where to use the full URL

Link to your page directly when the link is meant to build search authority or help crawling:

- Guest posts, press mentions and partner pages that link to you
- Links between pages on your own website
- `rel="canonical"` tags, hreflang tags and XML sitemaps, which must always use the real URL

Shortener.dev links go through a [redirect page](/docs/how-url-shorteners-work#the-redirect-page) that forwards visitors after 2 seconds with a meta refresh. Google treats a delayed meta refresh as a temporary redirect, and the page is marked `noindex`. Don't count on a `srt1.link` link to pass link equity to the destination. Shorteners that use a `301` redirect pass signals more reliably, but a direct link is always the safer choice for a backlink.

## Avoid redirect chains

Point each short link at the final URL, not at another short link or a URL that redirects again. Every extra hop slows the page down and gives crawlers and browsers another chance to give up. Shortener.dev blocks other shorteners such as `bit.ly` and `tinyurl.com` as destinations for this reason.

If your page moves, [update the short link](/docs/edit-short-link) to the new URL instead of leaving it on the old one and relying on your site's redirect.

## Frequently asked questions

### Do short links hurt SEO?

No. Short links shared on social media, in email or in print don't affect your rankings. For backlinks you want search engines to count, link to the page directly.

### Do short links pass link juice?

It depends on the redirect. A `301` usually passes signals to the destination. Shortener.dev uses a delayed redirect page marked noindex, so its links shouldn't be relied on to pass link equity.

### Will Google index my short links?

No. Shortener.dev's redirect page has a `noindex` tag, so `srt1.link` URLs don't appear in search results in place of your pages.
