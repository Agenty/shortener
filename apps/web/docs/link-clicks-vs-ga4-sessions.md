---
title: Link clicks vs GA4 sessions, and why the numbers never match
nav: Link clicks vs GA4 sessions
description: A short link counts the click at the redirect. Google Analytics counts a session when its tag runs on your page. What happens in between, and how big a gap is normal.
section: Guides
order: 13
updated: 2026-11-17
---

Your short link shows 500 clicks and Google Analytics shows 380 sessions from the same campaign. Neither number is wrong. They're counted at different points, by different software, with different rules.

Shortener.dev counts a click when the request reaches the short link, before the visitor has seen your page. Google Analytics 4 counts a session when its tag runs in the visitor's browser on your page, which only happens if the page loads, the tag is allowed to run, and the visit isn't merged into an earlier session.

## Where clicks drop out before GA4 sees them

**The visitor leaves before the page loads.** After the click, Shortener.dev shows a redirect page for 2 seconds that names the destination, then opens it. A slow destination page adds more time. Some people tap back or close the in-app browser before your page and its analytics tag have loaded. See [How a URL shortener works](/docs/how-url-shorteners-work).

**Consent banners.** In regions where you ask for cookie consent, a visitor who declines, or ignores the banner, isn't recorded as a normal session. With Consent Mode, GA4 may model some of these visits, but they don't show as ordinary sessions with a source.

**Ad and tracker blockers.** Browser extensions and privacy-focused browsers block the GA4 script on a share of visits. The short link redirect still happens, so the click is counted.

**Scanners and automated visits.** Email security scanners that open links with a browser-like user agent are counted as clicks, and they rarely run your page's JavaScript. See [Bot clicks and link previews](/docs/bot-clicks-link-previews).

**The tag isn't on the page.** If the short link points to a page without the GA4 tag, such as a PDF, an app store listing, a Google Form or another site, GA4 never sees the visit.

## Where GA4 can show more than the link

**Visits that didn't come through the link.** GA4 attributes a session to a source using the UTM parameters on the landing page URL. Someone who copies the full tagged URL from their address bar and shares it creates more sessions with your campaign's values, with no click on your short link.

**Sessions that restart.** A GA4 session ends after 30 minutes of inactivity. A visitor who opens your page, leaves the tab, and comes back an hour later counts as two sessions, after one click.

## Where the link can show more than GA4

**Repeat clicks in one session.** A visitor who taps the link twice in a few minutes makes two clicks and one session.

**Destination changes.** If a link has [geo targeting](/docs/geo-targeting) or [app targeting](/docs/ios-android-app-links), some visitors go to a page or app without your GA4 tag. Clicks are counted for all of them.

## How big a gap is normal

There's no fixed number, because it depends on your audience, your consent setup and the destination page. Instead of looking for a "right" gap, track your own:

1. Use the same [UTM parameters](/docs/utm-parameters) on every short link in a campaign so GA4 groups the sessions together.
2. Compare clicks in Shortener.dev with sessions for that `utm_campaign` in GA4, over the same dates.
3. Write down the ratio for a few campaigns sent to the same audience.

A consistent ratio means both tools are working. A sudden change points to a real problem, such as a broken tag on the landing page, a new consent banner, or a destination that loads slowly.

## Which number to report

Use clicks to compare placements and channels: which QR code, which post, which email button got the most interest. Every placement is counted the same way, at the redirect, so the comparison is fair.

Use GA4 sessions, engagement and conversions to judge what happened on your site. Clicks can't tell you whether someone read the page or bought something.

## Time zones

Shortener.dev stores click times in UTC. GA4 reports in the time zone set on your property. When you compare a single day, the two tools may be counting different 24-hour windows, so compare a full week or month instead.

## Frequently asked questions

### Why does Google Analytics show fewer visits than my link clicks?

Because some visitors leave before your page loads, some block the GA4 script or decline cookies, and some clicks come from email scanners that don't run JavaScript. The short link counts all of these, GA4 counts none of them.

### Why does my campaign traffic show as Direct in GA4?

The short link didn't add UTM parameters to the destination. Without them, and without a referrer from the app, GA4 files the visit as Direct. See [Why social media clicks show as Direct](/docs/social-traffic-direct).

### Does Shortener.dev count unique visitors?

No. It counts every click that reaches a short link, except requests from known bots. To estimate people rather than clicks, see [Can you see who clicked your link?](/docs/who-clicked-my-link)
