import { Account } from '../models/account';
import { AuthUser, UserStatus } from '../models/auth-user';
import { addDays } from 'date-fns';
import { PlanType } from '../models/plan';
import { Subscription } from '../models/subscription';

export const getAccount = async (
  env: CloudflareBindings,
  account_id: number
): Promise<Account> => {
  const sqlQuery = env.DB.prepare(
    `SELECT account_id, company_name, status, plan, website, country, billing_name, 
     billing_address, tax_name, tax_number FROM Accounts where account_id = ?`
  ).bind(Number(account_id));

  const response = await sqlQuery.first();
  return response ? (response as Account) : {};
};

export const createAccount = async (
  env: CloudflareBindings,
  authUser: AuthUser
): Promise<number> => {
  const response = await env.DB.prepare(
    `INSERT INTO Accounts (company_name, status, plan, billing_name, trial_end_at, country) values (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      authUser.name,
      UserStatus.active,
      PlanType.Free,
      authUser.name,
      addDays(new Date(), 14).toISOString(),
      authUser.country || null
    )
    .run();

  return response.success ? response.meta.last_row_id : null;
};

export const updateAccount = async (
  env: CloudflareBindings,
  account_id: number,
  data: Account
): Promise<boolean> => {
  const response = await env.DB.prepare(
    `UPDATE Accounts SET company_name = ?, website = ?, country = ?,
        billing_name = ?, billing_address = ?, tax_name = ?, tax_number = ?
        WHERE account_id = ?`
  )
    .bind(
      data.company_name,
      data.website,
      data.country,
      data.billing_name,
      data.billing_address,
      data.tax_name,
      data.tax_number,
      account_id
    )
    .run();
  return response.success ? true : false;
};

export const deleteAccount = async (
  env: CloudflareBindings,
  account_id: number
): Promise<boolean> => {
  const response = await env.DB.prepare(
    `DELETE from Accounts where account_id = ?`
  )
    .bind(Number(account_id))
    .run();

  return response.success ? true : false;
};

export const refreshAccountLimit = async (
  env: CloudflareBindings,
  subscription: Subscription
): Promise<boolean> => {
  subscription.plan = subscription.plan || PlanType.Free
  const sqlQuery = env.DB.prepare(
    `Update Accounts set plan = ?, status = ? Where account_id = ?`
  ).bind(subscription.plan, subscription.status, subscription.account_id);
  const { success } = await sqlQuery.run();
  return success;
};
