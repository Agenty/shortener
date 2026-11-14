---
title: Shorten links in bulk from Google Sheets
nav: Google Sheets
description: Paste long URLs into a Google Sheet and create Shortener.dev short links for every row with a small Apps Script, no code to host.
section: Integrations
order: 1
updated: 2026-11-14
---

If your links already live in a spreadsheet, such as a list of product pages, event sessions or ad variations, you can shorten all of them from Google Sheets. A short Apps Script calls the [Shortener.dev API](/docs/url-shortener-api) for each row and writes the short link next to it.

You need an [API key](/docs/api-keys), which is included on paid plans. Every destination must be on a [verified domain](/docs/verify-domain) or a whitelisted site.

## Set up the sheet

Use the first three columns:

| A: Long URL | B: Back-half (optional) | C: Short link |
| --- | --- | --- |
| `https://example.com/shoes/trail-runner` | `trail-runner` | |
| `https://example.com/shoes/road-racer` | | |

Leave column B empty to get a random 7-character back-half. Column C is filled in by the script.

## Add the script

1. In the sheet, open **Extensions** and choose **Apps Script**.
2. Replace the contents of `Code.gs` with the script below and click the save icon.
3. Go back to the sheet and reload it. A **Shortener.dev** menu appears next to **Help**.

```js
const API_URL = 'https://api.shortener.dev/v1/links';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Shortener.dev')
    .addItem('Shorten selected rows', 'shortenSelection')
    .addItem('Set API key', 'setApiKey')
    .addToUi();
}

function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('Shortener.dev API key', 'Paste your API key', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() === ui.Button.OK) {
    PropertiesService.getUserProperties().setProperty('SHORTENER_API_KEY', res.getResponseText().trim());
  }
}

function shortenSelection() {
  const apiKey = PropertiesService.getUserProperties().getProperty('SHORTENER_API_KEY');
  if (!apiKey) throw new Error('Add your API key first: Shortener.dev > Set API key');

  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const first = range.getRow();

  for (let row = first; row < first + range.getNumRows(); row++) {
    const [url, key, shortUrl] = sheet.getRange(row, 1, 1, 3).getValues()[0];
    if (!url || shortUrl) continue; // skip empty rows and rows that already have a short link

    const res = UrlFetchApp.fetch(API_URL, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + apiKey },
      payload: JSON.stringify(key ? { url: url, key: key } : { url: url }),
      muteHttpExceptions: true,
    });
    const body = JSON.parse(res.getContentText());
    sheet.getRange(row, 3).setValue(res.getResponseCode() === 200 ? body.short_url : 'Error: ' + body.message);

    Utilities.sleep(500); // stay under the API rate limit
  }
}
```

The API key is saved in your own user properties for this script, not in the sheet, so people you share the sheet with can't read it.

## Shorten the rows

1. Click **Shortener.dev** and choose **Set API key**. Paste your key and click **OK**. You only do this once.
2. Select the rows you want to shorten. Selecting whole rows or just cells in column A both work.
3. Click **Shortener.dev** and choose **Shorten selected rows**.

The first time, Google asks you to authorize the script to connect to an external service. Allow it.

Short links appear in column C as each row finishes. If a row fails, column C shows the error from the API, such as `Error: Domain not verified: example.org. ...` or a back-half that's already taken. Fix the row, clear its cell in column C and run it again. Rows that already have a short link are skipped, so it's safe to re-run on the whole sheet.

## Large sheets

The script pauses half a second between rows, which keeps it under the API's limit of 150 requests a minute. Google stops an Apps Script run after 6 minutes, which is a few hundred rows. For a bigger list, run it again: finished rows are skipped and it continues where it stopped.

Each row creates one link and counts toward your plan's monthly link limit.

## Track the links

Every short link you create this way shows up on the **Links** page in the dashboard and in [click analytics](/docs/click-analytics). To group them, create a [project](/docs/projects) and add `project_id` to the payload in the script.
