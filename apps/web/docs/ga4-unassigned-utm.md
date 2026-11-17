---
title: GA4 Unassigned traffic from UTM links, causes and fixes
nav: GA4 Unassigned traffic
description: GA4 files a visit as Unassigned when its UTM source and medium match none of its channel rules. Which values cause it, how to fix your short links, and how to regroup the data you already have.
section: Guides
order: 14
updated: 2026-11-17
---

GA4 puts every session into a channel, such as Email, Organic Social or Paid Search, by checking its source, medium and campaign against a fixed set of rules. When a session has UTM values that match none of the rules, it goes to **Unassigned**. The visit was tracked, and the values are still in your reports. GA4 just couldn't decide which channel they belong to.

Most Unassigned traffic from campaign links comes from a `utm_medium` value GA4 doesn't recognize.

## Values that end up in Unassigned

These are common on short links and QR codes, and none of them match a default channel:

| UTM values | Why it's Unassigned | Use instead |
| --- | --- | --- |
| `utm_medium=qr` | No channel for QR codes | Keep it and add a custom channel, see below |
| `utm_medium=print` or `flyer` | No channel for print | Same as QR |
| `utm_medium=newsletter` | The Email channel needs `email` as source or medium | `utm_medium=email` |
| `utm_medium=influencer` or `creator` | Not a social or affiliate value | `utm_medium=social`, or `affiliate` for paid partners |
| `utm_medium=bio` or `story` | Not a social value | `utm_medium=social` and put the placement in `utm_content` |
| `utm_source=newsletter` with no `utm_medium` | Nothing matches the source alone | Add `utm_medium=email` |
| `utm_medium=whatsapp` | Not a social or SMS value | `utm_medium=social` with `utm_source=whatsapp` |

## The rules your values have to match

GA4's default channel group compares values without regard to case. The rules that matter for links you share:

| Channel | Matches when |
| --- | --- |
| Email | source or medium is `email`, `e-mail`, `e_mail` or `e mail` |
| Organic Social | source is a known social site, or medium is `social`, `social-network`, `social-media`, `sm`, `social network` or `social media` |
| Paid Social | source is a known social site and medium matches paid patterns such as `cpc`, `ppc` or anything starting with `paid` |
| SMS | source or medium is `sms` |
| Referral | medium is `referral`, `app` or `link` |
| Affiliates | medium is `affiliate` |
| Display | medium is `display`, `banner`, `expandable`, `interstitial` or `cpm` |
| Audio | medium is `audio` |
| Mobile Push Notifications | medium ends with `push`, or contains `mobile` or `notification` |

Google's [default channel group](https://support.google.com/analytics/answer/9756891) help page has the full list, including the lists of social, search, video and shopping sites. Check it when a value is borderline.

## Find the values causing it

1. In GA4, open **Reports**, then **Acquisition**, then **Traffic acquisition**.
2. Click **Unassigned** in the table, or add a filter for **Session default channel group** equal to `Unassigned`.
3. Change the primary dimension to **Session source / medium**.

The list shows exactly which combinations GA4 couldn't place. Match them to your short links by the campaign or content value.

## Fix the links

With Shortener.dev, the UTM parameters live on the short link and are added to the destination on every click. That means the fix applies to links you've already shared and QR codes you've already printed, as long as you change the short link and not the printed URL.

- For new links, set the values in the **UTM Builder** when you create the link. See [Add UTM parameters to a short link](/docs/utm-parameters).
- For existing links, choose **Edit** in the link's **...** menu, correct the values in the **UTM Builder** and click **Save Changes**. See [Change where a short link goes](/docs/edit-short-link).

Clicks recorded before the change keep their old values in GA4. The change only affects sessions from that point on.

## Keep QR and print traffic in its own channel

There's no default channel for QR codes or print, and forcing them into Referral or Display muddles those channels. Create a custom channel group instead:

1. In GA4, open **Admin**, then **Data display**, then **Channel groups**.
2. Click **Create new channel group**. GA4 copies the default rules, which you can keep.
3. Add a channel called `QR and print` with the condition **Medium** matches regex `^(qr|print|flyer)$`.
4. Move it above the other channels so it's checked first, then save.

Custom channel groups apply to historical data, so last month's Unassigned QR visits move into the new channel. Pick the custom group in the **Traffic acquisition** report to use it. Standard GA4 properties allow two custom channel groups.

## Stop it happening again

Agree on a short list of allowed values for `utm_source` and `utm_medium` and use only those. A written list is easier to follow than rules people remember. See [UTM naming convention](/docs/utm-naming-convention) for a template you can copy.

## Frequently asked questions

### Is Unassigned traffic lost?

No. The sessions, users and conversions are recorded with their source, medium and campaign. Only the channel label is missing, so they don't appear under Email, Organic Social or the other channels in summary reports.

### Why is my email campaign Unassigned?

Usually because the medium is something like `newsletter` or `mailchimp`. GA4 only files a session under Email when the source or medium is `email` or one of its spellings. Use `utm_medium=email` and put the newsletter name in `utm_campaign` or `utm_source`.

### Does upper or lower case matter?

Not for channel rules, which ignore case. It does matter in reports: `Email` and `email` show up as two separate mediums. Use lowercase everywhere.

### Why does traffic from my short link show as Direct instead of Unassigned?

Direct means GA4 saw no UTM parameters and no referrer. Add UTM parameters to the short link. See [Why social media clicks show as Direct](/docs/social-traffic-direct).
