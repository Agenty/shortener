import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { accountSchema } from '../models/account';
import {
  deleteAccount,
  getAccount,
  updateAccount,
} from '../services/account.service';
import { AuthUser } from '../models/auth-user';
import { jsonValidator } from '../helper/validator';

const accounts = new Hono<{ Bindings: CloudflareBindings }>();

accounts.get('/', async (c) => {
  const authUser: AuthUser = c.req['user'];
  const result = await getAccount(c.env, authUser.account_id);
  if (!result) {
    throw new HTTPException(403, {
      message: `No account found with id: ${authUser.account_id}, or you don't have permission to view this account.`,
    });
  }
  return c.json({ ...result }, 200);
});

accounts.put('/', jsonValidator(accountSchema), async (c) => {
  const data = c.req.valid('json');
  const authUser: AuthUser = c.req['user'];

  const response = await updateAccount(c.env, authUser.account_id, data);
  if (!response) {
    throw new HTTPException(403, {
      message: `No account found with id: ${authUser.account_id}, or you don't have permission to update this account`,
    });
  }
  return c.json({ ...data, account_id: authUser.account_id }, 200);
});

accounts.delete('/', async (c) => {
  const authUser: AuthUser = c.req['user'];

  const response = await deleteAccount(c.env, authUser.account_id);
  if (!response) {
    throw new HTTPException(403, {
      message: `No account found with id: ${authUser.account_id}, or you don't have permission to delete this account.`,
    });
  }
  return c.json(
    { message: `Account with id: ${authUser.account_id} deleted successfully` },
    200
  );
});

export { accounts };
