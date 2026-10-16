import { createRoute, z } from '@hono/zod-openapi';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '../models/auth';
import {
  AuthUser,
  RoleType,
  UserStatus,
  toAuthResponse,
} from '../models/auth-user';
import { hashPassword } from '../helper/utility';
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
import { nanoid } from 'nanoid';
import { PlanType } from '../models/plan';
import { addDays, addMinutes, getUnixTime } from 'date-fns';
import { HTTPException } from 'hono/http-exception';
import { sendPasswordResetEmail } from '../services/emailer.service';
import { captchaGuard } from '../services/captcha.service';
import { sign, verify } from 'hono/jwt';
import { createApi, errorResponses, messageSchema } from '../helper/openapi';
import { API_SAMPLES } from '../helper/api-samples';

const auth = createApi();

const tokenSchema = z.object({
  token: z.string().openapi({
    description:
      'JWT bearer token, send it in the `Authorization: Bearer <token>` header',
  }),
});

const signToken = (env: CloudflareBindings, authUser: AuthUser) =>
  sign(
    {
      user_id: authUser.user_id,
      account_id: authUser.account_id,
      exp: getUnixTime(addDays(new Date(), 15)),
    },
    env.JWT_SECRET
  );

auth.openapi(
  createRoute({
    tags: ['Authentication'],
    method: 'post',
    path: '/signup',
    summary: 'Sign up',
    description:
      'Create a free URL shortener account with name, email and password. A one-time code is sent to verify the email address before the API can be used.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: signupSchema,
            example: API_SAMPLES.auth.signup,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Account created, returns the bearer token',
        content: {
          'application/json': {
            schema: tokenSchema,
          },
        },
      },
      ...errorResponses(400, 429),
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json');
    const { cf } = ctx.req.raw;
    const ip = ctx.req.header('CF-Connecting-IP');

    // Captcha validation
    await captchaGuard(ctx.env, data.recaptcha);

    const [existingUser, totalByIP, disposableEmail] = await Promise.all([
      getUserByEmail(ctx.env, data.email),
      getUserCountByIP(ctx.env, ip),
      isDisposableEmail(ctx.env, data.email),
    ]);

    if (existingUser) {
      throw new HTTPException(400, {
        message:
          'User with this email already exist, please sign in or use the forgot password option',
      });
    }
    if (totalByIP > 0) {
      throw new HTTPException(400, {
        message:
          'Multiple account creation attempts have been detected, please upgrade your existing account to add more links, users etc.',
      });
    }
    if (disposableEmail) {
      throw new HTTPException(400, {
        message: 'Invalid email, disposable email not supported',
      });
    }

    const authUser: AuthUser = {
      name: data.name,
      email: data.email,
      ip_address: ip,
      last_login_at: new Date(),
      role: RoleType.Owner,
      status: UserStatus.active,
      is_verified: false,
      plan: PlanType.Free,
      password: await hashPassword(data.password),
      guid: nanoid(32),
      country: `${cf.country}`,
    };

    authUser.account_id = await createAccount(ctx.env, authUser);
    authUser.user_id = await registerUser(ctx.env, authUser);
    const token = await signToken(ctx.env, authUser);
    return ctx.json({ token: token }, 200);
  }
);

auth.openapi(
  createRoute({
    tags: ['Authentication'],
    method: 'post',
    path: '/signin',
    summary: 'Sign in',
    description:
      'Sign in with email and password to get a bearer token (valid for 15 days) along with the user profile and plan limits. Use an [API key](#tag/API-Keys) for server-to-server integrations instead.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: loginSchema,
            example: API_SAMPLES.auth.signin,
          },
        },
      },
    },
    responses: {
      200: {
        description:
          'Signed in user profile with plan limits and the bearer `token`',
        content: {
          'application/json': {
            schema: tokenSchema,
          },
        },
      },
      ...errorResponses(400, 401, 429),
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json');
    const authUser = await getUserByEmail(ctx.env, data.email);
    const hashedPassword = await hashPassword(data.password);
    if (!authUser || hashedPassword !== authUser.password) {
      throw new HTTPException(400, {
        message: 'Invalid email or password',
      });
    }

    await updateLastLoginDetails(ctx.env, authUser.user_id);
    const token = await signToken(ctx.env, authUser);
    return ctx.json(toAuthResponse(authUser, token), 200);
  }
);

auth.openapi(
  createRoute({
    tags: ['Authentication'],
    method: 'post',
    path: '/forgot-password',
    summary: 'Forgot password',
    description:
      'Send a password reset link to the registered email address. The link is valid for 15 minutes.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: forgotPasswordSchema,
            example: API_SAMPLES.auth.forgotPassword,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Password reset email sent',
        content: {
          'application/json': {
            schema: messageSchema,
          },
        },
      },
      ...errorResponses(400, 429),
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json');
    const authUser = await getUserByEmail(ctx.env, data.email);
    if (!authUser) {
      throw new HTTPException(400, {
        message:
          'If you are a registered client, you will receive an email to reset your password',
      });
    }
    const token = await sign(
      {
        user_id: authUser.user_id,
        account_id: authUser.account_id,
        exp: getUnixTime(addMinutes(new Date(), 15)),
      },
      ctx.env.JWT_SECRET
    );

    await sendPasswordResetEmail(ctx.env, authUser, token);
    return ctx.json({ message: 'Password reset email sent' }, 200);
  }
);

auth.openapi(
  createRoute({
    tags: ['Authentication'],
    method: 'post',
    path: '/reset-password',
    summary: 'Reset password',
    description:
      'Set a new password using the token received in the password reset email.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: resetPasswordSchema,
            example: API_SAMPLES.auth.resetPassword,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Password updated',
        content: {
          'application/json': {
            schema: messageSchema,
          },
        },
      },
      ...errorResponses(400, 429),
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json');

    let tokenData: { user_id?: number; account_id?: number } = {};
    try {
      const payload = await verify(data.token, ctx.env.JWT_SECRET, 'HS256');
      tokenData = {
        user_id: Number(payload.user_id),
        account_id: Number(payload.account_id),
      };
    } catch (err) {
      throw new HTTPException(400, { message: 'Invalid token' });
    }

    const authUser = await getUserById(
      ctx.env,
      tokenData.user_id,
      tokenData.account_id
    );
    if (!authUser) {
      throw new HTTPException(400, {
        message: 'Invalid token or no account found',
      });
    }

    const hash = await hashPassword(data.password);
    await resetPassword(ctx.env, hash, authUser);
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
