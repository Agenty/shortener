import { HTTPException } from 'hono/http-exception';

type TurnstileResult = {
  success: boolean;
  'error-codes'?: string[];
  hostname?: string;
  action?: string;
};

/** Cloudflare Turnstile, the token is single use and valid for 5 minutes */
export const captchaVerify = async (
  env: CloudflareBindings,
  token: string,
  ip?: string
): Promise<TurnstileResult> => {
  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  if (ip) body.set('remoteip', ip);

  const r = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body }
  );
  if (r.status !== 200) {
    return { success: false, 'error-codes': [`http-${r.status}`] };
  }
  return (await r.json()) as TurnstileResult;
};

export const captchaGuard = async (
  env: CloudflareBindings,
  token: string | undefined,
  ip?: string
) => {
  // Bypass captcha validation for dev env
  if (env.ENVIRONMENT !== 'production') {
    return;
  }

  if (!token) {
    throw new HTTPException(400, {
      message: 'Please complete the security check and try again',
    });
  }

  const result = await captchaVerify(env, token, ip);
  if (!result.success) {
    throw new HTTPException(400, {
      message: `Security check failed (${result['error-codes']?.join() || 'unknown'}), please try again`,
    });
  }
  return result;
};
