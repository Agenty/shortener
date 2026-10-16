import { TableResult, toTableResult } from '../models/table';
import { User } from '../models/user';
import { sendEmail } from './emailer.service';
import { announcementEmailHtml } from '../emails/announcement-email';

export const getAllUsers = async (
  env: CloudflareBindings,
  offset: number = 0,
  limit: number = 100
): Promise<TableResult> => {
  const sqlQuery = env.DB.prepare(
    `
        SELECT user_id, account_id, name, email, role, status, last_login_at, is_verified, ip_address, created_at, updated_at
        FROM Users
        Order by user_id DESC
        LIMIT ?, ?`
  ).bind(offset, limit);

  const { results } = await sqlQuery.all();
  return toTableResult(results, offset, limit);
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

const emailSender = async (
  env: CloudflareBindings,
  user: User,
  message: any
) => {
  const unsubscribeUrl = `${env.APP_URL}/unsubscribe?email=${encodeURIComponent(
    user.email
  )}&uid=${user.guid}`;

  await sendEmail(env, {
    from: { email: message.from_email, name: message.from_name },
    to: { email: user.email, name: user.name },
    subject: message.subject,
    headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
    html: await announcementEmailHtml({
      name: user.name,
      subject: message.subject,
      body: message.description.replace(/(<p><br><\/p>)+/g, ''),
      unsubscribeUrl,
    }),
  });
};

export const bulkEmailer = async (
  env: CloudflareBindings,
  users: Array<User>,
  message: any
) => {
  // Each recipient gets a personalized email; send in small batches
  for (let i = 0; i < users.length; i += 10) {
    const chunk = users.slice(i, i + 10);
    await Promise.allSettled(chunk.map((user) => emailSender(env, user, message)));
  }
};
