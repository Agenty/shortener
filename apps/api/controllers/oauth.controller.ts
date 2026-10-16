import { Hono } from 'hono';
import {
  getAccessTokenFromCode,
  getGithubConsentUri,
  getGoogleConsentUri,
  googleCallBack,
} from '../services/auth.service';
import { setCookie } from 'hono/cookie';
import { CookieOptions } from 'hono/utils/cookie';
import { addDays, getUnixTime } from 'date-fns';
import { AuthUser, toAuthResponse } from '../models/auth-user';
import { sign, verify } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import {
  SEARCH_CONSOLE_CALLBACK,
  getDomainById,
  getStateSecret,
  getSearchConsoleSites,
  isVerifiedInSearchConsole,
  markDomainVerified,
} from '../services/domain.service';

const oauth = new Hono<{ Bindings: CloudflareBindings }>();

oauth.get('/google', async (ctx) => {
  const { code, reason } = ctx.req.query();
  if (reason && reason == 'consent') {
    return ctx.redirect(getGoogleConsentUri(ctx.env), 302);
  } else {
    if (!code) {
      throw new HTTPException(400, {
        message: 'Bad request, no consent received',
      });
    }
    const access_token = await getAccessTokenFromCode(ctx.env, code);
    const authUser: AuthUser = await googleCallBack(
      ctx.env,
      access_token,
      ctx.req.header('CF-Connecting-IP'),
      `${ctx.req.raw.cf?.country}`
    );
    const token = await sign(
      {
        user_id: authUser.user_id,
        account_id: authUser.account_id,
        exp: getUnixTime(addDays(new Date(), 15)),
      },
      ctx.env.JWT_SECRET
    );

    const authResponse = toAuthResponse(authUser, token);
    const options: CookieOptions = {
      path: '/',
      secure: true,
      domain:
        ctx.env.DOMAIN == 'localhost' ? 'localhost' : `.${ctx.env.DOMAIN}`,
      httpOnly: false,
      maxAge: 86400 * 15,
      expires: addDays(new Date(), 15),
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
    throw new HTTPException(401, {
      message: 'Bad request, no token received',
    });
  }
  const authUser = await googleCallBack(
    ctx.env,
    token,
    ctx.req.header('CF-Connecting-IP'),
    `${ctx.req.raw.cf?.country}`
  );
  const jwtToken = await sign(
    {
      user_id: authUser.user_id,
      account_id: authUser.account_id,
      exp: getUnixTime(addDays(new Date(), 15)),
    },
    ctx.env.JWT_SECRET
  );
  return ctx.json(toAuthResponse(authUser, jwtToken), 200);
});

// Domain ownership verification with Google Search Console
oauth.get('/google/search-console', async (ctx) => {
  const { code, state, error } = ctx.req.query();
  const redirect = (params: Record<string, string>) =>
    ctx.redirect(
      `${ctx.env.APP_URL}/domains?${new URLSearchParams(params)}`,
      302
    );

  if (error || !code || !state) {
    return redirect({ error: 'No consent received from Google, try again' });
  }

  let payload: { domain_id?: number; account_id?: number; purpose?: string };
  try {
    payload = (await verify(
      state,
      getStateSecret(ctx.env),
      'HS256'
    )) as any;
  } catch {
    return redirect({ error: 'Verification link expired, try again' });
  }
  if (payload.purpose !== 'domain-verification') {
    return redirect({ error: 'Invalid verification request' });
  }

  const account = { account_id: Number(payload.account_id) };
  const domain = await getDomainById(ctx.env, Number(payload.domain_id), account);
  if (!domain) {
    return redirect({ error: 'Domain not found' });
  }

  const accessToken = await getAccessTokenFromCode(
    ctx.env,
    code,
    SEARCH_CONSOLE_CALLBACK
  );
  if (!accessToken) {
    return redirect({ error: 'No consent received from Google, try again' });
  }

  const sites = await getSearchConsoleSites(accessToken);
  if (!isVerifiedInSearchConsole(sites, domain.domain)) {
    return redirect({
      error: `${domain.domain} is not a verified property in Google Search Console for this Google account`,
    });
  }

  await markDomainVerified(ctx.env, account, domain.domain_id);
  return redirect({ verified: domain.domain });
});

oauth.get('/github', async (ctx) => {
  const { reason } = ctx.req.query();
  if (reason && reason == 'consent') {
    return ctx.redirect(getGithubConsentUri(ctx.env), 302);
  }
  throw new HTTPException(501, {
    message: 'GitHub sign in is not available yet',
  });
});

export { oauth };
