import { nanoid } from 'nanoid';
import { AuthUser } from '../models/auth-user';
import { QRCode } from '../models/qrCode';
import { TableResult } from '../models/table';
import { Bindings } from '../types/bindings';
import { Page } from '../models/page';
import { HTTPException } from 'hono/http-exception';
import { slugify } from '../helper/utility';

const convertToPage = (item: any): Page => {
  return {
    ...item,
    data: item.data ? JSON.parse(item.data) : {},
    created_at: item.created_at || new Date(),
  };
};

export const getPages = async (
  env: Bindings,
  authUser: AuthUser,
  offset: number = 0,
  limit: number = 1000
): Promise<TableResult> => {
  const sqlQuery = env.DB.prepare(
    `
        SELECT key, account_id, user_id, project_id, name, short_url, data, created_at, updated_at
        FROM Links
        WHERE account_id = ? and type = 'page'
        LIMIT ?, ?`
  ).bind(authUser.account_id, offset, limit);

  const { results } = await sqlQuery.all();
  return new TableResult(results.map(convertToPage), offset, limit);
};

export const getPageById = async (
  env: Bindings,
  authUser: AuthUser,
  key: string
): Promise<QRCode> => {
  const sqlQuery = env.DB.prepare(
    `
        SELECT key, account_id, user_id, project_id, name, short_url, data, created_at, updated_at
        FROM Links
        WHERE account_id = ? AND key = ?`
  ).bind(authUser.account_id, key);

  const result = await sqlQuery.first();
  return convertToPage(result);
};

export const createPage = async (
  env: Bindings,
  authUser: AuthUser,
  data: Page
): Promise<any> => {
  data.key = data.key ? slugify(data.key) : nanoid(7).toLowerCase();
  data.short_url = `https://idm.in/${data.key}`;
  try {
    await env.DB.prepare(
      `
        INSERT INTO Links (key, account_id, user_id, project_id, name, data, short_url, type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'page')`
    )
      .bind(
        data.key,
        authUser.account_id,
        authUser.user_id,
        data.project_id || null,
        data.name || null,
        data.data ? JSON.stringify(data.data) : null,
        data.short_url
      )
      .run();
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed: Links.key')) {
      throw new HTTPException(400, {
        message: `This link '/${data.key}' has already been used, enter a new link or leave it blank to auto-generate`,
      });
    } else {
      throw err;
    }
  }

  data.created_at = new Date();
  return data;
};

export const updatePage = async (
  env: Bindings,
  authUser: AuthUser,
  key: string,
  data: Page
): Promise<boolean> => {
  const { meta } = await env.DB.prepare(
    `
        UPDATE Links 
        SET project_id = ?, name = ?, data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE account_id = ? AND key = ?`
  )
    .bind(
      data.project_id || null,
      data.name,
      data.data ? JSON.stringify(data.data) : null,
      authUser.account_id,
      key
    )
    .run();
  data.updated_at = new Date();
  return meta.changes > 0;
};

export const deletePage = async (
  env: Bindings,
  authUser: AuthUser,
  keys: Array<string>
): Promise<boolean> => {
  const stmt = env.DB.prepare(
    `
        DELETE FROM Links 
        WHERE key = ? and account_id = ? and type = 'page'`
  );

  const result = await env.DB.batch(
    keys.map((id) => stmt.bind(id, authUser.account_id))
  );
  return result.every((x) => x.success == true);
};

export const getPageCount = async (env: Bindings, authUser: AuthUser) => {
  const sqlQuery = env.DB.prepare(
    `SELECT count(1) as total FROM Links WHERE account_id = ? and type = 'page'`
  ).bind(authUser.account_id);

  const { total } = await sqlQuery.first();
  return Number(total);
};
