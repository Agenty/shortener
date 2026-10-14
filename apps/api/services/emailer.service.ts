import dayjs from 'dayjs';
import { Inquiry } from '../models/inquiry';
import { Context } from 'hono';
import { AuthUser } from '../models/auth-user';
import { Bindings } from '../types/bindings';
import { capitalize } from 'lodash';
import { md5 } from '../helper/utility';

export const sendEmail = async (messageBody: any) => {
  const emailRequest = new Request(
    'https://mandrillapp.com/api/1.0/messages/send',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(messageBody),
    }
  );

  const resp = await fetch(emailRequest);
  return await resp.text();
};

export const sendTemplate = async (messageBody: any) => {
  const emailRequest = new Request(
    'https://mandrillapp.com/api/1.0/messages/send-template',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(messageBody),
    }
  );

  const resp = await fetch(emailRequest);
  return await resp.text();
};

const generateHTMLFromObject = (obj: any) => {
  let html = '';
  for (const [key, value] of Object.entries(obj)) {
    html += `<strong>${capitalize(key)}</strong>: ${
      typeof value == 'object' ? JSON.stringify(value) : value
    }<br/>`;
  }
  return html;
};

export const contactEmail = async (ctx: Context, inquiry: Inquiry) => {
  const time = dayjs().format('MMM D, YYYY h:mm A');
  const response = await sendEmail({
    key: ctx.env.MANDRILL_KEY,
    message: {
      from_email: 'support@idm.in',
      from_name: 'IDM',
      headers: {
        'Reply-To': inquiry.email,
      },
      to: [
        { email: inquiry.email, type: 'to' },
        {
          email: 'support@idm.in',
          type: 'cc',
        },
      ],
      preserve_recipients: true,
      subject: `IDM Inquiry - ${time}`,
      html: `Hi,<br/><br/>
         Thank you for contacting us,<br/><br/>
         We've received your ticket, please expect a response within 24 hours (Monday-Friday, 9am to 6pm IST). 
         In the mean-time, check out <a href="https://idm.in/docs">our documentation</a> here.<br/><br/>
        
         ${generateHTMLFromObject(inquiry)} `,
    },
  });
  return response;
};

export const supportEmail = async (
  env: Bindings,
  subject: string,
  data: any
) => {
  const time = dayjs().format('MMM D, YYYY h:mm A');
  const response = await sendEmail({
    key: env.MANDRILL_KEY,
    message: {
      from_email: 'support@idm.in',
      from_name: 'IDM',
      to: [
        {
          email: 'support@idm.in',
          type: 'cc',
        },
      ],
      preserve_recipients: true,
      subject: `${subject} - ${time}`,
      html: `Hi,<br/><br/>
         Thank you for contacting us,<br/><br/>
         We've received your ticket, please expect a response within 24 hours (Monday-Friday, 9am to 6pm IST). 
         In the mean-time, check out <a href="https://idm.in/docs">our documentation</a> here.<br/><br/>
        
         ${generateHTMLFromObject(data)} `,
    },
  });
  return response;
};

export const welcomeEmail = async (ctx: Context, authUser: AuthUser) => {
  const response = await sendTemplate({
    key: ctx.env.MANDRILL_KEY,
    message: {
      from_email: 'vikash.rathee@idm.in',
      from_name: 'Vikash Rathee',
      to: [{ email: authUser.email, type: 'to' }],
      preserve_recipients: true,
      subject: `Welcome to IDM`,
      merge_vars: [
        {
          rcpt: authUser.email,
          vars: [{ name: 'name', content: authUser.name }],
        },
      ],
    },
    template_name: 'idm-welcome',
    template_content: [],
  });
  return response;
};

export const sendOtpEmail = async (
  env: Bindings,
  authUser: AuthUser,
  otp: number
) => {
  const mergeVars = [
    {
      rcpt: authUser.email,
      vars: [
        { name: 'name', content: authUser.name },
        {
          name: 'title',
          content: `Here is your one time verification code for idm.in: <br/><br/>
          <h1>${otp}</h1>`,
        },
        {
          name: 'message',
          content: `This OTP is valid for 5 minutes only. Contact support@idm.in if you need any help.`,
        },
      ],
    },
  ];
  const response = await sendTemplate({
    key: env.MANDRILL_KEY,
    message: {
      to: [
        {
          email: authUser.email,
          type: 'to',
        },
      ],
      subject: `Your verification code for IDM`,
      preserve_recipients: false,
      merge_vars: mergeVars,
    },
    template_name: 'idm-action',
    template_content: [],
  });
  return response;
};

export const sendPasswordResetEmail = async (
  env: Bindings,
  authUser: AuthUser,
  token: string
) => {
  const mergeVars = [
    {
      rcpt: authUser.email,
      vars: [
        { name: 'name', content: authUser.name },
        {
          name: 'title',
          content: `Here is your password reset link: <br/><br/>`,
        },
        {
          name: 'action_url',
          content: `${env.APP_URL}/reset-password?token=${token}`,
        },
        {
          name: 'action_text',
          content: `Reset password`,
        },
        {
          name: 'message',
          content: `This link is valid for 5 minutes only. Contact support@idm.in if you need any help.`,
        },
      ],
    },
  ];
  const response = await sendTemplate({
    key: env.MANDRILL_KEY,
    message: {
      to: [
        {
          email: authUser.email,
          type: 'to',
        },
      ],
      subject: `Your password reset request for IDM`,
      preserve_recipients: false,
      merge_vars: mergeVars,
    },
    template_name: 'idm-action',
    template_content: [],
  });
  return response;
};

export const sysAlertEmail = async (env: Bindings, logs: any) => {
  const time = dayjs().format('MMM D, YYYY h:mm A');
  const errorMessage = logs.error?.substring(0, 50) || logs.url;
  const uuid = await md5(errorMessage);
  const cacheKey = `sysalert-${uuid}`;
  const isExists = await env.KVCACHE.get(cacheKey, { cacheTtl: 60 });
  if (isExists) return;

  const response = await sendEmail({
    key: env.MANDRILL_KEY,
    message: {
      from_email: 'sys-alert@agenty.com',
      from_name: 'Agenty',
      to: [
        {
          email: 'sys-alert@agenty.com',
          type: 'to',
        },
      ],
      subject: `IDM error on Cloudflare - ${time}`,
      html: `Hi,<br/><br/>
         An error occurred on idm.in <strong>${
           env.ENVIRONMENT
         }</strong> environment,<br/><br/>
         <br/> 
         ${generateHTMLFromObject(logs)} `,
    },
  });

  await env.KVCACHE.put(cacheKey, '1', { expirationTtl: 60 * 60 * 4 });
  return response;
};
