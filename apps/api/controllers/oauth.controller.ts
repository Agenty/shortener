import { Hono } from 'hono';
import { Bindings } from '../types/bindings';
import {
  getAccessTokenFromCode,
  getGithubConsentUri,
  getGoogleConsentUri,
  googleCallBack,
} from '../services/auth.service';
import { setCookie } from 'hono/cookie';
import { CookieOptions } from 'hono/utils/cookie';
import dayjs from 'dayjs';
import { AuthResponse } from '../models/auth-response';
import { AuthUser } from '../models/auth-user';
import { sign } from 'hono/jwt';

const oauth = new Hono<{ Bindings: Bindings }>();

oauth.get('/google', async (ctx) => {
  const { code, reason } = ctx.req.query();
  if (reason && reason == 'consent') {
    return ctx.redirect(getGoogleConsentUri(ctx), 302);
  } else {
    if (!code) {
      return ctx.json({ message: 'Bad reqeust, no consent recieved' }, 400);
    }
    const access_token = await getAccessTokenFromCode(ctx, code);
    const authUser: AuthUser = await googleCallBack(ctx, access_token);
    const token = await sign(
      {
        user_id: authUser.user_id,
        account_id: authUser.account_id,
        exp: dayjs().add(15, 'days').unix(),
      },
      ctx.env.JWT_SECRET
    );

    const authResponse = new AuthResponse(authUser, token);
    const options: CookieOptions = {
      path: '/',
      secure: true,
      domain:
        ctx.env.DOMAIN == 'localhost' ? 'localhost' : `.${ctx.env.DOMAIN}`,
      httpOnly: false,
      maxAge: 86400 * 15,
      expires: dayjs().add(15, 'days').toDate(),
      sameSite: 'Lax',
    };
    setCookie(ctx, 'auth_user', JSON.stringify(authResponse), options);
    setCookie(ctx, 'auth_token', token, options);
    return ctx.redirect(ctx.env.APP_URL, 302);
  }
});

// Chrome extension only
oauth.post('/google', async (ctx) => {
  const { token } = await ctx.req.json();
  if (!token) {
    return ctx.json({ message: 'Bad reqeust, no token recieved' }, 401);
  }
  const authUser = await googleCallBack(ctx, token);
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
});

oauth.get('/github', async (ctx) => {
  const { code, reason } = ctx.req.query();
  if (reason && reason == 'consent') {
    return ctx.redirect(getGithubConsentUri(ctx), 302);
  } else {
  }
});

export { oauth };
