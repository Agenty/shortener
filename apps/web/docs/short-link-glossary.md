---
title: Short link glossary
nav: Glossary
description: Plain definitions of the terms used with short links and link tracking, from back-half and branded link to deep link, UTM parameters and redirect types.
section: Guides
order: 4
updated: 2026-11-14
---

The terms you'll run into when you create, share and track short links, with how each one works in Shortener.dev.

### Back-half

The part of a short link after the domain. In `srt1.link/spring-sale`, the back-half is `spring-sale`. Also called a slug, alias or key. In Shortener.dev it's 2 to 32 characters of letters, numbers, `-` and `_`, stored in lowercase. Leave it empty to get a random 7-character one. See [Create a short link](/docs/create-short-link).

### Short domain

The domain short links are served from. Shortener.dev links use `srt1.link`.

### Branded link

A short link on a domain that carries a brand's name, such as `go.example.com/sale`, instead of a generic short domain. Shortener.dev links currently use `srt1.link`.

### Destination URL

The long URL a short link sends visitors to. Also called the target or long URL. In Shortener.dev, it must be on a [verified domain](/docs/verify-domain) or a whitelisted site.

### Redirect

Sending a visitor from one URL to another. Short links work by redirecting. See [How a URL shortener works](/docs/how-url-shorteners-work).

### 301 redirect

An HTTP response that says a URL has moved permanently. Browsers may cache it, and search engines move their signals to the new URL.

### 302 redirect

An HTTP response that says a URL has moved temporarily. Browsers don't cache it as strongly, so the destination can change.

### Meta refresh

An HTML tag that tells the browser to load another URL, optionally after a delay. Shortener.dev uses a meta refresh with a 2-second delay on a page that shows the destination's domain.

### Interstitial page

A page shown between the click and the destination. Shortener.dev's redirect page and password page are interstitials.

### Redirect chain

A redirect that leads to another redirect, such as one short link pointing to another. Chains slow pages down and hide the real destination, so Shortener.dev doesn't allow other shorteners as destinations.

### Link rot

When a link stops working because the page it points to moved or was deleted. A short link lets you fix it in one place by [changing the destination](/docs/edit-short-link).

### UTM parameters

Tags added to a URL, such as `utm_source=newsletter`, that tell Google Analytics and similar tools where a visitor came from. See [Add UTM parameters to a short link](/docs/utm-parameters).

### Click

One visit to a short link. Shortener.dev records the time, country, city, referrer, browser, operating system and device of each click. See [Track clicks with link analytics](/docs/click-analytics).

### Referrer

The site or app the visitor came from when they clicked, such as `linkedin.com`. Clicks with no referrer, for example from an email app or a typed URL, show as direct.

### Deep link

A link that opens a specific screen in a mobile app, or the app's store listing if the app isn't installed. Shortener.dev's [iOS and Android targeting](/docs/ios-android-app-links) sends phone visitors to a separate URL, which can be a store listing or a deep link.

### Geo targeting

Sending visitors to a different URL based on their country. See [Redirect visitors by country](/docs/geo-targeting).

### Link expiration

A date and time after which a short link stops working. See [Set an expiration date](/docs/link-expiration).

### Open Graph tags

The title, description and image social networks show when a link is shared. Shortener.dev lets you [set them per short link](/docs/social-media-preview).

### Dynamic QR code

A QR code that encodes a short link instead of the final URL, so you can change where it goes after printing. Every [Shortener.dev QR code](/docs/qr-codes) works this way.
