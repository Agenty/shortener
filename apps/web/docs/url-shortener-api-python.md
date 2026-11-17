---
title: URL shortener API in Python and JavaScript, bulk links from CSV and click export
nav: API in Python and JavaScript
description: Shorten URLs from Python and JavaScript with the Shortener.dev REST API. Create one link, create hundreds from a CSV within the rate limit, handle errors, and export every click to CSV.
section: Guides
order: 22
updated: 2026-11-17
---

This guide builds on [Shorten URLs with the API](/docs/url-shortener-api) with complete scripts for the jobs people usually automate: creating links in bulk from a spreadsheet, and getting click data back out. You need an [API key](/docs/api-keys), available on paid plans. The scripts read it from the `SHORTENER_API_KEY` environment variable.

```bash
export SHORTENER_API_KEY="your-key"
pip install requests
```

## Create one short link

```python
import os
import requests

API = "https://api.shortener.dev/v1"
session = requests.Session()
session.headers["Authorization"] = f"Bearer {os.environ['SHORTENER_API_KEY']}"

response = session.post(f"{API}/links", json={
    "url": "https://example.com/blog/spring-launch",
    "key": "spring-launch",
    "params": {"utm_source": "newsletter", "utm_medium": "email", "utm_campaign": "spring_launch"},
})
if not response.ok:
    raise SystemExit(f"{response.status_code}: {response.json().get('message')}")

print(response.json()["short_url"])  # https://srt1.link/spring-launch
```

Leave out `key` to get a random back-half. Every option in the dashboard, such as `expire_at`, `password`, `geo` or `project_id`, is a field on the same request. The [API reference](/docs/api) lists them all.

## Create links in bulk from a CSV

Start with a CSV that has a `url` column, and optionally `key`, `utm_source`, `utm_medium` and `utm_campaign`:

```csv
url,key,utm_source,utm_medium,utm_campaign
https://example.com/shoes/trail-runner,trail-runner,instagram,social,2026_11_launch
https://example.com/shoes/road-racer,road-racer,instagram,social,2026_11_launch
https://example.com/shoes/kids-sprint,,newsletter,email,2026_11_launch
```

The script below creates a link for each row and writes the result, or the error, to a new CSV. It stays under the API's rate limit of 150 requests a minute and waits when it gets a `429` anyway:

```python
import csv
import os
import sys
import time

import requests

API = "https://api.shortener.dev/v1"
session = requests.Session()
session.headers["Authorization"] = f"Bearer {os.environ['SHORTENER_API_KEY']}"

def create_link(row):
    body = {"url": row["url"].strip()}
    if row.get("key"):
        body["key"] = row["key"].strip()
    params = {k: row[k] for k in ("utm_source", "utm_medium", "utm_campaign") if row.get(k)}
    if params:
        body["params"] = params

    for attempt in range(5):
        response = session.post(f"{API}/links", json=body, timeout=30)
        if response.status_code == 429:
            time.sleep(15 * (attempt + 1))
            continue
        return response
    return response

source, target = sys.argv[1], sys.argv[2]
with open(source, newline="") as f_in, open(target, "w", newline="") as f_out:
    rows = csv.DictReader(f_in)
    writer = csv.DictWriter(f_out, fieldnames=[*rows.fieldnames, "short_url", "error"])
    writer.writeheader()
    for row in rows:
        response = create_link(row)
        if response.ok:
            row["short_url"] = response.json()["short_url"]
        else:
            row["error"] = f"{response.status_code}: {response.json().get('message')}"
            if response.status_code in (401, 402):
                writer.writerow(row)
                raise SystemExit(row["error"])  # bad key or link limit, stop here
        writer.writerow(row)
        time.sleep(0.5)  # about 120 requests a minute
```

Run it with `python bulk_shorten.py links.csv links-short.csv`. Rows that fail, for example because a back-half is taken, get the error message in the `error` column and the script carries on, so you can fix those rows and run them again.

Check your plan's link limit before a large run. The script stops on `402`, which means the limit is reached. See [Plans and limits](/docs/plans-and-limits).

## The same in JavaScript

Node 18 and newer has `fetch` built in. This version reads URLs from a text file, one per line:

```js
import { readFile } from 'node:fs/promises';

const API = 'https://api.shortener.dev/v1';
const headers = {
  Authorization: `Bearer ${process.env.SHORTENER_API_KEY}`,
  'Content-Type': 'application/json',
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createLink(url, attempt = 0) {
  const response = await fetch(`${API}/links`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url }),
  });
  if (response.status === 429 && attempt < 5) {
    await sleep(15000 * (attempt + 1));
    return createLink(url, attempt + 1);
  }
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${body.message}`);
  return body.short_url;
}

const urls = (await readFile(process.argv[2], 'utf8')).split('\n').map((line) => line.trim()).filter(Boolean);
for (const url of urls) {
  try {
    console.log(`${url},${await createLink(url)}`);
  } catch (error) {
    console.error(`${url},${error.message}`);
  }
  await sleep(500);
}
```

Save it as `shorten.mjs` and run `node shorten.mjs urls.txt > links.csv`.

## Export clicks to CSV

`GET /v1/reports` returns the click log for the last 30 days, newest first, up to 1,000 clicks per request. Page through it with `offset` until you have every click:

```python
import csv
import os

import requests

API = "https://api.shortener.dev/v1"
session = requests.Session()
session.headers["Authorization"] = f"Bearer {os.environ['SHORTENER_API_KEY']}"

fields = ["timestamp", "url", "country", "region", "city", "referer", "browser", "os", "device", "ip"]
with open("clicks.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    offset = 0
    while True:
        response = session.get(f"{API}/reports", params={"offset": offset, "limit": 1000}, timeout=60)
        response.raise_for_status()
        page = response.json()
        writer.writerows(page["result"])
        offset += page["returned"]
        if page["returned"] == 0 or offset >= page["total"]:
            break

print(f"Saved {offset} clicks to clicks.csv")
```

The endpoint also takes `country`, `city`, `referer`, `browser`, `os` and `device` filters, for example `params={"device": "mobile", ...}` to export only mobile clicks. Clicks are stored in UTC.

## Get click totals for a list of links

For a quick number per link, `GET /v1/analytics/clicks` returns the last 30 days of clicks for up to 25 back-halves in one request:

```python
response = session.get(f"{API}/analytics/clicks", params={"key": ["trail-runner", "road-racer", "kids-sprint"]})
for row in response.json():
    print(row["key"], row["clicks"])
```

`requests` repeats the `key` parameter for each value in the list, which is the format the endpoint expects.

## Errors to handle

| Status | When it happens | What to do |
| --- | --- | --- |
| `400` | Invalid URL, a back-half that's taken, or an invalid field | Read `message`, fix the row and retry it |
| `401` | Missing or wrong API key | Check `SHORTENER_API_KEY` |
| `402` | Your plan's link limit is reached | Stop, upgrade or wait for the monthly count to reset |
| `403` | The destination domain isn't verified | [Verify the domain](/docs/verify-domain) or use a whitelisted site |
| `429` | More than 150 requests a minute | Wait and retry, as the scripts above do |

## Frequently asked questions

### Is there a free URL shortener API?

API access is included on the Starter plan and above. On the Free plan, create links in the dashboard or with the [Bulk URL Shortener](/tools/bulk-url-shortener), which takes up to 50 URLs at once.

### What's the API rate limit?

150 requests a minute. The scripts in this guide pause between requests and back off when they get a `429`.

### Can I set a custom back-half and UTM parameters in the same request?

Yes. Send `key` for the back-half and `params` for the UTM parameters, as in the first example.
