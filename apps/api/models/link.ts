import { z } from '@hono/zod-openapi';
import { addMinutes, getUnixTime } from 'date-fns';
import { isBlockedHost, parseHost } from './domain';

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
    const host = parseHost(uri.href);
    return !host || !isBlockedHost(host);
  } catch (err) {
    return false;
  }
};

const expireAtValidator = (value: string) => {
  if (!value || !value.length) return true;
  const expireAt = getUnixTime(new Date(value));
  if (expireAt <= getUnixTime(addMinutes(new Date(), 5))) {
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

const destinationUrl = z
  .url()
  .refine((value) => urlValidator(value), {
    message: 'blocked',
  });

const optionalDestinationUrl = destinationUrl
  .nullable()
  .optional()
  .or(z.literal(''));

export const geoSchema = z
  .object({
    country: z.string().length(2).nullable().openapi({
      example: 'US',
      description: 'ISO 3166-1 alpha-2 country code of the visitor',
    }),
    url: destinationUrl.openapi({
      example: 'https://example.com/us',
      description: 'Destination URL for visitors from this country',
    }),
  })
  .openapi('GeoTarget');

export type Geo = z.infer<typeof geoSchema>;

export const linkSchema = z
  .object({
    key: z.string().max(32).optional().openapi({
      example: 'summer-sale',
      description:
        'Custom alias (back-half) of the short URL, e.g. `shortener.dev/summer-sale`. Auto-generated when not provided',
    }),
    project_id: z.number().int().positive().optional().nullable().openapi({
      example: 1,
      description: 'Project to organize the short link in',
    }),
    url: z
      .url()
      .min(10)
      .refine((value) => urlValidator(value), {
        message: 'blocked',
      })
      .openapi({
        example: 'https://example.com/blog/url-shortener-guide',
        description:
          'Long destination URL to shorten. The domain must be [verified](#tag/Domains) in your account or whitelisted',
      }),
    short_url: z.string().optional().openapi({
      example: 'https://shortener.dev/summer-sale',
      description: 'The generated short URL to share',
      readOnly: true,
    }),
    expire_at: z
      .iso.datetime({ offset: true, local: true })
      .optional()
      .nullable()
      .refine((value) => expireAtValidator(value), {
        message: 'Must be greater then current date time + 5 minutes or empty',
      })
      .openapi({
        example: '2030-12-31T23:59:00Z',
        description:
          'Expire the short link automatically at this UTC date-time. Leave empty for a link that never expires',
      }),
    params: z
      .record(z.string(), z.string())
      .optional()
      .openapi({
        example: { utm_source: 'newsletter', utm_medium: 'email' },
        description:
          'UTM parameters appended to the destination URL for campaign conversion tracking in Google Analytics',
      }),
    title: z.string().max(60).nullable().optional().openapi({
      example: 'The complete guide to URL shortening',
      description: 'Social media preview (Open Graph) title',
    }),
    description: z.string().max(155).nullable().optional().openapi({
      example: 'Learn how to create branded short links and track clicks.',
      description: 'Social media preview (Open Graph) description',
    }),
    image: z
      .url()
      .nullable()
      .optional()
      .or(z.literal(''))
      .refine((value) => imageUrlValidator(value), {
        message: 'Image url must ends with .jpg, .png etc',
      })
      .openapi({
        example: 'https://example.com/images/og-banner.png',
        description:
          'Social media preview (Open Graph) image URL. Must end with .jpg, .png, .gif, .bmp or .webp',
      }),
    password: z.string().max(32).nullable().optional().openapi({
      example: 's3cret',
      description:
        'Restrict access with a [password protected short link](https://shortener.dev/docs/t/how-to-create-password-protected-short-links/413)',
    }),
    ios: optionalDestinationUrl.openapi({
      example: 'https://apps.apple.com/us/app/example/id000000000',
      description:
        'Deep link for iPhone and iPad visitors, e.g. your app on the Apple App Store',
    }),
    android: optionalDestinationUrl.openapi({
      example: 'https://play.google.com/store/apps/details?id=com.example',
      description:
        'Deep link for Android visitors, e.g. your app on Google Play Store',
    }),
    geo: z
      .array(geoSchema)
      .max(195)
      .nullable()
      .optional()
      .default([])
      .openapi({
        description:
          'Redirect visitors by country with [geo-targeted short links](https://shortener.dev/docs/t/how-to-create-geo-targeted-short-links/414)',
      }),
    is_enabled: z
      .union([z.boolean(), z.number().int().min(0).max(1)])
      .optional()
      .openapi({
        example: true,
        description: 'Disabled short links stop redirecting visitors',
      }),
    created_at: z.string().nullable().optional().openapi({
      example: '2026-01-01T10:00:00Z',
      description: 'UTC date-time when the short link was created',
      readOnly: true,
    }),
    updated_at: z.string().nullable().optional().openapi({
      example: '2026-01-02T10:00:00Z',
      description: 'UTC date-time when the short link was last updated',
      readOnly: true,
    }),
  })
  .openapi('Link', {
    description:
      'A short link that redirects visitors to a long destination URL, with optional UTM tracking, expiration, password, app deep links and geo-targeting',
  });

export type Link = z.infer<typeof linkSchema> & {
  account_id?: number;
  user_id?: number;
  name?: string;
  type?: string;
  data?: Record<string, any>;
};
