---
title: Website migration, keep short links pointing to the right pages
nav: Website migration
description: Moving to a new website or URL structure? List every short link that points into the old site, map each one to its new page, update them in one run, and test after launch. A migration map template.
section: Playbooks
order: 4
updated: 2026-11-17
---

When a website moves to a new domain, platform or URL structure, the redirects on the website get all the attention. Short links are easy to forget, and they're often the ones on printed QR codes, in old newsletters and in social bios that you can't edit. If the old site's redirects are incomplete, those links break.

Short links have one advantage: you can update the destination without touching anything that was printed or shared. This playbook lists them, maps them and updates them in one go.

## 1. List every short link pointing into the site

Open **Links** and search for the old domain. The search matches part of the destination, so `example.com` finds every link pointing there. Then click **Export CSV**. The file lists every matching link, not only the first page, with its back-half and destination in the `back_half` and `destination` columns. That's the starting point for the map below. See [Export links to CSV](/docs/manage-links#export-links-to-csv).

To see which links are still in use, open **Analytics**, choose **Last 30d**, and look at **Top Links**, or click **View** next to a link on the **Links** page. A link with clicks in the last weeks is still in circulation somewhere and needs a working destination.

## 2. Build the migration map

One row per short link:

| Short link | Old destination | New destination | Where it's used | Clicks last 30 days | Status |
| --- | --- | --- | --- | --- | --- |
| `srt1.link/menu-table` | `https://example.com/menu.html` | `https://example.com/menu` | QR on table tents | 412 | |
| `srt1.link/spring-sale` | `https://example.com/sale/spring` | `https://example.com/offers` | Old newsletters | 3 | |
| `srt1.link/support` | `https://example.com/help/index.php` | `https://help.example.com` | Product packaging | 96 | |

As CSV:

```csv
key,old_destination,new_destination,used_in,clicks_30d,status
menu-table,https://example.com/menu.html,https://example.com/menu,QR on table tents,412,
spring-sale,https://example.com/sale/spring,https://example.com/offers,Old newsletters,3,
support,https://example.com/help/index.php,https://help.example.com,Product packaging,96,
```

For pages that no longer exist, pick the closest live page rather than the home page. A QR code on a menu should land on the menu.

If the new site is on a new domain, [verify the domain](/docs/verify-domain) in Shortener.dev before launch. Links can only point to verified or whitelisted domains.

## 3. Update the links at launch

Change each link to its new destination after the new site is live, so nobody lands on a page that doesn't exist yet.

For a handful of links, use the dashboard: choose **Edit** in the link's **...** menu, change **Original URL** and click **Save Changes**. See [Change where a short link goes](/docs/edit-short-link).

For more, use the API on a paid plan. `PUT /v1/links/{key}` replaces the whole link, so the script reads each link, changes only `url`, and sends it back. That keeps UTM parameters, geo rules and other options as they are:

```python
import csv
import os

import requests

API = "https://api.shortener.dev/v1"
session = requests.Session()
session.headers["Authorization"] = f"Bearer {os.environ['SHORTENER_API_KEY']}"

with open("migration-map.csv", newline="") as f:
    for row in csv.DictReader(f):
        link = session.get(f"{API}/links/{row['key']}").json()
        link["url"] = row["new_destination"]
        response = session.put(f"{API}/links/{row['key']}", json=link)
        print(row["key"], response.status_code, response.json().get("message", "updated"))
```

Geo-targeted links have a destination per country in `geo`. Update those URLs in the same script if the country pages moved too.

## 4. Test after launch

Open every short link with clicks in the last 30 days and fill in the **Status** column. For QR codes, scan a printed copy rather than clicking the link on screen. Check:

- The page loads and is the right one.
- UTM parameters arrive in the address bar.
- No extra redirect hop on the website sends the visitor somewhere unexpected.

Keep the old site's redirects in place too. People also reach your pages through bookmarks and search results that don't go through a short link.

## 5. Watch the first weeks

Check **Analytics** for the links in the map for a couple of weeks after launch. Clicks should continue at about the same rate. A link whose clicks continue but whose page analytics show nothing is probably landing on a page without your analytics tag, or on an error page.

## Frequently asked questions

### Do I need to reprint QR codes when my website moves?

No, if the QR code holds a short link. Update the short link's destination and the printed codes follow. QR codes that hold the old website address directly depend on the old site's redirects.

### Can I change many short links at once?

Yes, with the API script above. It reads each link, changes the destination and saves it, one request per link. For a few links, editing them one by one in the dashboard is quicker.

### What about links to pages that no longer exist?

Point them to the closest page that does exist, or [turn them off](/docs/disable-short-link) if there's no sensible replacement. A disabled link shows a "not available" page instead of an error on your site.
