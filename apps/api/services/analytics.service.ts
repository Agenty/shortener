import { Link } from '../models/link';
import { UAParser } from 'ua-parser-js';
import { isbot } from 'isbot';
import { HTTPException } from 'hono/http-exception';
import { ClickFilter } from '../models/paged';

/** Hostname of the referring page, e.g. linkedin.com, or 'null' for direct traffic */
const toRefererHost = (referer?: string) => {
  if (!referer) return 'null';
  try {
    return new URL(referer).hostname.replace(/^www\./, '');
  } catch {
    return 'null';
  }
};

/**
 * Record a short link click in Analytics Engine.
 * Blob positions are read by the analytics, reports and admin controllers,
 * so only append new fields, never reorder:
 *
 * Each data point is one click, count clicks with SUM(_sample_interval)
 * so totals stay accurate when Analytics Engine samples rows.
 *
 *  blob1 key               double1 account_id
 *  blob2 country           double2 project_id (0 when none)
 *  blob3 city              double3 latitude
 *  blob4 region            double4 longitude
 *  blob5 referer host
 *  blob6 browser
 *  blob7 os
 *  blob8 device type
 *  blob9 ip
 *  blob10 destination url
 *  blob11 referer url (full)
 */
export const setAnalytics = (
  env: CloudflareBindings,
  link: Link,
  req: Request,
  destination: string
) => {
  if (!link.account_id || !env.SHORTENER_ANALYTICS) return;

  const ua = req.headers.get('user-agent') || '';
  if (!ua || isbot(ua)) return;

  try {
    const { browser, os, device } = UAParser(ua);
    const cf: any = req.cf || {};
    const referer = req.headers.get('referer') || '';
    const ip = req.headers.get('cf-connecting-ip') || '';

    // ua-parser leaves device type empty for desktops
    const deviceType =
      !device.type || !['mobile', 'tablet', 'wearable'].includes(device.type)
        ? 'desktop'
        : device.type;

    env.SHORTENER_ANALYTICS.writeDataPoint({
      blobs: [
        link.key,
        cf.country ?? null,
        cf.city ?? null,
        cf.region ?? null,
        toRefererHost(referer),
        browser.name ?? null,
        os.name ?? null,
        deviceType,
        ip,
        destination,
        referer || null,
      ],
      doubles: [
        Number(link.account_id),
        Number(link.project_id ?? 0),
        Number(cf.latitude ?? 0),
        Number(cf.longitude ?? 0),
      ],
      indexes: [link.key],
    });
  } catch (e) {
    console.error('Error in worker analytics', e);
  }
};

/** Analytics Engine column of each drill-down filter, see the blob layout above */
const FILTER_COLUMNS: Record<keyof ClickFilter, string> = {
  country: 'blob2',
  city: 'blob3',
  referer: 'blob5',
  browser: 'blob6',
  os: 'blob7',
  device: 'blob8',
};

// Filter values are interpolated in the Analytics Engine SQL, so reject
// anything that could close the string literal
const FILTER_VALUE_PATTERN = /^[^'\\\x00-\x1f]{1,256}$/;

/** `AND ...` conditions for the drill-down filters set in the query */
export const filterClause = (filter: ClickFilter) => {
  let clause = '';
  for (const [field, column] of Object.entries(FILTER_COLUMNS)) {
    let value = filter[field as keyof ClickFilter];
    if (!value) continue;
    if (!FILTER_VALUE_PATTERN.test(value)) {
      throw new HTTPException(400, { message: `Invalid ${field}: ${value}` });
    }
    // Direct traffic is stored as 'null', see toRefererHost
    if (field === 'referer' && value === '(direct)') value = 'null';
    clause += ` AND ${column} = '${value}'`;
  }
  return clause;
};

// Implement caching
// https://developers.cloudflare.com/workers/examples/cache-post-request/

export const getAnalytics = async (
  env: CloudflareBindings,
  query: string
) => {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CF_API_KEY}`,
    },
    body: query,
  });

  if (res.status != 200) {
    console.error('Error querying:', await res.text());
    return [];
  }
  const json: any = await res.json();
  return json.data;
};
