import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import { AuthUser } from '../models/auth-user';
import { OTPPurpose, OtpVerification, otpSchema } from '../models/otp';
import _ from 'lodash';
import { sendOtpEmail, welcomeEmail } from '../services/emailer.service';
import { validator } from 'hono/validator';
import { HTTPException } from 'hono/http-exception';
import { formatZodError } from '../helper/utility';
import dayjs from 'dayjs';
import { AuthResponse } from '../models/auth-response';
import { decode, sign, verify } from 'hono/jwt';
import { verifyUser } from '../services/auth.service';

const otp = new Hono<{ Bindings: Bindings }>();

otp.post(
  '/send',
  validator('json', (value, c) => {
    const parsed = otpSchema.safeParse(value);
    if (parsed.success === false) {
      throw new HTTPException(403, { message: formatZodError(parsed.error) });
    }
    return parsed.data as OtpVerification;
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const otp = ctx.req.valid('json');

    otp.code = _.random(10000, 999999);
    const cacheKey = `${otp.purpose}-${authUser.user_id}`;
    await ctx.env.KVCACHE.put(cacheKey, JSON.stringify(otp), {
      expirationTtl: 60 * 5,
    });

    await sendOtpEmail(ctx.env, authUser, otp.code);
    return ctx.json(
      {
        message: `OTP sent`,
      },
      200
    );
  }
);

otp.post(
  '/verify',
  validator('json', (value, c) => {
    const parsed = otpSchema.safeParse(value);
    if (parsed.success === false) {
      throw new HTTPException(403, { message: formatZodError(parsed.error) });
    }
    return parsed.data as OtpVerification;
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const otp = ctx.req.valid('json');

    if (!otp.code || otp.code < 10000) {
      throw new HTTPException(403, {
        message: 'Bad request, a 5-6 digit OTP is required',
      });
    }

    const cacheKey = `${otp.purpose}-${authUser.user_id}`;
    const cacheValue: OtpVerification = await ctx.env.KVCACHE.get(
      cacheKey,
      'json'
    );
    if (!cacheValue) {
      throw new HTTPException(403, { message: 'OTP expired or invalid' });
    }

    if (cacheValue.code != otp.code) {
      throw new HTTPException(403, { message: 'Invalid OTP' });
    }

    if (cacheValue.purpose == OTPPurpose.signup) {
      authUser.is_verified = true;

      await Promise.all([
        verifyUser(ctx, authUser.user_id),
        welcomeEmail(ctx, authUser),
      ]);

      const jwtToken = await sign(
        {
          user_id: authUser.user_id,
          account_id: authUser.account_id,
          exp: dayjs().add(15, 'days').unix(),
        },
        ctx.env.JWT_SECRET
      );
      const authResponse = new AuthResponse(authUser, jwtToken);
      return ctx.json(authResponse, 200);
    } else {
      return ctx.json(
        {
          message: `OTP verified`,
        },
        200
      );
    }
  }
);

export { otp };
