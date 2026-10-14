import { TableResult } from '../models/table';
import { Bindings } from '../types/bindings';
import { User } from '../models/user';
import { sendTemplate } from './emailer.service';

export const getAllUsers = async (
  env: Bindings,
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
  return new TableResult(results, offset, limit);
};

export const countUsers = async (env: Bindings): Promise<number> => {
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
  env: Bindings,
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
  env: Bindings,
  users: Array<User>,
  message: any,
  sendAt: string
) => {
  const emailTo = [];
  const mergeVars = [];

  users.forEach((x: User) => {
    emailTo.push({
      email: x.email,
      name: x.name,
      type: 'to',
    });

    mergeVars.push({
      rcpt: x.email,
      vars: [
        { name: 'name', content: x.name },
        { name: 'uid', content: x.guid },
      ],
    });
  });

  const templateContent = [
    {
      name: 'body',
      content: message.description.replace(/(<p><br><\/p>)+/g, ''),
    },
  ];

  await sendTemplate({
    key: env.MANDRILL_KEY,
    message: {
      from_email: message.from_email,
      from_name: message.from_name,
      to: emailTo,
      subject: message.subject,
      preserve_recipients: false,
      merge_vars: mergeVars,
    },
    template_name: 'idm-announcement',
    template_content: templateContent,
    send_at: sendAt,
  });
};

export const bulkEmailer = async (
  env: Bindings,
  users: Array<User>,
  message: any,
  sendAt: string
) => {
  if (users.length > 1000) {
    let i: number;
    for (i = 0; i < users.length; i += 1000) {
      const arrayChunk = users.slice(i, i + 1000);
      await emailSender(env, arrayChunk, message, sendAt);
    }
  } else {
    await emailSender(env, users, message, sendAt);
  }
};
