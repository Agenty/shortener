---
title: Move your links from Bitly to Shortener.dev
nav: Move from Bitly
description: Copy your Bitly links into Shortener.dev with the same back-halves using a short Node.js script and both APIs, and get a CSV that maps every old link to its new one.
section: Integrations
order: 3
updated: 2026-11-14
---

This script reads every link in your Bitly account and creates the same link in Shortener.dev, keeping the back-half where it can. When it's done you have a CSV with the old Bitly link next to the new `srt1.link` link, so you can update your website, email templates and social bios.

Your existing `bit.ly` links keep pointing to Bitly. Nothing here changes them, and Shortener.dev can't take over the `bit.ly` domain. Click history also stays in Bitly. Export any reports you need before you close your Bitly account.

## Before you start

- A Bitly access token. Create one in your Bitly account settings, under the API or developer section.
- A Shortener.dev [API key](/docs/api-keys), which is included on paid plans.
- Every destination domain [verified](/docs/verify-domain) in Shortener.dev, unless it's a whitelisted site like YouTube or Amazon. Links to unverified domains are skipped and listed in the CSV, so you can verify them and run the script again.
- Node.js 18 or later.
- Enough links left on your plan for the import. Each imported link counts toward your monthly limit.

## The script

Save this as `bitly-to-shortener.mjs`:

```js
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const BITLY = 'https://api-ssl.bitly.com/v4';
const SHORTENER = 'https://api.shortener.dev/v1/links';
const bitlyHeaders = { Authorization: `Bearer ${process.env.BITLY_TOKEN}` };
const shortenerHeaders = {
  Authorization: `Bearer ${process.env.SHORTENER_API_KEY}`,
  'Content-Type': 'application/json',
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const OUTPUT = 'bitly-to-shortener.csv';

// Links that worked in an earlier run, so a rerun doesn't create them twice
const done = new Map();
if (existsSync(OUTPUT)) {
  for (const line of readFileSync(OUTPUT, 'utf8').split('\n').slice(1)) {
    const cells = line.slice(1, -1).split('","');
    if (cells[2]) done.set(cells[0], cells);
  }
}

// 1. Read every Bitly link in the default group
const user = await fetch(`${BITLY}/user`, { headers: bitlyHeaders }).then((r) => r.json());
let next = `${BITLY}/groups/${user.default_group_guid}/bitlinks?size=100`;
const bitlinks = [];
while (next) {
  const page = await fetch(next, { headers: bitlyHeaders }).then((r) => r.json());
  bitlinks.push(...page.links);
  next = page.pagination?.next || null;
}
console.log(`Found ${bitlinks.length} Bitly links`);

// 2. Create each one in Shortener.dev, keeping the back-half when it's valid
const rows = [['bitly_link', 'long_url', 'new_link', 'error']];
for (const link of bitlinks) {
  if (done.has(`https://${link.id}`)) {
    rows.push(done.get(`https://${link.id}`));
    continue;
  }
  const backHalf = link.id.split('/').pop().toLowerCase();
  const body = { url: link.long_url };
  if (/^[a-z0-9_-]{2,32}$/.test(backHalf)) body.key = backHalf;
  if (link.title) body.title = link.title.slice(0, 60);

  let res = await fetch(SHORTENER, { method: 'POST', headers: shortenerHeaders, body: JSON.stringify(body) });
  let data = await res.json();

  // Back-half already taken: retry with a random one
  if (!res.ok && body.key && data.message?.includes('already been used')) {
    delete body.key;
    res = await fetch(SHORTENER, { method: 'POST', headers: shortenerHeaders, body: JSON.stringify(body) });
    data = await res.json();
  }

  rows.push([`https://${link.id}`, link.long_url, res.ok ? data.short_url : '', res.ok ? '' : data.message]);
  console.log(res.ok ? `${link.id} -> ${data.short_url}` : `${link.id} failed: ${data.message}`);
  await sleep(500); // stay under 150 requests a minute
}

// 3. Save the mapping
const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
writeFileSync(OUTPUT, csv);
console.log(`Saved ${OUTPUT}`);
```

Run it with both keys in the environment:

```bash
BITLY_TOKEN=your-bitly-token SHORTENER_API_KEY=your-shortener-key node bitly-to-shortener.mjs
```

## How back-halves carry over

Shortener.dev back-halves are lowercase, 2 to 32 characters, and use only letters, numbers, `-` and `_`. Bitly back-halves are case-sensitive, so `bit.ly/Spring` and `bit.ly/spring` both become `srt1.link/spring`. The second one hits "already been used" and gets a random back-half instead.

Back-halves are unique across all Shortener.dev accounts, so a popular word like `sale` may already be taken by someone else. Those links also get a random back-half. Check the `new_link` column in the CSV for the final URLs.

## Links that fail

Look at the `error` column in `bitly-to-shortener.csv`:

- `Domain not verified` means you need to [verify that domain](/docs/verify-domain). Verify it and run the script again in the same folder. Links that already have a `new_link` in the CSV are skipped, so only the failed ones are retried.
- `Domain blocked` means the destination is on a domain Shortener.dev doesn't allow, such as another link shortener or a free hosting service. If a Bitly link points to another short link, use the final destination instead.

Bitly-only features such as custom domains, link-in-bio pages and campaign data aren't copied. UTM parameters inside the long URL are kept as part of the URL.
