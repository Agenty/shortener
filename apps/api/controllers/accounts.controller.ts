import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { Account, accountSchema } from '../models/account';
import {
  deleteAccount,
  getAccount,
  updateAccount,
} from '../services/account.service';
import { AuthUser } from '../models/auth-user';
import { Bindings } from '../types/bindings';

const accounts = new Hono<{ Bindings: Bindings }>();

accounts.get('/', async (c) => {
  const authUser: AuthUser = c.req['user'];
  const result = await getAccount(c.env, authUser.account_id);
  if (!result) {
    return c.json(
      {
        message: `No account found with id: ${authUser.account_id}, or you don't have permission to view this account.`,
      },
      403
    );
  }
  return c.json({ ...result }, 200);
});

accounts.put(
  '/',
  validator('json', (value, c) => {
    const parsed = accountSchema.safeParse(value);
    if (!parsed.success) {
      return c.json(parsed, 403);
    }
    return parsed.data;
  }),
  async (c) => {
    const data = c.req.valid('json') as Account;
    const authUser: AuthUser = c.req['user'];

    const response = await updateAccount(c, authUser.account_id, data);
    if (!response) {
      return c.json(
        {
          message: `No account found with id: ${authUser.account_id}, or you don't have permission to update this account`,
        },
        403
      );
    }
    return c.json(
      {
        ...data,
        account_id: authUser.account_id,
      },
      200
    );
  }
);

accounts.delete('/', async (c) => {
  const authUser: AuthUser = c.req['user'];

  const response = await deleteAccount(c, authUser.account_id);
  if (!response) {
    return c.json(
      {
        message: `No account found with id: ${authUser.account_id}, or you don't have permission to delete this account.`,
      },
      403
    );
  }

  return c.json(
    {
      message: `Account with id: ${authUser.account_id} deleted successfully`,
    },
    200
  );
});

export { accounts };
