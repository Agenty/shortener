import { TableResult, toTableResult } from '../models/table';
import { User } from '../models/user';
import { convertToLink } from './links.service';

/** Newest users first, `search` matches part of the name or email */
export const getAllUsers = async (
  env: CloudflareBindings,
  offset: number = 0,
  limit: number = 100,
  search?: string
): Promise<TableResult> => {
  const where = search ? 'Where name like ? or email like ?' : '';
  const binds = search ? [`%${search}%`, `%${search}%`] : [];
  const sqlQuery = env.DB.prepare(
    `
        SELECT user_id, account_id, name, email, role, status, last_login_at, is_verified, ip_address, created_at, updated_at
        FROM Users
        ${where}
        Order by user_id DESC
        LIMIT ?, ?`
  ).bind(...binds, offset, limit);

  const { results } = await sqlQuery.all();
  return toTableResult(results, offset, limit);
};

/** A short link from any account, with the name and email of the user who created it */
export const getLinkWithOwner = async (env: CloudflareBindings, key: string) => {
  const row = await env.DB.prepare(
    `
        SELECT l.key, l.account_id, l.user_id, l.project_id, l.url, l.expire_at, l.title, l.password,
          l.is_enabled, l.created_at, l.updated_at, u.name as owner_name, u.email as owner_email
        FROM Links as l
        LEFT JOIN Users as u on u.user_id = l.user_id
        WHERE l.key = ?`
  )
    .bind(key.toLowerCase())
    .first();
  if (!row) return null;
  return {
    ...convertToLink(row),
    // Staff only need to know a password exists, not what it is
    password: undefined,
    has_password: !!row.password,
    owner_name: row.owner_name,
    owner_email: row.owner_email,
  };
};

/** Turns a link on or off for every visitor, and drops the redirect cache so it applies at once */
export const setLinkEnabled = async (env: CloudflareBindings, key: string, enabled: boolean) => {
  const { meta } = await env.DB.prepare(
    `UPDATE Links SET is_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?`
  )
    .bind(enabled ? 1 : 0, key.toLowerCase())
    .run();
  if (meta.changes > 0) await env.LINKS.delete(key.toLowerCase());
  return meta.changes > 0;
};

export const countUsers = async (env: CloudflareBindings): Promise<number> => {
  const sqlQuery = env.DB.prepare(
    `
        SELECT count(user_id) as total
        FROM Users
        Where is_verified = 1 and is_subscribed = 1`
  );

  const { total } = await sqlQuery.first();
  return Number(total);
};

export const getEmails = async (
  env: CloudflareBindings,
  offset = 0,
  limit = 2500
): Promise<Array<User>> => {
  const sqlQuery = env.DB.prepare(
    `
        SELECT user_id, account_id, name, email, guid
        FROM Users
        Where is_verified = 1 and is_subscribed = 1
        Order by user_id DESC
        LIMIT ?, ?`
  ).bind(offset, limit);

  const { results } = await sqlQuery.all();
  return results as unknown as Array<User>;
};
