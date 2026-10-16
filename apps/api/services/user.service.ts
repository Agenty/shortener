import { User } from '../models/user';
import { AuthUser, UserStatus } from '../models/auth-user';
import { TableResult, toTableResult } from '../models/table';
import { nanoid } from 'nanoid';
import { hashPassword } from '../helper/utility';
import { HTTPException } from 'hono/http-exception';

export const getUsers = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  offset: number = 0,
  limit: number = 1000
): Promise<TableResult> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT user_id, account_id, name, email, role, status, last_login_at, is_verified, created_at, updated_at
      FROM Users
      WHERE account_id = ?
      LIMIT ?, ?`
  ).bind(authUser.account_id, offset, limit);

  const { results } = await sqlQuery.all();
  return toTableResult(results, offset, limit);
};

export const getUserById = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  user_id: number
): Promise<User> => {
  const sqlQuery = env.DB.prepare(
    `
      SELECT user_id, account_id, name, email, role, status, last_login_at, is_verified, created_at, updated_at
      FROM Users
      WHERE account_id = ? AND user_id = ?`
  ).bind(authUser.account_id, user_id);

  return await sqlQuery.first();
};

export const createUser = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  data: User
): Promise<any> => {
  const password = nanoid(10);
  const passwordHash = await hashPassword(password);
  const { meta } = await env.DB.prepare(
    `
      INSERT OR IGNORE INTO Users (account_id, name, email, password, role, status, guid) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      authUser.account_id,
      data.name,
      data.email,
      passwordHash,
      data.role,
      data.status || UserStatus.active,
      nanoid(32)
    )
    .run();
  if (!meta.last_row_id) {
    throw new HTTPException(402, {
      message: `A user with this email already exists with different account, please delete that to add under your account`,
    });
  }
  data.user_id = meta.last_row_id;
  data.created_at = new Date();
  return { ...data, password: password };
};

export const updateUser = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  user_id: number,
  data: User
): Promise<boolean> => {
  const { meta } = await env.DB.prepare(
    `
      UPDATE Users 
      SET name = ?, email = ?, role = ?, status = ?
      WHERE account_id = ? AND user_id = ?`
  )
    .bind(
      data.name,
      data.email,
      data.role,
      data.status,
      authUser.account_id,
      user_id
    )
    .run();
  return meta.changes > 0;
};

export const deleteUser = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  user_ids: Array<number>
): Promise<boolean> => {
  const stmt = env.DB.prepare(
    `
      DELETE FROM Users 
      WHERE user_id = ? and account_id = ?`
  );

  const result = await env.DB.batch(
    user_ids.map((id) => stmt.bind(id, authUser.account_id))
  );
  return result.every((x) => x.meta.changes > 0);
};

export const getUserCount = async (env: CloudflareBindings, authUser: AuthUser) => {
  const sqlQuery = env.DB.prepare(
    `Select count(1) as total from Users Where account_id = ?`
  ).bind(authUser.account_id);

  const { total } = await sqlQuery.first();
  return Number(total);
};
