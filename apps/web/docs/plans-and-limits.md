---
title: Plans, limits and how long links last
nav: Plans and limits
description: How many links, domains, team members and days of analytics each Shortener.dev plan includes, how link limits are counted, and whether short links expire.
section: Help
order: 3
updated: 2026-11-14
---

Short links on every plan, including Free, work until you delete, disable or set an expiration on them. Plans differ in how many links you can create, how many of your own domains you can verify, how far back analytics go, and whether you get the API and team features.

| | Free | Starter | Pro | Business |
| --- | --- | --- | --- | --- |
| Price | $0 | $9 a month | $19 a month | $49 a month |
| Links | 50 in total | 500 a month | 2,000 a month | 15,000 a month |
| Verified domains | 1 | 2 | 10 | 25 |
| Click analytics history | 7 days | 30 days | 60 days | 90 days |
| Team members, including you | 1 | 2 | 5 | 10 |
| Projects | | 3 | 5 | 10 |
| API access | | Yes | Yes | Yes |

All [link options](/docs) are on every plan, including Free: custom back-halves, UTM parameters, expiration, password protection, social preview, iOS and Android targeting and geo targeting.

Current prices are on the [pricing page](/pricing). Enterprise plans with more links, longer analytics history and custom terms are on the [Enterprise page](/enterprise).

## How the link limit is counted

On Free, every link in your account counts, and the limit is 50. Deleting a link frees a slot.

On paid plans, the limit counts links created in the last month. A link you created five weeks ago no longer counts, even though it still works.

When you reach the limit, creating a link fails with a message like `The Free plan is limited to 50 links only, please upgrade` (status `402` in the API). Links you already have keep working.

## Domains

The domain limit counts domains you add to verify your own sites. Whitelisted sites like YouTube and Amazon don't count. Removed domains still count toward the limit, so don't add and remove domains to try things out. See [Verify a domain](/docs/verify-domain).

## Lifetime deal

The Pro plan is also sold for a one-time payment of $99, for a limited number of customers. See [Lifetime deal](/lifetime-deal).

## Frequently asked questions

### Do Shortener.dev short links expire?

No. A short link works until you delete it, disable it, or set an [expiration date](/docs/link-expiration) on it. This is the same on the Free plan.

### Is Shortener.dev free?

Yes. The Free plan includes 50 short links, one verified domain, 7 days of click analytics and every link option. Paid plans start at $9 a month.

### What happens when I reach my link limit?

You can't create new links until you upgrade, delete links on the Free plan, or wait for older links to drop out of the monthly count on a paid plan. Links you already created keep working.

### Can I use the API on the Free plan?

No. API keys are available on Starter, Pro and Business.
