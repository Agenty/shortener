---
title: Shortener.dev documentation
nav: Introduction
description: How to create short links, add UTM tracking, expiration, passwords and geo targeting, verify your domains and read click analytics in Shortener.dev.
section: Get started
order: 1
---

Shortener.dev turns a long URL into a short link like `shortener.dev/spring-sale` and records every click: when it happened, where the visitor came from, and which country, browser and device they used. These docs follow the dashboard at [app.shortener.dev](https://app.shortener.dev) screen by screen, and the [API reference](/docs/api) covers the same features in code.

## Create your first short link

1. Open **Links** in the dashboard sidebar and click **Create Link**.
2. Paste the page you want to share into **Original URL**, for example `https://example.com/blog/spring-launch`.
3. Type a back-half into **Short Link**, such as `spring-launch`, or leave it empty to get a random 7-character one.
4. Click **Create Short Link**.

The new link shows up at the top of your links list. Click the copy icon next to it and share it anywhere.

![The Links page in the Shortener.dev dashboard](/docs/images/links-list.png)

If the link is rejected with `Domain not verified`, the destination's domain needs to be verified first. Popular sites like YouTube, LinkedIn and Amazon are whitelisted and work right away. For your own website, see [Verify a domain](/docs/verify-domain).

## What you can add to a link

Every option sits in the **Options** list of the link builder and is available on every plan:

| Option | What it does |
| --- | --- |
| [Expiration](/docs/link-expiration) | Stops the link working after a date and time |
| [UTM Builder](/docs/utm-parameters) | Appends `utm_source`, `utm_medium`, `utm_campaign` and other tracking parameters |
| [Social Preview](/docs/social-media-preview) | Sets the title, description and image shown when the link is shared |
| [Password Protection](/docs/password-protected-links) | Asks visitors for a password before they reach the page |
| [iOS and Android Targeting](/docs/ios-android-app-links) | Sends iPhone and Android visitors to your app store listing |
| [Geo Targeting](/docs/geo-targeting) | Sends visitors from a country to a different URL |

## Where to go next

- [Create a short link](/docs/create-short-link) explains custom back-halves and the social media preview panel.
- [Click analytics](/docs/click-analytics) shows how to measure one link or a whole campaign.
- [Shorten URLs with the API](/docs/url-shortener-api) creates links from your own code with an API key.
- `https://shortener.dev/llms.txt` lists these pages for AI assistants and agents. Add `.md` to any docs URL to get the page as plain markdown.
