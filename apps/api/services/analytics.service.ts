import { Link } from '../models/link';
import { IResult } from "ua-parser-js";
import { isbot } from "isbot";

export const setAnalytics = (
  env: CloudflareBindings,
  link: Link,
  parseResult: IResult,
  cf: any,
  referer: string,
  ip: string
) => {

  if (!link.account_id || !env.SHORTENER_ANALYTICS) return;

  if (isbot(parseResult.ua)) return;

  try {
    const { browser, os, device } = parseResult;

    const isDesktop =
      device.type === undefined ||
      !['wearable', 'mobile'].includes(device.type);

    env.SHORTENER_ANALYTICS.writeDataPoint({
      blobs: [
        cf.country,
        cf.city,
        cf.region,
        referer,
        browser.name,
        os.name,
        isDesktop ? 'desktop' : device.type,
        ip,
      ],
      doubles: [
        Number(link.account_id),
        Number(cf.metroCode ?? 0),
        Number(cf.longitude ?? 0),
        Number(cf.latitude ?? 0),
      ],
      indexes: [link.key],
    });
  } catch (e) {
    console.error('Error in worker analytics', e);
  }
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
