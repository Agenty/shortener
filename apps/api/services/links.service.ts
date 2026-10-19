import { Link } from '../models/link';
import { AuthUser } from '../models/auth-user';
import { customAlphabet } from 'nanoid';
import { HTTPException } from 'hono/http-exception';
import { slugify, toISOformat } from '../helper/utility';
import { PlanType } from '../models/plan';
import { Paged } from '../models/paged';
import { isEmpty } from 'lodash';
import { format, subMonths } from 'date-fns';
import { assertVerifiedDestinations } from './domain.service';

/** Host of every short link, kept separate from the main site domain */
export const SHORT_DOMAIN = 'srt1.link';

const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
);

export const convertToLink = (item: any): Link | undefined => {
  if (!item) return;

  const d =
    item.data && typeof item.data == 'string'
      ? JSON.parse(item.data)
      : item.data;
  delete item.data;
  return {
    ...item,
    ...d,
    short_url: `https://${SHORT_DOMAIN}/${item.key}`,
    is_enabled: item.is_enabled === undefined ? undefined : !!item.is_enabled,
    created_at: toISOformat(item.created_at) || new Date(),
    updated_at: toISOformat(item.updated_at),
    expire_at: toISOformat(item.expire_at),
  };
};

// Every URL a short link can redirect to
const getDestinations = (link: Link) => [
  link.url,
  link.ios,
  link.android,
  ...(link.geo || []).map((x) => x.url),
];

export const getLinks = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  paged: Paged
): Promise<Array<Link>> => {
  let sqlQuery: D1PreparedStatement;
  if (!isEmpty(paged.search)) {
    const search = paged.search.includes(`${SHORT_DOMAIN}/`)
      ? paged.search.split('/').pop()
      : paged.search.split('?')[0];
    sqlQuery = env.DB.prepare(
      `
        SELECT key, project_id, user_id, url, expire_at, data, is_enabled, created_at, updated_at
        FROM Links
        Where account_id = ?
        and (key = ? or url like ?)
        Order by created_at DESC
        LIMIT ?, ?`
    ).bind(
      authUser.account_id,
      search,
      `%${search}%`,
      paged.offset,
      paged.limit
    );
  } else {
    sqlQuery = env.DB.prepare(
      `
        SELECT key, project_id, user_id, url, expire_at, data, is_enabled, created_at, updated_at
        FROM Links
        Where account_id = ?
        Order by created_at DESC
        LIMIT ?, ?`
    ).bind(authUser.account_id, paged.offset, paged.limit);
  }

  const { results } = await sqlQuery.all();
  return results.map(convertToLink);
};

export const getLinkByKey = async (
  env: CloudflareBindings,
  key: string,
  authUser: AuthUser
): Promise<Link> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT key, account_id, user_id, project_id, url, expire_at, data, is_enabled, created_at, updated_at
      FROM Links
      WHERE key = ? and account_id = ? and type = 'link'`
  ).bind(key, authUser.account_id);

  const link = await sqlQuery.first();
  return convertToLink(link);
};

export const createLink = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  link: Link
): Promise<Link> => {
  await assertVerifiedDestinations(env, authUser, getDestinations(link));

  link.key = link.key ? slugify(link.key) : nanoid(7).toLowerCase();
  link.account_id = authUser.account_id;
  link.user_id = authUser.user_id;
  link.is_enabled = link.is_enabled ?? true;
  link.created_at = new Date().toISOString();
  const data = {
    params: link.params,
    title: link.title,
    description: link.description,
    image: link.image,
    password: link.password,
    ios: link.ios,
    android: link.android,
    geo: link.geo,
  };
  try {
    await env.DB.prepare(
      `
      INSERT INTO Links (key, account_id, user_id, project_id, url, expire_at, data, is_enabled, type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'link')`
    )
      .bind(
        link.key,
        link.account_id,
        link.user_id,
        link.project_id || null,
        link.url,
        link.expire_at || null,
        data ? JSON.stringify(data) : null,
        link.is_enabled ? 1 : 0
      )
      .run();
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: Links.key')) {
      throw new HTTPException(400, {
        message: `This key '${link.key}' has already been used, enter a new key(short url) or leave it blank to auto-generate`,
      });
    } else {
      throw err;
    }
  }
  return convertToLink(link);
};

export const updateLink = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  key: string,
  link: Link
): Promise<Link> => {
  await assertVerifiedDestinations(env, authUser, getDestinations(link));

  link.key = key;
  link.account_id = authUser.account_id;
  link.user_id = authUser.user_id;
  link.updated_at = new Date().toISOString();
  const data = {
    params: link.params,
    title: link.title,
    description: link.description,
    image: link.image,
    password: link.password,
    ios: link.ios,
    android: link.android,
    geo: link.geo,
  };

  const { meta } = await env.DB.prepare(
    `
      UPDATE Links
      SET user_id = ?, project_id = ?, url = ?, expire_at = ?, data = ?,
        is_enabled = COALESCE(?, is_enabled), updated_at = CURRENT_TIMESTAMP
      WHERE key = ? and account_id = ?`
  )
    .bind(
      link.user_id,
      link.project_id || null,
      link.url,
      link.expire_at || null,
      JSON.stringify(data),
      link.is_enabled === undefined ? null : link.is_enabled ? 1 : 0,
      link.key,
      link.account_id
    )
    .run();

  return meta.changes > 0 ? convertToLink(link) : null;
};

export const deleteLink = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  key: string
): Promise<boolean> => {
  const { meta } = await env.DB.prepare(
    `
      DELETE FROM Links
      WHERE key = ? and account_id = ?`
  )
    .bind(key, authUser.account_id)
    .run();
  return meta.changes > 0;
};

/** Seconds a link stays cached in KV for redirects (KV minimum TTL is 60) */
const LINK_CACHE_TTL = 60;

/** Public lookup of a short link for redirect, cached in KV for a minute */
export const getLinkForRedirect = async (
  env: CloudflareBindings,
  key: string
): Promise<Link | undefined> => {
  const cached = await env.LINKS.get<Link>(key, 'json');
  if (cached) return cached;

  const row = await env.DB.prepare(
    `
      SELECT key, url, expire_at, data, is_enabled
      FROM Links
      WHERE key = ? and type = 'link'`
  )
    .bind(key)
    .first();
  const link = convertToLink(row);
  if (link) {
    await env.LINKS.put(key, JSON.stringify(link), {
      expirationTtl: LINK_CACHE_TTL,
    });
  }
  return link;
};

/** Destination for a visitor, honoring app deep links, geo-targeting and UTM params */
export const getRedirectUrl = (
  link: Link,
  userAgent = '',
  country?: string
): string => {
  let destination = link.url;
  if (link.ios && /iPhone|iPad|iPod/i.test(userAgent)) {
    destination = link.ios;
  } else if (link.android && /Android/i.test(userAgent)) {
    destination = link.android;
  } else if (country) {
    const geo = (link.geo || []).find(
      (x) => x.country?.toUpperCase() === country.toUpperCase()
    );
    if (geo) destination = geo.url;
  }

  const url = new URL(destination);
  for (const [name, value] of Object.entries(link.params || {})) {
    url.searchParams.set(name, value);
  }
  return url.toString();
};

export const getLinkCount = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  countAll = false
) => {
  let sqlQuery: D1PreparedStatement;
  if (authUser.plan == PlanType.Free || countAll) {
    sqlQuery = env.DB.prepare(
      `Select count(1) as total from Links Where account_id = ? and type = 'link'`
    ).bind(authUser.account_id);
  } else {
    sqlQuery = env.DB.prepare(
      `Select count(1) as total from Links Where account_id = ? and type = 'link' and created_at >= date(?)`
    ).bind(
      authUser.account_id,
      format(subMonths(new Date(), 1), 'yyyy-MM-dd')
    );
  }
  const { total } = await sqlQuery.first();
  return Number(total);
};