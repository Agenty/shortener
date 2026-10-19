import { AuthUser, RoleType, UserStatus } from '../models/auth-user';
import { nanoid } from 'nanoid';
import { createAccount } from './account.service';
import { PlanType } from '../models/plan';
import { welcomeEmail } from './emailer.service';
import { HTTPException } from 'hono/http-exception';
import { format, isBefore, subDays, subWeeks } from 'date-fns';
import { getCache, setCache } from './caching.service';

export const getUserById = async (
  env: CloudflareBindings,
  user_id: number,
  account_id: number
) => {
  const cacheKey = `authUser-${user_id}`;
  const cacheValue = await getCache(env, cacheKey);
  if (cacheValue) {
    return cacheValue;
  }

  const sqlQuery = env.DB.prepare(
    `SELECT u.user_id, u.name, u.email, u.role, u.level, u.is_verified, u.is_subscribed,
    u.password_reset_at, u.created_at, u.updated_at, u.status, u.avatar, u.password, 
    a.account_id, a.plan, a.trial_end_at
    FROM Users as u 
    INNER join Accounts as a 
    ON u.account_id = a.account_id 
    WHERE u.user_id = ? and u.account_id = ?`
  ).bind(Number(user_id), Number(account_id));

  const authUser: AuthUser = await sqlQuery.first();
  if (authUser && authUser.status != UserStatus.active) {
    throw new HTTPException(401, {
      message: `Your account have been ${authUser.status} by our AI due to (malicious URL, spam report etc), contact support if you have any question.`,
    });
  }
  if (authUser && authUser.is_verified) {
    await setCache(env, cacheKey, authUser);
  }
  return authUser;
};

export const getUserByEmail = async (env: CloudflareBindings, email: string) => {
  const sqlQuery = env.DB.prepare(
    `SELECT u.user_id, u.name, u.email, u.role, u.level, u.is_verified, u.is_subscribed,
    u.password_reset_at, u.created_at, u.updated_at, u.status, u.avatar, u.password, 
    a.account_id, a.plan, a.trial_end_at
    FROM Users as u 
    INNER join Accounts as a 
    ON u.account_id = a.account_id 
    WHERE u.email = ?`
  ).bind(email);
  const authUser: AuthUser = await sqlQuery.first();
  if (authUser && authUser.status != UserStatus.active) {
    throw new HTTPException(401, {
      message: `Your account have been ${authUser.status} by our AI due to (malicious URL, spam report etc), contact support if you have any question.`,
    });
  }
  return authUser;
};

export const getUserByApiKeyId = async (
  env: CloudflareBindings,
  key_id: number
) => {
  const cacheKey = `authKey-${key_id}`;
  const cacheValue = await getCache(env, cacheKey);
  if (cacheValue) {
    return cacheValue;
  }

  const sqlQuery = env.DB.prepare(
    `SELECT u.user_id, u.name, u.email, u.role, u.level, u.is_verified, u.is_subscribed,
    u.password_reset_at, u.created_at, u.updated_at, u.status, u.avatar, u.password, 
    a.account_id, a.plan, a.trial_end_at
    FROM ApiKeys as k
    INNER join Users as u 
    ON k.account_id = u.account_id
    INNER join Accounts as a 
    ON k.account_id = a.account_id 
    WHERE k.key_id = ? and k.is_enabled = 1`
  ).bind(Number(key_id));

  const authUser: AuthUser = await sqlQuery.first();

  if (authUser && authUser.status != UserStatus.active) {
    throw new HTTPException(401, {
      message: `Your account have been ${authUser.status} by our AI due to (malicious URL, spam report etc), contact support if you have any question.`,
    });
  }
  if (authUser && authUser.is_verified) {
    await setCache(env, cacheKey, authUser);
  }
  return authUser;
};

export const getUserCountByIP = async (env: CloudflareBindings, ip: string) => {
  const sqlQuery = env.DB.prepare(
    `Select count(1) as total from Users Where ip_address = ? and date(created_at) > date(?)`
  ).bind(ip || null, format(subWeeks(new Date(), 1), 'yyyy-MM-dd'));

  const { total } = await sqlQuery.first();
  return Number(total);
};

export const unsubscribe = async (
  env: CloudflareBindings,
  email: string,
  guid: string
) => {
  const sqlQuery = env.DB.prepare(
    `Update Users set is_subscribed = 0 Where email = ? and guid =  ?`
  ).bind(email, guid);

  await sqlQuery.run();
};

export const registerUser = async (
  env: CloudflareBindings,
  authUser: AuthUser
): Promise<number | null> => {
  authUser.is_verified = authUser.password ? false : true;
  const { meta } = await env.DB.prepare(
    `
          Insert Into Users (account_id, name, email, password, last_login_at, role, status, is_verified, guid, ip_address) 
          Values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      authUser.account_id,
      authUser.name,
      authUser.email,
      authUser.password || null,
      new Date().toISOString(),
      authUser.role,
      authUser.status,
      authUser.is_verified ? 1 : 0,
      authUser.guid,
      authUser.ip_address || null
    )
    .run();

  if (meta.last_row_id && authUser.is_verified) {
    await welcomeEmail(env, authUser);
  }
  return meta.last_row_id;
};

export const resetPassword = async (
  env: CloudflareBindings,
  password: string,
  authUser: AuthUser
): Promise<boolean> => {
  const { success } = await env.DB.prepare(
    `UPDATE Users Set password = ?, password_reset_at = ? where user_id = ? AND account_id = ?`
  )
    .bind(
      password,
      new Date().toISOString(),
      Number(authUser.user_id),
      Number(authUser.account_id)
    )
    .run();
  return success;
};

export const updateLastLoginDetails = async (
  env: CloudflareBindings,
  user_id: number
): Promise<boolean> => {
  const { success } = await env.DB.prepare(
    `UPDATE Users Set last_login_at = ? Where user_id = ?`
  )
    .bind(new Date().toISOString(), user_id)
    .run();
  return success;
};

export const verifyUser = async (
  env: CloudflareBindings,
  user_id: number
): Promise<boolean> => {
  const { success } = await env.DB.prepare(
    `UPDATE Users set is_verified = ? Where user_id = ?`
  )
    .bind(1, user_id)
    .run();

  return success;
};

/** `state` carries the page to return to after sign in, see `safeReturnUrl` */
export const getGoogleConsentUri = (env: CloudflareBindings, returnTo?: string) => {
  const state = encodeURIComponent(
    returnTo || String(Math.floor(Math.random() * 100000 + 1))
  );
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];
  const redirectUri = `${env.API_URL}/v1/oauth/google`;
  const consentUri = `https://accounts.google.com/o/oauth2/v2/auth?scope=${scopes.join(
    ' '
  )}&access_type=offline&include_granted_scopes=true&response_type=code&state=${state}&redirect_uri=${redirectUri}&client_id=${
    env.GOOGLE_CLIENT_ID
  }`;
  return consentUri;
};

export const getAccessTokenFromCode = async (
  env: CloudflareBindings,
  code: string,
  redirectPath = '/v1/oauth/google'
) => {
  const res = await fetch(`https://oauth2.googleapis.com/token`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${env.API_URL}${redirectPath}`,
      grant_type: 'authorization_code',
      code,
    }),
  });
  if (res.ok) {
    const data: any = await res.json();
    // console.log(data); // { access_token, expires_in, token_type, refresh_token }
    return data.access_token;
  }
};

const getGoogleUserInfo = async (env: CloudflareBindings, access_token: string) => {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  if (res.ok) {
    const data: any = await res.json();
    // console.log(data); // { id, email, given_name, family_name }
    return data;
  }
};

export const getGithubConsentUri = (env: CloudflareBindings) => {
  const random = Math.floor(Math.random() * 100000 + 1);
  const redirectUri = `${env.API_URL}/v1/oauth/github`;
  const consentUri = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}`;
  return consentUri;
};

export const googleCallBack = async (
  env: CloudflareBindings,
  access_token: string,
  ip: string,
  country: string
) => {
  const profile = await getGoogleUserInfo(env, access_token);
  if (!profile) {
    throw new HTTPException(401, {
      message: `No consent received from Google, try again.`,
    });
  }

  const authUser: AuthUser = {
    last_login_at: new Date(),
    ip_address: ip,
    is_verified: true,
    name: profile.name,
    email: profile.email.toLowerCase(),
    avatar: profile.picture,
    country: `${country}`,
  };

  const existingUser = await getUserByEmail(env, authUser.email);
  if (existingUser) {
    return existingUser;
  } else {
    authUser.guid = nanoid(32);
    authUser.role = RoleType.Owner;
    authUser.status = UserStatus.active;
    authUser.plan = PlanType.Free;
    authUser.account_id = await createAccount(env, authUser);
    authUser.user_id = await registerUser(env, authUser);
    return authUser;
  }
};

export const getDisposableDomains = async () => {
  try {
    const resp = await fetch(
      'https://raw.githubusercontent.com/MISP/misp-warninglists/main/lists/disposable-email/list.json',
      {
        cf: {
          cacheEverything: true,
          cacheTtl: 60 * 60 * 24 * 7,
        },
      }
    );
    if (resp.status == 200) {
      const data: any = await resp.json();
      return data.list;
    }
  } catch {}
  return [];
};

export const isDisposableEmail = async (env: CloudflareBindings, email: string) => {
  const domain = email.split('@').pop();

  const cacheKey = `disposableDomains`;
  const { value, metadata } = await env.KVCACHE.getWithMetadata<
    Array<string>,
    Record<string, string>
  >(cacheKey, {
    type: 'json',
    cacheTtl: 60 * 60 * 24,
  });

  const { refreshed_at } = metadata || {};
  if (
    !value ||
    (refreshed_at && isBefore(new Date(refreshed_at), subDays(new Date(), 7)))
  ) {
    const domains = await getDisposableDomains();
    if (domains.length) {
      await env.KVCACHE.put(cacheKey, JSON.stringify(domains), {
        metadata: {
          refreshed_at: new Date().toISOString(),
        },
      });
      return domains.includes(domain);
    }
  }
  if (value) return value.includes(domain);
};
