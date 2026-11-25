import _ from 'lodash';

/**
 * Cloudflare URL Scanner (v2), the second check after Google Safe Browsing.
 * Scans are asynchronous: submitted one at a time, the result is polled later.
 * https://developers.cloudflare.com/radar/investigate/url-scanner/
 *
 * Limits on Free and self-serve plans: 1 request per 10 seconds and 5,000
 * public scans per month. Only new or updated links are scanned, each URL at
 * most once per `RESCAN_URL_AFTER` seconds
 */

/** Seconds between scan requests, the plan limit is 1 request per 10 seconds */
export const SCAN_INTERVAL = 11;

/** A URL isn't scanned again within 30 days, saves the monthly quota */
const RESCAN_URL_AFTER = 60 * 60 * 24 * 30;

export type UrlScan = { uuid: string; url: string };

export type UrlScanVerdict =
  | { status: 'pending' }
  | { status: 'finished'; malicious: boolean; categories: Array<string> };

/** Thrown on 429, the queue message is retried after a delay */
export class UrlScannerRateLimitError extends Error {}

export const isUrlScannerEnabled = (env: CloudflareBindings) =>
  !!env.CF_RADAR_KEY && !!env.CF_ACCOUNT_ID;

const apiUrl = (env: CloudflareBindings, path: string) =>
  `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/urlscanner/v2/${path}`;

const headers = (env: CloudflareBindings) => ({
  Authorization: `Bearer ${env.CF_RADAR_KEY}`,
  'content-type': 'application/json',
});

const cacheKey = (url: string) => `urlscan-${url}`;

/** URLs not scanned in the last 30 days, KV keys are limited to 512 bytes */
export const filterUnscannedUrls = async (
  env: CloudflareBindings,
  urls: Array<string>
) => {
  const candidates = _.uniq(urls).filter((url) => cacheKey(url).length <= 512);
  const seen = await Promise.all(candidates.map((url) => env.KVCACHE.get(cacheKey(url))));
  return candidates.filter((_url, i) => !seen[i]);
};

/**
 * Submits a URL as a public scan. Unlisted scans have a much smaller quota
 * (none on the Free plan), and bulk scans aren't available on every plan.
 * Public scans are listed in Cloudflare's scan search. Returns undefined when
 * the URL can't be scanned, e.g. an invalid or unreachable host
 */
export const submitScan = async (
  env: CloudflareBindings,
  url: string
): Promise<UrlScan | undefined> => {
  const res = await fetch(apiUrl(env, 'scan'), {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify({ url, visibility: 'Public' }),
  });
  if (res.status === 429) {
    throw new UrlScannerRateLimitError('URL Scanner rate limit exceeded');
  }
  if (res.status >= 500 || res.status === 401 || res.status === 403) {
    throw new Error(`URL Scanner submit failed: ${res.status} ${await res.text()}`);
  }
  // Not scanned again for 30 days, also when it was rejected
  const { uuid }: { uuid?: string } = res.ok ? await res.json() : {};
  if (!res.ok) {
    console.warn(`URL Scanner rejected ${url}: ${res.status} ${await res.text()}`);
  }
  await env.KVCACHE.put(cacheKey(url), uuid || 'rejected', {
    expirationTtl: RESCAN_URL_AFTER,
  });
  return uuid ? { uuid, url } : undefined;
};

/** The scan result is 404 while the scan is still running */
export const getScanVerdict = async (
  env: CloudflareBindings,
  uuid: string
): Promise<UrlScanVerdict> => {
  const res = await fetch(apiUrl(env, `result/${uuid}`), { headers: headers(env) });
  if (res.status === 404) return { status: 'pending' };
  if (res.status === 429) {
    throw new UrlScannerRateLimitError('URL Scanner rate limit exceeded');
  }
  if (!res.ok) {
    throw new Error(`URL Scanner result failed: ${res.status} ${await res.text()}`);
  }
  const result: {
    verdicts?: { overall?: { malicious?: boolean; categories?: Array<string> } };
  } = await res.json();
  return {
    status: 'finished',
    malicious: !!result.verdicts?.overall?.malicious,
    categories: result.verdicts?.overall?.categories || [],
  };
};
