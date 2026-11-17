---
title: How to measure the click-through rate of a link
nav: Click-through rate
description: Click-through rate is clicks divided by the number of people who saw the link. Where to get each number for email, social posts, ads, QR codes and messages, and how to compare links fairly.
section: Guides
order: 17
updated: 2026-11-17
---

Click-through rate (CTR) is the share of people who saw a link and clicked it:

```
CTR = clicks / impressions × 100
```

A post seen 4,000 times with 60 clicks on its link has a CTR of 1.5%. The clicks are easy to count with a short link. The hard part is the other number, because "seen" means something different in every channel, and it always comes from the platform where you posted, not from the link.

## Where each number comes from

| Channel | Clicks | Impressions to divide by |
| --- | --- | --- |
| Email | Clicks on the short link in the email | Emails delivered, from your email tool |
| Social post | Clicks on the short link in the post | Post impressions or reach, from the network's insights |
| Bio or profile link | Clicks on the bio link | Profile visits, from the network's insights |
| Paid ad | Clicks on the short link in the ad | Ad impressions, from the ad manager |
| QR code | Scans of the QR link | Footfall, copies printed or event attendance, estimated |
| WhatsApp, SMS | Clicks on the link in the message | Messages delivered, from the provider |

Use one short link per placement so the click count belongs to exactly one denominator. If the same link is in the newsletter and in an Instagram post, you can't divide its clicks by either audience. See [Social media link tracking](/docs/social-media-link-tracking).

## Email: CTR and click-to-open rate

Email has two common rates:

- **Click-through rate**: clicks divided by emails delivered.
- **Click-to-open rate**: clicks divided by emails opened. It shows how well the content worked for people who opened it.

Open counts have been unreliable since Apple Mail Privacy Protection started loading images for every message, which counts many emails as opened that nobody read. Prefer CTR on delivered emails when comparing campaigns.

Email tools count clicks themselves by wrapping your links in their own redirect, so their click number and Shortener.dev's will differ slightly. Email security scanners can add clicks to both. See [Bot clicks and link previews](/docs/bot-clicks-link-previews).

## Calculate it step by step

1. Create a short link for the placement, for example `srt1.link/nov-news-button`.
2. Publish or send it, and wait until most of the activity is over. For email that's a few days, for a social post a day or two.
3. Read the clicks for that link in **Analytics**, using the time range that covers the campaign.
4. Read the impressions, reach or delivered count for the same period from the platform.
5. Divide clicks by impressions and multiply by 100.

To pull click totals for many links at once, use `GET /v1/analytics/clicks?key=nov-news-button&key=nov-news-footer` from the [API](/docs/api). It returns the last 30 days of clicks for up to 25 links in one request.

## Compare links fairly

- **Compare like with like.** An email to existing customers and a cold ad have very different rates. Compare this month's newsletter with last month's, not with an ad.
- **Use the same denominator every time.** Reach and impressions give different rates for the same post. Pick one per channel and stick to it.
- **Count over the same window.** A link checked after one day and another after a week aren't comparable.
- **Watch small numbers.** With 200 impressions, two extra clicks change the CTR by a full percentage point. Wait for enough impressions before calling a winner.
- **Count bots consistently.** Known crawlers are never counted by Shortener.dev, but scanner clicks on business email are. If you remove them for one campaign, remove them for all.

## What a good CTR is

Published benchmarks vary widely by industry, audience and how each study counts impressions, so a number from someone else's report is a weak target. Your own history is a better one. Record the CTR of every campaign in a sheet with its channel and audience, and compare each new campaign with the median of the previous ones in the same channel.

## Frequently asked questions

### Can Shortener.dev calculate CTR for me?

No. Shortener.dev counts clicks. Impressions, reach and deliveries are recorded by the platform where you share the link, so you calculate the rate with numbers from both.

### Does a QR code have a click-through rate?

Not in the usual sense, because nobody counts how many people saw a poster. Use scans per printed copy, per day, or per visitor at an event instead, and compare placements with each other. See [How to track QR code scans](/docs/track-qr-code-scans).

### Why is my CTR over 100%?

The same people clicked more than once, or the link was shared beyond the audience you divided by, such as a newsletter forwarded to others. CTR assumes every click came from the counted impressions.
