import { AuthUser } from '../models/auth-user';
import { Bindings } from '../types/bindings';
import { Subscription } from '../models/subscription';

export const getSubscritions = async (env: Bindings, authUser: AuthUser) => {
  const sqlQuery = env.DB.prepare(
    `Select subscription_id, account_id, plan, plan_id, amount, currency, frequency, 
     payment_gateway, payment_gateway_subscr_id as pg_subscr_id, payment_gateway_customer_id as pg_customer_id, status, 
     start_date, last_pay_date, next_pay_date, cancel_date, is_recent 
     From Subscriptions Where account_id = ? 
     Order by subscription_id DESC`
  ).bind(authUser.account_id);
  const result = await sqlQuery.all();
  return result.results.length
    ? (result.results as unknown as Array<Subscription>)
    : null;
};

export const getSubscriptionById = async (
  env: Bindings,
  subscription_id: number,
  authUser: AuthUser
) => {
  const sqlQuery = env.DB.prepare(
    `Select subscription_id, account_id, plan, plan_id, amount, currency, frequency, 
    payment_gateway, payment_gateway_subscr_id as pg_subscr_id, payment_gateway_customer_id as pg_customer_id, status, 
    start_date, last_pay_date, next_pay_date, cancel_date, is_recent 
    From Subscriptions Where subscription_id = ? and account_id = ?`
  ).bind(subscription_id, authUser.account_id);
  return await sqlQuery.first();
};

export const createSubscription = async (
  env: Bindings,
  subscription: Subscription
) => {  
  const sqlQuery = env.DB.prepare(
    `INSERT INTO Subscriptions(
    account_id, plan, plan_id, amount, currency, frequency,
    payment_gateway, payment_gateway_subscr_id, payment_gateway_customer_id, status,
    start_date, last_pay_date, next_pay_date, cancel_date)
    Values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    subscription.account_id,
    subscription.plan,
    subscription.plan_id,
    subscription.amount,
    subscription.currency,
    subscription.frequency,
    subscription.payment_gateway,
    subscription.pg_subscr_id,
    subscription.pg_customer_id,
    subscription.status,
    subscription.start_date,
    subscription.last_pay_date,
    subscription.next_pay_date,
    subscription.cancel_date || null
  );
  const result = await sqlQuery.run();
  return result.meta.last_row_id;
};

export const updateSubscription = async (env: Bindings, subscription: Subscription) => {
  const sqlQuery = env.DB.prepare(
    `UPDATE Subscriptions SET 
     account_id = ?, plan = ?, plan_id = ?, amount = ?,
     currency = ?, frequency = ?, payment_gateway = ?, status = ?,
     start_date = ?, last_pay_date = ?, next_pay_date = ?, cancel_date = ?
     WHERE payment_gateway_subscr_id = ? and payment_gateway_customer_id = ?`
  ).bind(
    subscription.account_id,
    subscription.plan,
    subscription.plan_id,
    subscription.amount,
    subscription.currency,
    subscription.frequency,
    subscription.payment_gateway,   
    subscription.status,
    subscription.start_date || subscription.last_pay_date,
    subscription.last_pay_date,
    subscription.next_pay_date,
    subscription.cancel_date || null,
    subscription.pg_subscr_id,
    subscription.pg_customer_id,
  );

  const { success } = await sqlQuery.run();
  return success;
};

export const cancelSubscription = async (env: Bindings, subscription: Subscription) => { 
  const sqlQuery = env.DB.prepare(
    `UPDATE Subscriptions SET status = ? , cancel_date = ?  
     Where payment_gateway_subscr_id = ? and payment_gateway_customer_id = ?`
  ).bind(
    subscription.status,
    subscription.cancel_date,
    subscription.pg_subscr_id,
    subscription.pg_customer_id
  );
  const { success } = await sqlQuery.run();
  return success;
};

export const cancelRequest = async (env: Bindings, data: Subscription) => {
  const sqlQuery = env.DB.prepare(
    `UPDATE Subscriptions SET status = ? , cancel_date = now(), 
     cancel_reason = ? Where subscription_id = ?`
  ).bind(data.status, data.cancel_reason, data.subscription_id);

  const { success } = await sqlQuery.run();
  return success;
};

export const getSubscriptionByCustomerId = async (
  env: Bindings,
  customer_id: string
) => {
  const sqlQuery = env.DB.prepare(
    `SELECT subscription_id, account_id, user_id, plan, amount, currency, 
     frequency, start_date, next_pay_date, payment_gateway_subscr_id as pg_subscr_id
     FROM Subscriptions where payment_gateway_customer_id = ? 
     Order by subscription_id DESC LIMIT 1`
  ).bind(customer_id);
  return await sqlQuery.first();
};
