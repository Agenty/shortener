import { Hono } from 'hono';
import { AuthUser, toAuthResponse } from '../models/auth-user';
import { OTPPurpose, OtpVerification, otpSchema } from '../models/otp';
import _ from 'lodash';
import { sendOtpEmail, welcomeEmail } from '../services/emailer.service';
import { HTTPException } from 'hono/http-exception';
import { addDays, getUnixTime } from 'date-fns';
import { sign } from 'hono/jwt';
import { verifyUser } from '../services/auth.service';
import { jsonValidator } from '../helper/validator';

const otp = new Hono<{ Bindings: CloudflareBindings }>();

otp.post('/send', jsonValidator(otpSchema), async (ctx) => {
  const authUser: AuthUser = ctx.req['user'];
  const otp = ctx.req.valid('json');

  otp.code = _.random(100000, 999999);
  const cacheKey = `${otp.purpose}-${authUser.user_id}`;
  await ctx.env.KVCACHE.put(cacheKey, JSON.stringify(otp), {
    expirationTtl: 60 * 5,
  });

  await sendOtpEmail(ctx.env, authUser, otp.code);
  return ctx.json({ message: `OTP sent` }, 200);
});

otp.post('/verify', jsonValidator(otpSchema), async (ctx) => {
  const authUser: AuthUser = ctx.req['user'];
  const otp = ctx.req.valid('json');

  if (!otp.code || otp.code < 10000) {
    throw new HTTPException(400, {
      message: 'Bad request, a 5-6 digit OTP is required',
    });
  }

  const cacheKey = `${otp.purpose}-${authUser.user_id}`;
  const cacheValue = await ctx.env.KVCACHE.get<OtpVerification>(
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
    await ctx.env.KVCACHE.delete(cacheKey);
    const newlyVerified = await verifyUser(ctx.env, authUser.user_id);
    authUser.is_verified = true;
    if (newlyVerified) {
      await welcomeEmail(ctx.env, authUser);
    }

    const jwtToken = await sign(
      {
        user_id: authUser.user_id,
        account_id: authUser.account_id,
        exp: getUnixTime(addDays(new Date(), 15)),
      },
      ctx.env.JWT_SECRET
    );
    return ctx.json(toAuthResponse(authUser, jwtToken), 200);
  }
  return ctx.json({ message: `OTP verified` }, 200);
});

export { otp };
