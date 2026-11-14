import { isbot } from 'isbot';
import { Link } from '../models/link';
import { generateMd5 } from '../helper/utility';
import { extractMetadata } from './meta.service';

/** Open Graph tags printed on the redirect and password pages */
export interface PreviewMeta {
  title?: string;
  description?: string;
  image?: string;
}

/** Destination tags are cached for a day, link previews rarely need fresher data */
const PREVIEW_CACHE_TTL = 60 * 60 * 24;

/** Social crawlers give up after a few seconds, so does the destination fetch */
const PREVIEW_FETCH_TIMEOUT = 4000;

const clean = (value?: string | null) => value?.trim() || undefined;

/** Absolute image URL, scraped pages often use relative paths */
const absoluteUrl = (value: string | undefined, base: string) => {
  if (!value) return undefined;
  try {
    return new URL(value, base).toString();
  } catch {
    return undefined;
  }
};

/** Title, description and image of the destination page, cached in KV, empty on any failure */
const getDestinationMeta = async (env: CloudflareBindings, url: string): Promise<PreviewMeta> => {
  const cacheKey = `preview:${await generateMd5(url)}`;
  const cached = await env.KVCACHE.get<PreviewMeta>(cacheKey, 'json');
  if (cached) return cached;

  let meta: PreviewMeta = {};
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), PREVIEW_FETCH_TIMEOUT)
    );
    const page = await Promise.race([extractMetadata(url), timeout]);
    meta = {
      title: clean(page.title),
      description: clean(page.description),
      image: absoluteUrl(clean(page.image), page.url || url),
    };
  } catch {
    // Unreachable or slow destination, cache the empty result so crawlers don't retry it on every hit
  }
  await env.KVCACHE.put(cacheKey, JSON.stringify(meta), { expirationTtl: PREVIEW_CACHE_TTL });
  return meta;
};

/**
 * Preview tags for a short link. The link's own social preview wins, field by field.
 * Only crawlers fall back to the destination's tags, so visitors never wait for that fetch,
 * and `withDestination` is off for password links so their destination stays private
 */
export const getPreviewMeta = async (
  env: CloudflareBindings,
  link: Link,
  userAgent = '',
  withDestination = true
): Promise<PreviewMeta> => {
  const own: PreviewMeta = {
    title: clean(link.title),
    description: clean(link.description),
    image: clean(link.image),
  };
  const complete = own.title && own.description && own.image;
  if (complete || !withDestination || !isbot(userAgent)) return own;

  const destination = await getDestinationMeta(env, link.url);
  return {
    title: own.title ?? destination.title,
    description: own.description ?? destination.description,
    image: own.image ?? destination.image,
  };
};
