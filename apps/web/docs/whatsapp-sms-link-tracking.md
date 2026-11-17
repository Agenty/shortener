---
title: Track link clicks in WhatsApp and SMS messages
nav: WhatsApp and SMS tracking
description: WhatsApp and text messages don't tell your analytics where a click came from. Use one short link per group, broadcast or SMS list, add UTM values GA4 files correctly, and keep link previews from inflating your numbers.
section: Guides
order: 18
updated: 2026-11-17
---

A click from WhatsApp or a text message arrives with no referrer. The messaging app hands the link to the phone's browser and says nothing about where it was tapped, so your analytics files it as **Direct**, next to people who typed your URL. Short links fix that, because the link itself says where it was shared.

## Make a tracked link for WhatsApp

1. Open **Links** and click **Create Link**.
2. Paste your page into **Original URL**.
3. Give it a back-half that names the chat, such as `wa-vip-group` or `wa-nov-broadcast`.
4. Open **Options**, click **UTM Builder**, and set `utm_source` to `whatsapp`, `utm_medium` to `social` and `utm_campaign` to your campaign name.
5. Click **Create Short Link** and paste the short link into the message.

![UTM Builder with whatsapp as the source, social as the medium and the campaign filled in](/docs/images/utm-whatsapp.webp)

Clicks appear in [click analytics](/docs/click-analytics) under the back-half, and in Google Analytics under the source and campaign you set. `utm_medium=social` puts the visits in GA4's Organic Social channel. See [GA4 Unassigned traffic](/docs/ga4-unassigned-utm) for why values like `whatsapp` as a medium end up in Unassigned instead.

## One link per group, broadcast or list

If you share the same link in five WhatsApp groups, you get one total and no idea which group cared. Create a link for each:

| Where it's sent | Short link | utm_content |
| --- | --- | --- |
| Customer group, Mumbai | `srt1.link/wa-grp-mumbai` | `group_mumbai` |
| Customer group, Delhi | `srt1.link/wa-grp-delhi` | `group_delhi` |
| Broadcast list, VIP | `srt1.link/wa-bc-vip` | `broadcast_vip` |
| WhatsApp Status | `srt1.link/wa-status-nov` | `status` |
| SMS to newsletter subscribers | `srt1.link/sms-nov` | `sms_subscribers` |

Put the links of one campaign in a [project](/docs/projects) so you can see the campaign total and each group side by side. Creating many links at once is quicker with the [Bulk URL Shortener](/tools/bulk-url-shortener) or [Google Sheets](/docs/google-sheets).

## Link to a WhatsApp chat

To get people to message you rather than visit a page, link to a `wa.me` URL with a prefilled message. The free [WhatsApp link generator](/tools/whatsapp-link-generator) builds one from your phone number and message. Shorten the `wa.me` URL to count how many people opened the chat. `wa.me` is on the global whitelist, so you don't need to verify a domain for it.

The count tells you how many people tapped the link, not how many sent the message.

## Link previews

When you paste a link into WhatsApp, it fetches the page to build a preview with a title and image. WhatsApp's crawler identifies itself as a bot, so these requests aren't counted as clicks. See [Bot clicks and link previews](/docs/bot-clicks-link-previews).

The preview is taken from the destination page. To show something different, such as a campaign image, set a title, description and image on the short link with [Social Preview](/docs/social-media-preview).

## SMS: length, trust and carrier filtering

A short link keeps text messages short. A standard SMS holds 160 characters, or 70 if the message contains an emoji or a character outside the basic alphabet. Longer messages are split into parts and billed per part. A 120-character URL with UTM parameters can push a message into a second part on its own. `srt1.link/sms-nov` is 17 characters.

People are rightly careful with links in text messages. When someone opens a Shortener.dev link, a redirect page shows the destination's domain before forwarding them, so they can see where they're going. See [How to check where a short link goes](/docs/check-short-link-destination).

Some mobile carriers and SMS providers filter or block messages containing links on shared short domains, because they're used in spam. Before a bulk SMS campaign, ask your SMS provider whether links on `srt1.link` are allowed on your sender registration, and send a test to phones on the main carriers you're targeting.

## What you'll see in the reports

- **Referers** shows most WhatsApp and SMS clicks as **Direct**. That's expected. The back-half tells you the source. See [Why social media clicks show as Direct](/docs/social-traffic-direct).
- **Devices** is almost all mobile. Desktop clicks usually come from WhatsApp Web or WhatsApp Desktop.
- **Clicks Over Time** shows when people act after a message. Broadcasts usually get most of their clicks within a few hours.

## Checklist

- One short link per group, broadcast list, Status update or SMS list.
- `utm_source=whatsapp` or `sms`, a medium GA4 recognizes such as `social` or `sms`, and the campaign name.
- A back-half that says where the link was sent.
- A social preview image that looks right in the chat.
- For SMS, the provider confirmed links are allowed, and a test message reached each main carrier.

## Frequently asked questions

### Can you see if someone clicked a link you sent on WhatsApp?

You can see that the link was clicked, when, and from which country, city and device. You can't see the person's name or number. To know which chat or person it was, send each one its own short link. See [Can you see who clicked your link?](/docs/who-clicked-my-link)

### Does a WhatsApp link preview count as a click?

No. The preview is fetched by WhatsApp's crawler, which is filtered out of click analytics.

### Why does WhatsApp traffic show as Direct in Google Analytics?

WhatsApp doesn't send a referrer when it opens a link. Add UTM parameters to the short link so the visit carries its source with it.

### Is WhatsApp link tracking free?

Yes. Short links, click analytics and UTM parameters are on the Free plan. The Free plan includes 50 links and 7 days of analytics history. See [Plans and limits](/docs/plans-and-limits).
