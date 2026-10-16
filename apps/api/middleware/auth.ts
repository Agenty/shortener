import { MiddlewareHandler } from 'hono';
import { getUserByApiKeyId, getUserById } from '../services/auth.service';
import { HTTPException } from 'hono/http-exception';
import { AuthUser, toAuthResponse } from '../models/auth-user';
import { decode, verify } from 'hono/jwt';

export const jwtAuth = (): MiddlewareHandler => {
  return async (ctx, next) => {
    const { path } = ctx.req;
    if (path.includes('/v1/')) {
      const headerToken = ctx.req.header('Authorization');
      if (!headerToken) {
        throw new HTTPException(401, { message: `Unauthorized` });
      }
      const bearerToken = headerToken.split(' ').pop();
      try {
        const result = await verify(bearerToken, ctx.env.JWT_SECRET, 'HS256');
        if (!result) {
          throw new HTTPException(401, { message: `Unauthorized` });
        }
      } catch (err) {
        throw new HTTPException(401, { message: `Unauthorized` });
      }
      const { payload } = decode(bearerToken);
      let authUser: AuthUser;
      if (payload.account_id) {
        const { user_id, account_id } = payload as any;
        authUser = await getUserById(ctx.env, user_id, account_id);
      } else if (payload.key_id) {
        const { key_id } = payload as any;
        authUser = await getUserByApiKeyId(ctx.env, key_id);
      }

      if (!authUser) {
        throw new HTTPException(401, { message: `Unauthorized` });
      }

      const { url } = ctx.req;
      if (url.includes('/admin') && !authUser.level) {
        throw new HTTPException(401, { message: `Unauthorized` });
      }

      // Email not verified, 428 lets the app redirect to onboarding
      if (!authUser.is_verified && !url.includes('/otp')) {
        throw new HTTPException(428, {
          message: 'Email not verified',
        });
      }

      ctx.req['user'] = toAuthResponse(authUser);
    }

    //console.log('u', ctx.req['user']);
    await next();
  };
};
