import { Link } from '../models/link';
import { AuthUser } from '../models/auth-user';
import { customAlphabet } from 'nanoid';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types/bindings';
import { cleanUri, slugify, toISOformat } from '../helper/utility';
import { PlanType } from '../models/plan';
import { Paged } from '../models/paged';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import { LinkType } from '../models/baselink';
import whitelistDomains from '../data/whitelist.json';
import { getDomain } from 'tldts';

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
    created_at: toISOformat(item.created_at) || new Date(),
    updated_at: toISOformat(item.updated_at),
    expire_at: toISOformat(item.expire_at),
  };
};

// For trial purpose on home page, auto expire after 24 hours
export const createTryLink = async (env: Bindings, link: Link) => {
  let key = `t_${nanoid(7)}`.toLowerCase();
  let exists = await env.LINKS.get(key);
  while (exists) {
    key = `t_${nanoid(7)}`.toLowerCase();
    exists = await env.LINKS.get(key);
  }
  link.type = LinkType.link;
  await env.LINKS.put(key, JSON.stringify(link), {
    expirationTtl: 60 * 60 * 24 * 180,
  });
  return { ...link, key: key, short_url: `https://idm.in/${key}` };
};

export const isTrustPilotListed = async (domain: string) => {
  const myHeaders = new Headers();
  myHeaders.append('apikey', 'nZkt0UMZP2MeF99AOcviMZDmIfiI2L0x');
  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
    cf: {
      cacheEverything: true,
      cacheTtl: 7200, // Cache the response for 2 hours (in seconds)
    },
  };

  const r = await fetch(
    `https://api.trustpilot.com/v1/business-signup/domain-availability?domain=${domain}`,
    requestOptions
  );

  const json: any = await r.json();
  if (r.ok) {
    return json.domainIsAvailable == false ? true : false;
  }
};

export const isWhiteListed = async (env: Bindings, url: string) => {
  const domain = new URL(url).hostname;
  const staticWhitelist = whitelistDomains.includes(domain);
  if (staticWhitelist) return true;

  const sqlQuery = env.DB.prepare(
    `SELECT id FROM Whitelist WHERE url = ? or url = ? or url = ?`
  ).bind(cleanUri(url), domain, domain.replace('www.',''));
  const result = await sqlQuery.first();
  const dbWhitelist = result && result.id ? true : false;
  if (dbWhitelist) return true;

  // Check on Trustpilot API
  const tldDomain = getDomain(url);
  const isTrusted = await isTrustPilotListed(tldDomain);
  if (isTrusted) {
    await env.DB.prepare(`INSERT OR IGNORE INTO Whitelist(url) Values(?)`)
      .bind(tldDomain)
      .run();
    return true;
  }

  throw new HTTPException(402, {
    message: `The free plan is limited to white-listed domains only. Example: linkedin, facebook, youtube, shopify etc. Contact support to whitelist your domain or upgrade your plan`,
  });
};

export const getLinks = async (
  env: Bindings,
  authUser: AuthUser,
  paged: Paged
): Promise<Array<Link>> => {
  let sqlQuery: D1PreparedStatement;
  const domains = ['idm.in/', 'idm.li/'];
  if (!isEmpty(paged.search)) {
    const search = domains.some((x) => paged.search.includes(x))
      ? paged.search.split('/').pop()
      : paged.search.split('?')[0];
    sqlQuery = env.DB.prepare(
      `
        SELECT key, project_id, user_id, url, short_url, expire_at, data, status, created_at, updated_at
        FROM Links
        Where account_id = ?
        and type = 'link'
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
        SELECT key, project_id, user_id, url, short_url, expire_at, data, status, created_at, updated_at
        FROM Links
        Where account_id = ?
        and type = 'link'
        Order by created_at DESC
        LIMIT ?, ?`
    ).bind(authUser.account_id, paged.offset, paged.limit);
  }

  const { results } = await sqlQuery.all();
  return results.map(convertToLink);
};

export const getLinkByKey = async (
  env: Bindings,
  key: string,
  authUser: AuthUser
): Promise<Link> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT key, account_id, user_id, project_id, url, short_url, expire_at, data, created_at, updated_at
      FROM Links
      WHERE key = ? and account_id = ? and type = 'link'`
  ).bind(key, authUser.account_id);

  const link = await sqlQuery.first();
  return convertToLink(link);
};

export const createLink = async (
  env: Bindings,
  authUser: AuthUser,
  link: Link
): Promise<Link> => {
  // Check domain whitelist
  await isWhiteListed(env, link.url);

  link.key = link.key ? slugify(link.key) : nanoid(7).toLowerCase();
  link.account_id = authUser.account_id;
  link.user_id = authUser.user_id;
  link.short_url = `https://idm.in/${link.key}`;
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
      INSERT INTO Links (key, account_id, user_id, project_id, url, short_url, expire_at, data, type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'link')`
    )
      .bind(
        link.key,
        link.account_id,
        link.user_id,
        link.project_id || null,
        link.url,
        link.short_url,
        link.expire_at || null,
        data ? JSON.stringify(data) : null
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
  return link;
};

export const updateLink = async (
  env: Bindings,
  authUser: AuthUser,
  key: string,
  link: Link
): Promise<Link> => {
  // Scan with Google safe browsing API
  if (authUser.plan == PlanType.Free) {
    await isWhiteListed(env, link.url);
  }

  link.key = key;
  link.short_url = `https://idm.in/${link.key}`;
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

  const { success } = await env.DB.prepare(
    `
      UPDATE Links 
      SET user_id = ?, project_id = ?, url = ?, expire_at = ?, data = ?, updated_at = CURRENT_TIMESTAMP
      WHERE key = ? and account_id = ?`
  )
    .bind(
      link.user_id,
      link.project_id || null,
      link.url,
      link.expire_at || null,
      JSON.stringify(data),
      link.key,
      link.account_id
    )
    .run();

  if (!success) {
    const res = new Response(`No link found with key: ${link.key}`, {
      status: 404,
    });
    throw new HTTPException(404, { res });
  }
  return link;
};

export const deleteLink = async (
  env: Bindings,
  authUser: AuthUser,
  key: string
): Promise<boolean> => {
  const { success } = await env.DB.prepare(
    `
      DELETE FROM Links 
      WHERE key = ? and account_id = ?`
  )
    .bind(key, authUser.account_id)
    .run();
  if (success) {
    await env.LINKS.delete(key);
  }
  return success;
};

export const blockLink = async (env: Bindings, link: Link) => {
  await Promise.all([
    env.DB.prepare(`Update Links set status = 'blocked' WHERE key = ?`)
      .bind(link.key)
      .run(),
    env.LINKS.delete(link.key),
  ]);
};

export const getLinkCount = async (
  env: Bindings,
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
      dayjs().subtract(1, 'month').format('YYYY-MM-DD')
    );
  }
  const { total } = await sqlQuery.first();
  return Number(total);
};

const convertToILink = (item: any): Link | undefined => {
  if (!item) return;
  if (item.type == LinkType.link) {
    const d =
      item.data && typeof item.data == 'string'
        ? JSON.parse(item.data)
        : item.data;
    delete item.data;
    return {
      ...item,
      ...d,
      created_at: toISOformat(item.created_at) || new Date(),
      updated_at: toISOformat(item.updated_at),
      expire_at: toISOformat(item.expire_at),
    };
  } else {
    return {
      ...item,
      data:
        item.data && typeof item.data == 'string'
          ? JSON.parse(item.data)
          : item.data,
      created_at: toISOformat(item.created_at) || new Date(),
      updated_at: toISOformat(item.updated_at),
      expire_at: toISOformat(item.expire_at),
    };
  }
};

export const getCachedLink = async (
  env: Bindings,
  key: string,
  cacheTtl = 300
): Promise<Link> => {
  let link: Link;
  if (cacheTtl) {
    const value = await env.LINKS.get(key, {
      type: 'json',
    });
    link = convertToILink(value);
  }
  // Get from D1
  if (!link || !link.type) {
    const sqlQuery = env.DB.prepare(
      `
        SELECT key, account_id, user_id, project_id, url, short_url, name, type, expire_at, data, status, created_at, updated_at
        FROM Links
        WHERE key = ?`
    ).bind(key);

    const value = await sqlQuery.first();
    link = convertToILink(value);

    // Cache for 5 min
    if (link && cacheTtl) {
      await env.LINKS.put(key, JSON.stringify(link), {
        expirationTtl: cacheTtl < 60 ? 60 : cacheTtl,
      });
    }
  }
  if (link) {
    link.key = link.key || key;
  }
  return link;
};
