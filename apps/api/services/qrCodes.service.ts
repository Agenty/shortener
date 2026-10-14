import { nanoid } from 'nanoid';
import { AuthUser } from '../models/auth-user';
import { QRCode } from '../models/qrCode';
import { TableResult } from '../models/table';
import { Bindings } from '../types/bindings';

const convertToQrCode = (item: any): QRCode => {
  return {
    ...item,
    data: item.data ? JSON.parse(item.data) : {},
    created_at: item.created_at || new Date(),
  };
};

export const getQRCodes = async (
  env: Bindings,
  authUser: AuthUser,
  offset: number = 0,
  limit: number = 1000
): Promise<TableResult> => {
  const sqlQuery = env.DB.prepare(
    `
        SELECT key, account_id, user_id, project_id, name, short_url, data, created_at, updated_at
        FROM Links
        WHERE account_id = ? and type = 'qr'
        LIMIT ?, ?`
  ).bind(authUser.account_id, offset, limit);

  const { results } = await sqlQuery.all();
  return new TableResult(results.map(convertToQrCode), offset, limit);
};

export const getQRCodeById = async (
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
  return convertToQrCode(result);
};

export const createQRCode = async (
  env: Bindings,
  authUser: AuthUser,
  data: QRCode
): Promise<any> => {
  data.key = nanoid(7).toLowerCase();
  data.short_url = `https://idm.in/${data.key}`;

  const { meta } = await env.DB.prepare(
    `
        INSERT INTO Links (key, account_id, user_id, project_id, name, data, short_url, type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'qr')`
  )
    .bind(
      data.key,
      authUser.account_id,
      authUser.user_id,
      data.project_id || null,
      data.name,
      data.data ? JSON.stringify(data.data) : null,
      data.short_url
    )
    .run();

  data.created_at = new Date();
  return data;
};

export const updateQRCode = async (
  env: Bindings,
  authUser: AuthUser,
  key: string,
  data: QRCode
): Promise<boolean> => {
  const { success } = await env.DB.prepare(
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
  return success;
};

export const deleteQRCode = async (
  env: Bindings,
  authUser: AuthUser,
  keys: Array<string>
): Promise<boolean> => {
  const stmt = env.DB.prepare(
    `
        DELETE FROM Links 
        WHERE key = ? and account_id = ? and type = 'qr'`
  );

  const result = await env.DB.batch(
    keys.map((id) => stmt.bind(id, authUser.account_id))
  );
  return result.every((x) => x.success == true);
};

export const getQRCodeCount = async (env: Bindings, authUser: AuthUser) => {
  const sqlQuery = env.DB.prepare(
    `SELECT count(1) as total FROM Links WHERE account_id = ? and type = 'qr'`
  ).bind(authUser.account_id);

  const { total } = await sqlQuery.first();
  return Number(total);
};
