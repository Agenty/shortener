import { z } from '@hono/zod-openapi';
import { parse } from 'tldts';

export enum DomainVerificationMethod {
  email = 'email',
  google = 'google',
}

/** Normalizes `https://www.Example.com/path` into `example.com` */
export const normalizeDomain = (value: string): string | undefined => {
  const input = value.trim().toLowerCase();
  const { hostname, domain, isIp } = parse(
    input.includes('://') ? input : `https://${input}`
  );
  if (!hostname || !domain || isIp) return;
  return hostname.replace(/^www\./, '');
};

const domainName = z
  .string()
  .max(253)
  .transform((value, ctx) => {
    const domain = normalizeDomain(value);
    if (!domain) {
      ctx.addIssue({ code: 'custom', message: 'Invalid domain name' });
      return z.NEVER;
    }
    return domain;
  });

export const domainSchema = z
  .object({
    domain_id: z.number().int().optional().openapi({
      example: 1,
      description: 'Unique domain id',
      readOnly: true,
    }),
    user_id: z.number().int().nullable().optional().openapi({
      example: 1,
      description: 'Team member who owns this domain. Current user by default',
    }),
    domain: domainName.openapi({
      type: 'string',
      example: 'example.com',
      description:
        'Domain or subdomain you own, e.g. `example.com`. Verifying a domain also allows short links to all of its subdomains',
    }),
    is_default: z.union([z.boolean(), z.number()]).optional().openapi({
      example: false,
      description: 'Use as the default domain',
    }),
    is_verified: z.union([z.boolean(), z.number()]).optional().openapi({
      example: true,
      description:
        'Short links can be created only for destination URLs on verified domains',
      readOnly: true,
    }),
    verification_method: z.enum(DomainVerificationMethod).nullable().optional().openapi({
      example: DomainVerificationMethod.email,
      description:
        'How the ownership was verified: `email` OTP or `google` Search Console',
      readOnly: true,
    }),
    verified_at: z.string().nullable().optional().openapi({
      example: '2026-01-01T10:00:00Z',
      description: 'UTC date-time when the domain ownership was verified',
      readOnly: true,
    }),
    created_at: z.string().nullable().optional().openapi({
      example: '2026-01-01T10:00:00Z',
      description: 'UTC date-time when the domain was added',
      readOnly: true,
    }),
    updated_at: z.string().nullable().optional().openapi({
      example: '2026-01-02T10:00:00Z',
      description: 'UTC date-time when the domain was last updated',
      readOnly: true,
    }),
  })
  .openapi('Domain', {
    description:
      'A domain you own. Verify the ownership to shorten links pointing to it',
  });

export type Domain = z.infer<typeof domainSchema> & {
  account_id?: number;
  verified_email?: string | null;
};

export const domainOtpSchema = z
  .object({
    email: z.email().max(100).openapi({
      example: 'admin@example.com',
      description:
        'An email address on the same domain, e.g. `admin@example.com` for `example.com`. A 6-digit verification code is sent to it',
    }),
  })
  .openapi('DomainOtp');

export type DomainOtp = z.infer<typeof domainOtpSchema>;

export const domainVerifySchema = z
  .object({
    code: z.coerce.number().int().min(100000).max(999999).openapi({
      example: 123456,
      description: 'The 6-digit code received on the domain email address',
    }),
  })
  .openapi('DomainVerify');

export type DomainVerify = z.infer<typeof domainVerifySchema>;

export const whitelistSchema = z
  .object({
    domain: domainName.openapi({
      type: 'string',
      example: 'linkedin.com',
      description:
        'Domain allowed for every account without verification, e.g. popular social networks',
    }),
    created_at: z.string().nullable().optional().openapi({ readOnly: true }),
  })
  .openapi('WhitelistedDomain');

export type WhitelistedDomain = z.infer<typeof whitelistSchema>;
