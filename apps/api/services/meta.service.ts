import { HTTPException } from 'hono/http-exception';
import { load } from 'cheerio';

export const scrapeMetaTags = (url: string, html: any) => {
  const $ = load(html);
  const getMetatag = (name: string) =>
    $(`meta[name=${name}]`).attr('content') ||
    $(`meta[name="og:${name}"]`).attr('content') ||
    $(`meta[property="og:${name}"]`).attr('content') ||
    $(`meta[name="twitter:${name}"]`).attr('content');

  const title = getMetatag('title')
    ? getMetatag('title')
    : $('title').first().text();
  return {
    url,
    title: title,
    favicon: $('link[rel="shortcut icon"]').attr('href'),
    description: getMetatag('description'),
    image: getMetatag('image'),
    author: getMetatag('author'),
    domain: new URL(url).hostname,
    siteName: getMetatag('site_name'),
  };
};

export const isGoogleIndexed = async (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    const resp = await fetch(
      `https://www.google.com/s2/favicons?domain=${hostname}&sz=16`,
      {
        method: 'GET',
        cf: {
          cacheTtl: 60 * 60 * 24,
          cacheEverything: true,
        },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (resp.status != 200) {
      return false;
    }
  } catch {}
  return true;
};

export const extractMetadata = async (url: string) => {
  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'content-type': 'text/html',
      },
      cf: {
        cacheTtl: 60,
        cacheEverything: true,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (resp.status != 200) {
      throw new HTTPException(400, {
        message: `The URL returned an invalid status code ${resp.status}`,
      });
    }
    const html = await resp.text();
    try {
      return scrapeMetaTags(resp.url, html);
    } catch {
      const res = new Response(`The HTML parser failed to extract this page`, {
        status: 400,
      });
      throw new HTTPException(400, { res });
    }
  } catch (e) {
    throw new HTTPException(400, { message: e.message });
  }
};
