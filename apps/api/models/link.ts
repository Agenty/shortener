import { z } from '@hono/zod-openapi';
import dayjs from 'dayjs';
import { BaseLink } from './baselink';

export class Link extends BaseLink {
  url?: string;
  expire_at?: Date | string;
  data?: Record<string, string>;
  params?: Record<string, string> = {};
  title?: string;
  description?: string;
  image?: string;
  password?: string;
  ios?: string;
  android?: string;
  geo?: Array<Geo> = new Array<Geo>();
}

export class Geo {
  country?: string;
  url?: string;
}

const urlValidator = (value: string) => {
  if (typeof value !== 'string' || !value.length) return true;

  // Ensure no .dat, .bat urls
  try {
    const uri = new URL(value.split('?')[0]);
    if (uri.protocol !== 'http:' && uri.protocol !== 'https:') {
      return false;
    }
    if (uri.pathname.endsWith('.dat') || uri.pathname.endsWith('.bat')) {
      return false;
    }

    // Ensure not a blocked domain or tld
    const blocked = [
      '.workers.dev',
      '.vercel.app',
      '.idm.in',
      '.pages.dev',
      '.ko.gl',
      '.bitly.ws',
      '.sbs',
      '.bubbleapps.io',
    ];
    return !blocked.some((d) => uri.hostname.includes(d));
  } catch (err) {
    return false;
  }
};

const expireAtValidator = (value: string) => {
  if (!value || !value.length) return true;
  const expireAt = dayjs(value).unix();
  if (expireAt <= dayjs().add(5, 'minutes').unix()) {
    return false;
  }
  return true;
};

const imageUrlValidator = (url: string): boolean => {
  if (!url) return true;
  const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const image = url.split('?')[0].toLowerCase();
  // Check if image ends with any of the supported extensions
  return supportedExtensions.some((extension) =>
    image.endsWith(`.${extension}`)
  );
};

export const linkSchema = z
  .object({
    key: z.string().max(32).optional().openapi({
      example: 'github',
      description:
        'To provide custom aliases for short links. It will be auto-generated if not provided',
    }),
    project_id: z.number().positive().optional().nullable().openapi({
      example: 1,
      description: 'To create a short link within a project',
    }),
    url: z
      .string()
      .min(10)
      .url()
      .refine((value) => urlValidator(value), {
        message: 'blocked',
      })
      .openapi({
        example: 'https://github.com/dayschedule/idm',
        description: 'A valid destination URL to generate a short link',
      }),
    expire_at: z
      .string()
      .datetime()
      .optional()
      .refine((value) => expireAtValidator(value), {
        message: 'Must be greater then current date time + 5 minutes or empty',
      })
      .openapi({
        default: null,
        example: '2023-20-12T08:40:00',
        description:
          'To expire the short link automatically on a given date time, or leave blank for no expiration.',
      }),
    params: z
      .record(z.string())
      .optional()
      .openapi({
        example: {
          utm_source: 'ads',
        },
        description: 'UTM parameters for conversion tracking',
      }),
    title: z.string().max(60).nullable().optional().openapi({
      example: 'Social media preview title',
    }),
    description: z.string().max(155).nullable().optional().openapi({
      example: 'Social media preview description',
    }),
    image: z
      .string()
      .url()
      .nullable()
      .optional()
      .or(z.literal(''))
      .refine((value) => imageUrlValidator(value), {
        message: 'Image url must ends with .jpg, .png etc',
      })
      .openapi({
        example: 'https://example.com/banner.png',
      }),
    password: z.string().max(32).nullable().optional().openapi({
      example: '***',
      description:
        'To restrict access of your [short link with a custom password](https://idm.in/docs/t/how-to-create-password-protected-short-links/413)',
    }),
    ios: z
      .string()
      .url()
      .nullable()
      .optional()
      .or(z.literal(''))
      .refine((value) => urlValidator(value), {
        message: 'blocked',
      })
      .openapi({
        example:
          'https://apps.apple.com/us/app/dayschedule-appointment-app/id6444792037',
        description:
          'A valid URL to redirect the iOS users to a different link. e.g your iOS app on Apple App store.',
      }),
    android: z
      .string()
      .url()
      .nullable()
      .optional()
      .or(z.literal(''))
      .refine((value) => urlValidator(value), {
        message: 'blocked',
      })
      .openapi({
        example:
          'https://play.google.com/store/apps/details?id=com.dayschedule',
        description:
          'A valid URL to redirect the Android users to a different link. e.g your android app on Playstore.',
      }),
    geo: z
      .array(
        z.object({
          country: z.string().length(2).nullable().openapi({
            example: 'US',
            description: 'ISO 2 country code',
          }),
          url: z
            .string()
            .url()
            .refine((value) => urlValidator(value), {
              message: 'blocked',
            }),
        })
      )
      .max(195)
      .nullable()
      .optional()
      .default([])
      .openapi({
        example: [
          {
            country: 'UK',
            url: 'https://example.co.uk',
          },
          {
            country: 'IN',
            url: 'https://example.in',
          },
        ],
        description:
          'To enable the [geographic targeting short links](https://idm.in/docs/t/how-to-create-geo-targeted-short-links/414) and redirect users based on their location',
      }),
    created_at: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: new Date().toISOString(), readOnly: true }),
    updated_at: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: new Date().toISOString(), readOnly: true }),
  })
  .openapi('Links');
