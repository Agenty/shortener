import { Context } from 'hono';
import { AuthUser } from '../models/auth-user';
import { auth } from '../controllers/auth.controller';
import { User } from '../models/user';

export const getProfile = async (
  ctx: Context,
  authUser: AuthUser
): Promise<AuthUser> => {
  const sqlQuery = ctx.env.DB.prepare(
    `SELECT user_id, account_id, name, email, role, status, 
     last_login_at, is_verified, created_at, updated_at
     FROM Users
     WHERE account_id = ? AND user_id = ?`
  ).bind(authUser.account_id, authUser.user_id);
  return await sqlQuery.first();
};

export const updateProfile = async (
  ctx: Context,
  authUser: AuthUser,
  data: User
): Promise<boolean> => {
  const { success } = await ctx.env.DB.prepare(
    `UPDATE Users SET name = ?, is_subscribed = ?, avatar = ? 
         WHERE user_id = ? AND account_id = ?`
  )
    .bind(
      data.name,
      data.is_subscribed,
      data.avatar || null,
      authUser.user_id,
      authUser.account_id
    )
    .run();

  return success;
};
