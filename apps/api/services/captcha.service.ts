import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types/bindings';

const objectToUrlEncoded = (obj: any) => {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    urlSearchParams.append(key, value as string);
  }
  return urlSearchParams.toString();
};

export const captchaVerify = async (env: Bindings, recaptchaToken: string) => {
  const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: objectToUrlEncoded({
      secret: env.RECAPTCHA_KEY,
      response: recaptchaToken,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (r.status == 200) {
    return (await r.json()) as any;
  }
};

export const captchaGuard = async (env: Bindings, recaptchaToken: string) => {
  // Bypass captcha validation for Android/iOS app, dev env
  if (env.ENVIRONMENT !== 'production') {
    return;
  }

  const capthcaResult = await captchaVerify(env, recaptchaToken);
  if (!capthcaResult.success) {
    throw new HTTPException(400, {
      message: `Recaptcha error: ${capthcaResult['error-codes']?.join()}`,
    });
  }

  if (capthcaResult.score < 0.3) {
    throw new HTTPException(400, {
      message: `Are you a human? Our system detected you as a bot and access denied. Contact support@idm.in to access this site`,
    });
  }
  return capthcaResult;
};
