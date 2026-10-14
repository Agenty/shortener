import { Hono } from 'hono';
import { Signup, signupSchema } from '../models/signup';
import { validator } from 'hono/validator';
import { AuthUser, RoleType, UserStatus } from '../models/auth-user';
import { formatZodError, hashPassword } from '../helper/utility';
import { Login, loginSchema } from '../models/login';
import {
  ForgotPassword,
  forgetPasswordSchema,
} from '../models/forgot-password';
import { ResetPassword, resetPasswordSchema } from '../models/reset-password';
import {
  registerUser,
  getUserByEmail,
  getUserById,
  resetPassword,
  updateLastLoginDetails,
  getUserCountByIP,
  isDisposableEmail,
} from '../services/auth.service';
import { createAccount } from '../services/account.service';
import { Bindings } from '../types/bindings';
import { nanoid } from 'nanoid';
import { PlanType } from '../models/plan';
import { AuthResponse } from '../models/auth-response';
import dayjs from 'dayjs';
import { HTTPException } from 'hono/http-exception';
import { sendPasswordResetEmail } from '../services/emailer.service';
import { captchaGuard } from '../services/captcha.service';
import { decode, sign, verify } from 'hono/jwt';

const auth = new Hono<{ Bindings: Bindings }>();

auth.post(
  '/signup',
  validator('json', (value, ctx) => {
    const parsed = signupSchema.safeParse(value);
    if (parsed.success === false) {
      throw new HTTPException(403, { message: formatZodError(parsed.error) });
    }
    return parsed.data as Signup;
  }),
  async (ctx) => {
    const data = ctx.req.valid('json');
    const { cf } = ctx.req.raw;
    const ip = ctx.req.header('CF-Connecting-IP');

    // Captcha validation
    await captchaGuard(ctx.env, data.recaptcha);

    const [existingUser, totalByIP, disposableEmail] = await Promise.all([
      getUserByEmail(ctx, data.email),
      getUserCountByIP(ctx.env, ip),
      isDisposableEmail(ctx.env, data.email),
    ]);

    if (existingUser) {
      return ctx.json(
        {
          message:
            'User with this email already exist, plesae sign in or use the forgot password option',
        },
        400
      );
    }
    if (totalByIP > 0) {
      return ctx.json(
        {
          message:
            'Multiple account creation attempts have been detected, please upgrade your existing account to add more links, users etc.',
        },
        400
      );
    }

    if (disposableEmail) {
      return ctx.json(
        {
          message: 'Invalid email, disposable email not supported',
        },
        400
      );
    }

    const passwordHash = await hashPassword(data.password);
    const authUser: AuthUser = {
      ...data,
      ip_address: ip,
      last_login_at: new Date(),
      role: RoleType.Owner,
      status: UserStatus.active,
      is_verified: false,
      plan: PlanType.Free,
      password: passwordHash,
      guid: nanoid(32),
      country: `${cf.country}`,
    };

    authUser.account_id = await createAccount(ctx, authUser);
    authUser.user_id = await registerUser(ctx, authUser);
    const token = await sign(
      {
        user_id: authUser.user_id,
        account_id: authUser.account_id,
        exp: dayjs().add(15, 'days').unix(),
      },
      ctx.env.JWT_SECRET
    );
    return ctx.json({ token: token }, 200);
  }
);

auth.post(
  '/signin',
  validator('json', (value, ctx) => {
    const parsed = loginSchema.safeParse(value);
    if (parsed.success === false) {
      throw new HTTPException(403, { message: formatZodError(parsed.error) });
    }
    return parsed.data as Login;
  }),
  async (ctx) => {
    const data = ctx.req.valid('json');
    const authUser = await getUserByEmail(ctx, data.email);
    if (!authUser) {
      return ctx.json({ message: 'Invalid username or password' }, 400);
    }
    const hashedPassword = await hashPassword(data.password);
    if (hashedPassword !== authUser.password) {
      return ctx.json({ message: 'Email or password does not match' }, 400);
    }

    await updateLastLoginDetails(ctx, authUser.user_id);

    const token = await sign(
      {
        user_id: authUser.user_id,
        account_id: authUser.account_id,
        exp: dayjs().add(15, 'days').unix(),
      },
      ctx.env.JWT_SECRET
    );
    const authResponse = new AuthResponse(authUser, token);
    return ctx.json(authResponse, 200);
  }
);

auth.post(
  'forgot-password',
  validator('json', (value, ctx) => {
    const parsed = forgetPasswordSchema.safeParse(value);
    if (parsed.success === false) {
      throw new HTTPException(403, { message: formatZodError(parsed.error) });
    }
    return parsed.data as ForgotPassword;
  }),
  async (ctx) => {
    const data = ctx.req.valid('json');
    const authUser = await getUserByEmail(ctx, data.email);
    if (!authUser) {
      return ctx.json(
        {
          message:
            'If you are a registered client, you will receive an email to reset your password',
        },
        400
      );
    }
    const token = await sign(
      {
        user_id: authUser.user_id,
        account_id: authUser.account_id,
        exp: dayjs().add(15, 'minutes').unix(),
      },
      ctx.env.JWT_SECRET
    );

    await sendPasswordResetEmail(ctx.env, authUser, token);

    return ctx.json({ message: 'Password reset email sent' }, 200);
  }
);

auth.post(
  'reset-password',
  validator('json', (value, ctx) => {
    const parsed = resetPasswordSchema.safeParse(value);
    if (parsed.success === false) {
      throw new HTTPException(403, { message: formatZodError(parsed.error) });
    }
    return parsed.data as ResetPassword;
  }),
  async (ctx) => {
    const data = ctx.req.valid('json');
    if (data.password !== data.confirm_password) {
      return ctx.json(
        { message: 'Password and confirm password does not match' },
        400
      );
    }

    let tokenData: any = {};
    try {
      const isVerified = await verify(data.token, ctx.env.JWT_SECRET);
      if (!isVerified) {
        return ctx.json({ message: 'Invalid token' }, 400);
      }
      const { payload } = decode(data.token);
      tokenData = { user_id: payload.user_id, account_id: payload.account_id };
    } catch (err) {
      return ctx.json({ message: 'Invalid token' }, 400);
    }

    const authUser = await getUserById(
      ctx,
      tokenData.user_id,
      tokenData.account_id
    );

    if (!authUser) {
      return ctx.json({ message: 'Invalid token or no account found' }, 400);
    }

    const hash = await hashPassword(data.password);
    await resetPassword(ctx, hash, authUser);
    return ctx.json(
      {
        message:
          'Password updated successfully, you may login now with your new password.',
      },
      200
    );
  }
);

export { auth };
