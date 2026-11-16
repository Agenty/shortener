---
title: Is srt1.link safe? How Shortener.dev prevents abuse
nav: Is srt1.link safe?
description: srt1.link is the short link domain of Shortener.dev. Here is how links are checked before they're created, what visitors see before the destination loads, and how to report a bad link.
section: Help
order: 2
updated: 2026-11-14
---

`srt1.link` is the domain Shortener.dev uses for short links. If you received a link like `srt1.link/spring-sale`, it was created by a Shortener.dev user and leads to a page on a domain that user verified, or to a well-known site such as YouTube or Amazon.

Short links hide where they go, which makes them popular with phishing and spam. Shortener.dev is built so that a `srt1.link` link is hard to abuse.

## Checks before a link is created

- The destination domain must be verified. A user proves they own a domain with an email code sent to an address on that domain, or through Google Search Console, before they can create links to it. Someone can't create a `srt1.link` link to your bank's website unless they control your bank's domain.
- Popular sites are whitelisted. Links to sites like YouTube, LinkedIn, Amazon, Google Drive and the app stores work without verification, because anyone can post content there.
- Risky destinations are blocked. Other link shorteners, free hosting and tunnel services, and top-level domains often used for phishing, such as `.zip`, are refused even if verified. The [list is public](https://github.com/Agenty/shortener/blob/main/apps/api/data/blocked.ts).
- Signups are protected. Disposable email addresses are rejected, and signups and password resets are checked with Cloudflare Turnstile and limited per IP address.
- The API is rate limited to stop links being created in bulk for spam.

## What you see when you click

A `srt1.link` link doesn't jump straight to the destination. It shows a page with the destination's domain for 2 seconds first, so you can close the tab if it isn't what you expected.

![Shortener.dev redirect page showing the destination domain](/docs/images/redirect-page.webp)

See [How to check where a short link goes](/docs/check-short-link-destination) for ways to see the full URL without opening it.

## Report a link

If a `srt1.link` link leads somewhere harmful, such as a fake login page, malware or a scam, [report it](/report). You only need the short link and a sentence about what's wrong. Links and accounts that break the rules are suspended, and their links stop redirecting.

## Frequently asked questions

### What is srt1.link?

srt1.link is the short link domain of Shortener.dev, an open-source URL shortener. Links on it look like `srt1.link/spring-sale` and redirect to a page chosen by the person who created the link.

### Is srt1.link a virus or a scam?

No. srt1.link is a link shortener domain, not a website that installs anything. Each link leads to a destination on a domain the creator verified or on a whitelisted site. If a specific link looks suspicious, check its destination before you sign in or download anything, and report it at shortener.dev/report.

### Who created this srt1.link link?

A Shortener.dev user. Shortener.dev doesn't show account details to visitors, but the redirect page shows the destination domain, and every destination domain is verified by its owner or whitelisted.

### How do I report a srt1.link link?

Use the form at shortener.dev/report with the short link and a short description of the problem.
