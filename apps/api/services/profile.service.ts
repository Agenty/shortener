import { AuthUser } from '../models/auth-user';
import { Profile } from '../models/profile';

export const getProfile = async (
  env: CloudflareBindings,
  authUser: AuthUser
): Promise<AuthUser> => {
  const sqlQuery = env.DB.prepare(
    `SELECT user_id, account_id, name, email, role, status, 
     last_login_at, is_verified, created_at, updated_at
     FROM Users
     WHERE account_id = ? AND user_id = ?`
  ).bind(authUser.account_id, authUser.user_id);
  return await sqlQuery.first();
};

export const updateProfile = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  data: Profile
): Promise<boolean> => {
  const { success } = await env.DB.prepare(
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
