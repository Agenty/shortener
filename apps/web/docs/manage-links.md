---
title: Find, edit, export and delete short links
nav: Manage links
description: Search your short links, switch between list and grid view, copy, open or edit a link, export your links to CSV, and permanently delete links you no longer need.
section: Short links
order: 2
updated: 2026-11-17
---

Every link you create is on the **Links** page. The list shows the short link, its destination, a link to its clicks, the status and the date it was created. It shows 25 links per page, with **Previous** and **Next** buttons at the bottom when you have more.

## Search links

Type into **Search links...** at the top of the page. You can search three ways:

- Part of the destination URL, such as `example.com/blog`, to find every link pointing to your blog
- The exact back-half, such as `spring-sale`
- The full short link, such as `srt1.link/spring-sale`, pasted from wherever you shared it

![Searching the links list](/docs/images/links-search.webp)

The search term is kept in the page URL as `?q=`, so you can bookmark a filtered view or send it to a teammate.

## Switch between list and grid view

The two buttons next to the search box switch between list view and grid view. Grid view shows each link as a card with its destination, status and a shortcut to **Analytics**. The dashboard remembers your choice the next time you open **Links**.

![Links in grid view](/docs/images/links-grid.webp)

## Copy or open a link

Click the copy icon next to a short link to copy the full URL, such as `https://srt1.link/spring-sale`. You'll see "Link copied to clipboard!"

The **...** menu at the end of each row has the same **Copy** action, plus **Open**, which opens the destination URL in a new tab so you can check where the link goes, and **QR Code**, which opens the link's QR code. The QR icon next to the copy icon does the same. See [Create a QR code for a short link](/docs/qr-codes).

![Actions menu for a short link](/docs/images/link-actions-menu.webp)

## Edit a link

Choose **Edit** in the **...** menu to change the link's destination or any of its options. The short link stays the same. See [Change where a short link goes](/docs/edit-short-link).

## Blocked links

Shortener.dev checks every destination with Google Safe Browsing when a link is created or edited, and again every few days after that. A link whose destination is found to host malware or phishing, or whose domain has been blocked, gets the status **Blocked** and stops redirecting. Hover over the badge to see the reason. Visitors see "This link has been blocked" instead of the page.

A blocked link can't be edited, moved to another project or opened from the menu, so the flagged page can't be reached through it or hidden behind a new destination. You can still copy it, view its clicks and delete it. If you think a link was blocked by mistake, email [support@shortener.dev](mailto:support@shortener.dev) with the short link.

## Export links to CSV

Click **Export CSV** at the top of the **Links** page to download your links as `links-YYYY-MM-DD.csv`. The export follows the search box and the project menu: search for `example.com/blog` and only matching links are exported, pick a project and only that project's links are. With neither set, every link in your account is exported, not only the page on screen.

| Column | What it contains |
| --- | --- |
| `short_link`, `back_half` | The full short URL and the part after `srt1.link/` |
| `destination` | The **Original URL** |
| `status` | `enabled`, `disabled`, `expired` or `blocked` |
| `project` | The project's name, if the link is in one |
| `created_at`, `expire_at` | Dates in UTC, `expire_at` empty when there's no expiration |
| `utm_source` to `utm_content` | One column per UTM parameter |
| `other_params` | Any other parameters, such as `ref=newsletter` |
| `password_protected` | `yes` or `no`. The password itself is never exported. |
| `ios_url`, `android_url` | App targeting URLs |
| `geo_targets` | Country rules as `GB=https://... DE=https://...` |
| `preview_title`, `preview_description`, `preview_image` | The custom social preview, if set |

Use it to keep a backup, review UTM values across a campaign, or hand a list of links to someone without dashboard access. For clicks, export the click log from [Reports](/docs/click-reports#export-the-clicks-to-csv).

## Delete a short link

1. Click the **...** menu on the link's row.
2. Click **Delete**.
3. Check the short link in the confirmation, then click **Delete** again.

![Delete link confirmation](/docs/images/delete-link.webp)

Deleting is permanent and can't be undone. The short link stops redirecting within about a minute, so anyone who clicks it afterwards won't reach your page. If you might need the link again, [disable it](/docs/disable-short-link) instead. If it's printed or shared widely, consider an [expiration date](/docs/link-expiration), so it keeps working until a planned end date, or [point it at a new page](/docs/edit-short-link).

## Create links in bulk

The code icon next to **Create Link** opens **API Examples** with ready-made requests in cURL, JavaScript, Python, PHP and Go. To create many links at once, use those examples with an API key. See [Shorten URLs with the API](/docs/url-shortener-api).

![API Examples panel with a cURL request](/docs/images/api-examples.webp)
