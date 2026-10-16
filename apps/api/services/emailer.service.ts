import { format } from 'date-fns';
import { AuthUser } from '../models/auth-user';
import { md5 } from '../helper/utility';
import { welcomeEmailHtml } from '../emails/welcome-email';
import { otpEmailHtml } from '../emails/otp-email';
import { domainVerificationEmailHtml } from '../emails/domain-verification-email';
import { passwordResetEmailHtml } from '../emails/password-reset-email';
import { dataTableEmailHtml } from '../emails/data-table-email';
import { BRAND, SUPPORT_EMAIL } from '../emails/components/layout';

const NOREPLY = { email: 'noreply@shortener.dev', name: BRAND };
const SUPPORT = { email: SUPPORT_EMAIL, name: BRAND };
const SYS_ALERT_EMAIL = 'sys-alert@agenty.com';

export const sendEmail = async (
  env: CloudflareBindings,
  message: EmailMessageBuilder
) => env.EMAIL.send(message);

export const supportEmail = async (
  env: CloudflareBindings,
  subject: string,
  data: any
) => {
  const time = format(new Date(), 'MMM d, yyyy h:mm a');
  return sendEmail(env, {
    from: SUPPORT,
    to: SUPPORT_EMAIL,
    subject: `${subject} - ${time}`,
    html: await dataTableEmailHtml(
      subject,
      `A new support request was received on ${BRAND}.`,
      data
    ),
  });
};

export const welcomeEmail = async (env: CloudflareBindings, authUser: AuthUser) =>
  sendEmail(env, {
    from: { email: 'vikash.rathee@shortener.dev', name: 'Vikash Rathee' },
    replyTo: SUPPORT_EMAIL,
    to: { email: authUser.email, name: authUser.name },
    subject: `Welcome to ${BRAND}`,
    html: await welcomeEmailHtml(authUser),
  });

export const sendOtpEmail = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  otp: number
) =>
  sendEmail(env, {
    from: NOREPLY,
    to: { email: authUser.email, name: authUser.name },
    subject: `Your verification code for ${BRAND}`,
    html: await otpEmailHtml(authUser, otp),
  });

export const sendDomainOtpEmail = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  email: string,
  domain: string,
  otp: number
) =>
  sendEmail(env, {
    from: NOREPLY,
    to: email,
    subject: `Verify your domain ${domain} on ${BRAND}`,
    html: await domainVerificationEmailHtml(authUser, domain, otp),
  });

export const sendPasswordResetEmail = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  token: string
) =>
  sendEmail(env, {
    from: NOREPLY,
    to: { email: authUser.email, name: authUser.name },
    subject: `Reset your ${BRAND} password`,
    html: await passwordResetEmailHtml(
      authUser,
      `${env.APP_URL}/reset-password?token=${token}`
    ),
  });

export const sysAlertEmail = async (env: CloudflareBindings, logs: any) => {
  const time = format(new Date(), 'MMM d, yyyy h:mm a');
  const errorMessage = logs.error?.substring(0, 50) || logs.url;
  const uuid = await md5(errorMessage);
  const cacheKey = `sysalert-${uuid}`;
  const isExists = await env.KVCACHE.get(cacheKey, { cacheTtl: 60 });
  if (isExists) return;

  const response = await sendEmail(env, {
    from: { email: 'sys-alert@shortener.dev', name: BRAND },
    to: SYS_ALERT_EMAIL,
    subject: `${BRAND} error on Cloudflare - ${time}`,
    html: await dataTableEmailHtml(
      'System alert',
      `An error occurred on the ${env.ENVIRONMENT} environment.`,
      logs
    ),
  });

  await env.KVCACHE.put(cacheKey, '1', { expirationTtl: 60 * 60 * 4 });
  return response;
};
