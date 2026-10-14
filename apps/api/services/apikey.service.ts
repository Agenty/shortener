import { User } from '../models/user';
import { AuthUser } from '../models/auth-user';
import { TableResult } from '../models/table';
import { ApiKey } from '../models/api-key';
import dayjs from 'dayjs';
import { Bindings } from '../types/bindings';
import { sign } from 'hono/jwt';

export const getApiKeys = async (
  env: Bindings,
  authUser: AuthUser,
  offset: number = 0,
  limit: number = 25
): Promise<TableResult> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT key_id, user_id, account_id, name, is_enabled, created_at, updated_at
      FROM ApiKeys
      WHERE account_id = ? and user_id = ?
      LIMIT ?, ?`
  ).bind(authUser.account_id, authUser.user_id, offset, limit);

  const { results } = await sqlQuery.all();
  return new TableResult(results, offset, limit);
};

export const getApiKey = async (
  env: Bindings,
  authUser: AuthUser,
  key_id: number
): Promise<User> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT key_id, user_id, account_id, name, is_enabled, created_at, updated_at
      FROM ApiKeys
      WHERE key_id = ? and user_id = ?`
  ).bind(key_id, authUser.user_id);

  return await sqlQuery.first();
};

export const createApiKey = async (
  env: Bindings,
  authUser: AuthUser,
  data: ApiKey
): Promise<ApiKey> => {
  const result = await env.DB.prepare(
    `
      INSERT INTO ApiKeys (account_id, user_id, name, is_enabled) 
      VALUES (?, ?, ?, ?)`
  )
    .bind(authUser.account_id, authUser.user_id, data.name, data.is_enabled)
    .run();
  data.key_id = result.meta.last_row_id;
  data.created_at = new Date();

  // Create api key
  data.key = await sign(
    {
      key_id: data.key_id,
      exp: dayjs().add(100, 'year').unix(),
    },
    env.JWT_SECRET
  );
  return data;
};

export const updateApiKey = async (
  env: Bindings,
  authUser: AuthUser,
  key_id: number,
  data: ApiKey
): Promise<boolean> => {
  const { success } = await env.DB.prepare(
    `
      UPDATE ApiKeys 
      SET name = ?, is_enabled = ?
      WHERE key_id = ? AND user_id = ?`
  )
    .bind(data.name, data.is_enabled, key_id, authUser.user_id)
    .run();
  return success;
};

export const deleteApiKey = async (
  env: Bindings,
  authUser: AuthUser,
  key_ids: Array<number>
): Promise<boolean> => {
  const stmt = env.DB.prepare(
    `
      DELETE FROM ApiKeys 
      WHERE key_id = ? AND user_id = ?`
  );

  const result = await env.DB.batch(
    key_ids.map((id) => stmt.bind(id, authUser.user_id))
  );
  return result.every((x) => x.meta.changes > 0);
};
