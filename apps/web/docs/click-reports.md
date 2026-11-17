---
title: View and export the raw click log
nav: Click reports
description: The Reports page lists each click on your short links with the time, location, browser, device and referrer of the visitor. Filter it, and export it as a CSV file.
section: Analytics
order: 2
updated: 2026-11-17
---

[Click analytics](/docs/click-analytics) shows totals. **Reports** shows the individual clicks behind them, which helps when you want to check a specific click, spot unusual traffic or work with the data in a spreadsheet.

![Reports page with the click log](/docs/images/reports.webp)

The log covers the last 30 days, newest first. Click reports are included on paid plans. See [pricing](/pricing).

## What each row shows

| Column | Details |
| --- | --- |
| URL | The short link that was clicked |
| Location | Country flag and city |
| Browser | Browser and operating system |
| Device | Desktop, mobile or tablet |
| Referrer | The page the click came from, or **Direct** |
| IP | The visitor's IP address, shown on wide screens |
| Time | Date and time of the click |

The header shows the total number of clicks in the log. Use the page numbers at the bottom to go back further. Each page has 25 clicks.

## Filter the clicks

- Pick **Desktop**, **Mobile** or **Tablet** in the menu at the top to show only clicks from that device type. Choose **All Devices** to clear it.
- Click a short link, country, browser, operating system or referrer in any row to show only the clicks that match it. Each filter appears as a chip above the table. Click the chip's **x** to remove it.

Filters apply to the whole log, not only the page on screen, and the total in the header changes to match. You can also arrive with filters already set: on the **Analytics** page, click a value in any report, then **View clicks**.

## Export the clicks to CSV

Click **Export CSV** in the top right corner. Shortener.dev downloads every click that matches the current filters as `clicks-YYYY-MM-DD.csv`, not just the 25 on screen. Large logs take a few seconds.

| Column | Example |
| --- | --- |
| `time_utc` | `2026-11-16T22:58:04Z` |
| `short_link` | `https://srt1.link/spring-sale` |
| `country` | `US` |
| `region` | `NY` |
| `city` | `New York` |
| `referrer` | `linkedin.com`, or empty for direct clicks |
| `browser` | `Chrome` |
| `os` | `macOS` |
| `device` | `desktop`, `mobile` or `tablet` |
| `ip` | `203.0.113.10` |

Times are in UTC, so add or subtract your offset when you read them by hour.

The file opens directly in Excel, Google Sheets and Numbers, including city names with accents. Values that start with `=`, `+`, `-` or `@` are written with a leading apostrophe so a spreadsheet never runs them as formulas.

The export contains visitors' IP addresses. Treat the file as personal data: share it only with people who need it, and remove the `ip` column before sending it outside your team.

## Get the click log through the API

`GET /v1/reports` returns the same data with `offset` and `limit` for paging, up to 1,000 clicks per request. It takes the same filters as the page: `url` for one short link, and `country`, `city`, `referer`, `browser`, `os` and `device`. Use it to load clicks into your own data warehouse on a schedule. See [URL shortener API in Python](/docs/url-shortener-api-python#export-clicks-to-csv) for a script.

## Frequently asked questions

### How do I export my link clicks?

Open **Reports**, set any filters you want, and click **Export CSV**. The file has one row per click with the time, short link, location, referrer, browser, operating system, device and IP address.

### How far back does the export go?

The last 30 days, on every paid plan. For totals over a longer period, use [click analytics](/docs/click-analytics), which goes back as far as your plan's analytics history.

### Can I export the clicks of one link?

Yes. Click the short link in any row to filter the log to it, then click **Export CSV**.
