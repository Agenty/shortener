import { createRoute, z } from '@hono/zod-openapi';
import {
  forgotPasswordSchema,
  identifySchema,
  isSpamName,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyCodeSchema,
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
  verifyUser,
} from '../services/auth.service';
import { createAccount } from '../services/account.service';
import { nanoid } from 'nanoid';
import { PlanType } from '../models/plan';
import { addDays, addMinutes, getUnixTime } from 'date-fns';
import { HTTPException } from 'hono/http-exception';
import {
  sendOtpEmail,
  sendPasswordResetEmail,
} from '../services/emailer.service';
import { captchaGuard } from '../services/captcha.service';
import { sign, verify } from 'hono/jwt';
import { createApi, errorResponses, messageSchema } from '../helper/openapi';
import { API_SAMPLES } from '../helper/api-samples';
import _ from 'lodash';

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
    await captchaGuard(ctx.env, data.turnstile, ip);

    // Block spam names silently, don't share the reason
    if (isSpamName(data.name)) {
      throw new HTTPException(400, {
        message:
          "Signup with email is restricted, please continue with Google or contact support",
      });
    }

    const [existingUser, ipSignupCount, disposableEmail] = await Promise.all([
      getUserByEmail(ctx.env, data.email),
      getUserCountByIP(ctx.env, ip),
      isDisposableEmail(ctx.env, data.email),
    ]);

    if (existingUser) {
      throw new HTTPException(400, {
        message:
          'Unable to create an account with this email, please sign in or use the forgot password option',
      });
    }

    if (ipSignupCount > 2) {
      throw new HTTPException(400, {
        message:
          "Signup with email is restricted, please continue with Google or contact support",
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
    await captchaGuard(
      ctx.env,
      data.turnstile,
      ctx.req.header('CF-Connecting-IP')
    );
    // Same response whether or not the email is registered
    const message =
      'If an account exists for this email, you will receive a link to reset your password';
    const authUser = await getUserByEmail(ctx.env, data.email);
    if (!authUser) {
      return ctx.json({ message }, 200);
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
    return ctx.json({ message }, 200);
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

/** Pending email code of a passwordless sign in, valid for 10 minutes */
type IdentifyCode = { code: string; attempts: number };
const IDENTIFY_TTL_MINUTES = 10;
const IDENTIFY_MAX_ATTEMPTS = 5;
const identifyCacheKey = (email: string) => `identify-${email}`;

auth.openapi(
  createRoute({
    tags: ['Authentication'],
    method: 'post',
    path: '/identify',
    summary: 'Sign in with email code',
    description:
      'Send a one-time 6-digit code to the email address. Works for new and existing users, a new account is created when the code is verified. Requires a Cloudflare Turnstile token. Returns a short-lived token to send with `POST /auth/verify`.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: identifySchema,
            example: API_SAMPLES.auth.identify,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Code sent, returns the token to verify it with',
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
    await captchaGuard(
      ctx.env,
      data.turnstile,
      ctx.req.header('CF-Connecting-IP')
    );
    const email = data.email.trim().toLowerCase();
    const existingUser = await getUserByEmail(ctx.env, email);
    if (!existingUser && (await isDisposableEmail(ctx.env, email))) {
      throw new HTTPException(400, {
        message: 'Invalid email, disposable email not supported',
      });
    }

    const code: IdentifyCode = {
      code: String(_.random(100000, 999999)),
      attempts: 0,
    };
    await ctx.env.KVCACHE.put(identifyCacheKey(email), JSON.stringify(code), {
      expirationTtl: 60 * IDENTIFY_TTL_MINUTES,
    });
    await sendOtpEmail(
      ctx.env,
      { email, name: existingUser?.name || email.split('@')[0] },
      Number(code.code)
    );

    // Identifies the email only, the auth middleware rejects it for the API
    const token = await sign(
      {
        email,
        purpose: 'identify',
        exp: getUnixTime(addMinutes(new Date(), IDENTIFY_TTL_MINUTES)),
      },
      ctx.env.JWT_SECRET
    );
    return ctx.json({ token }, 200);
  }
);

auth.openapi(
  createRoute({
    tags: ['Authentication'],
    method: 'post',
    path: '/verify',
    summary: 'Verify email code',
    description:
      'Verify the one-time code sent by `POST /auth/identify`. Send the token it returned in the `Authorization: Bearer <token>` header. Returns the signed in user with a bearer token (valid for 15 days).',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: verifyCodeSchema,
            example: API_SAMPLES.auth.verify,
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
    const { code } = ctx.req.valid('json');
    const bearer = ctx.req.header('Authorization')?.split(' ').pop();

    let email: string;
    try {
      const payload = await verify(bearer, ctx.env.JWT_SECRET, 'HS256');
      if (payload.purpose !== 'identify' || !payload.email) throw new Error();
      email = String(payload.email);
    } catch {
      throw new HTTPException(401, {
        message: 'Code expired, request a new one',
      });
    }

    const cacheKey = identifyCacheKey(email);
    const pending = await ctx.env.KVCACHE.get<IdentifyCode>(cacheKey, 'json');
    if (!pending) {
      throw new HTTPException(400, {
        message: 'Code expired, request a new one',
      });
    }
    if (pending.code !== code) {
      pending.attempts += 1;
      if (pending.attempts >= IDENTIFY_MAX_ATTEMPTS) {
        await ctx.env.KVCACHE.delete(cacheKey);
        throw new HTTPException(400, {
          message: 'Too many invalid attempts, request a new code',
        });
      }
      await ctx.env.KVCACHE.put(cacheKey, JSON.stringify(pending), {
        expirationTtl: 60 * IDENTIFY_TTL_MINUTES,
      });
      throw new HTTPException(400, { message: 'Invalid code' });
    }
    await ctx.env.KVCACHE.delete(cacheKey);

    let authUser = await getUserByEmail(ctx.env, email);
    if (authUser) {
      if (!authUser.is_verified) {
        await verifyUser(ctx.env, authUser.user_id);
        authUser.is_verified = true;
      }
      await updateLastLoginDetails(ctx.env, authUser.user_id);
    } else {
      const ip = ctx.req.header('CF-Connecting-IP');
      if ((await getUserCountByIP(ctx.env, ip)) > 0) {
        throw new HTTPException(400, {
          message:
            'Multiple account creation attempts have been detected, please upgrade your existing account to add more links, users etc.',
        });
      }
      authUser = {
        name: email.split('@')[0],
        email,
        ip_address: ip,
        last_login_at: new Date(),
        role: RoleType.Owner,
        status: UserStatus.active,
        plan: PlanType.Free,
        guid: nanoid(32),
        country: `${ctx.req.raw.cf?.country}`,
      };
      authUser.account_id = await createAccount(ctx.env, authUser);
      // Passwordless users are verified by the email code
      authUser.user_id = await registerUser(ctx.env, authUser);
    }

    const token = await signToken(ctx.env, authUser);
    return ctx.json(toAuthResponse(authUser, token), 200);
  }
);

export { auth };
