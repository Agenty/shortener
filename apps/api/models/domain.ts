import { z } from '@hono/zod-openapi';
import { parse } from 'tldts';
import { BLOCKED_DOMAINS, BLOCKED_TLDS } from '../data/blocked';
import { WHITELISTED_DOMAINS } from '../data/whitelisted';

/**
 * `user` domains belong to an account, `whitelisted` and `blocked` domains
 * are managed by admin and apply to every account (account_id is NULL)
 */
export enum DomainType {
  user = 'user',
  whitelisted = 'whitelisted',
  blocked = 'blocked',
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

export type ParsedHost = {
  /** `blog.example.co.uk` */
  hostname: string;
  /** Registrable domain, `example.co.uk` */
  domain: string;
  /** Last label, `uk` */
  tld: string;
  /** Hostname and its parents up to the registrable domain, used for lookups */
  candidates: Array<string>;
};

/** Extracts the hostname, registrable domain and TLD of a URL with tldts */
export const parseHost = (url: string): ParsedHost | undefined => {
  const { hostname, domain, publicSuffix, isIp } = parse(url.trim().toLowerCase());
  if (!hostname || !domain || !publicSuffix || isIp) return;
  const host = hostname.replace(/^www\./, '');
  // `a.blog.example.com` => [`a.blog.example.com`, `blog.example.com`, `example.com`]
  const labels = host.split('.');
  const depth = labels.length - domain.split('.').length + 1;
  return {
    hostname: host,
    domain,
    tld: publicSuffix.split('.').pop(),
    candidates: labels.slice(0, depth).map((_, i) => labels.slice(i).join('.')),
  };
};

export const isBlockedHost = (host: ParsedHost) =>
  BLOCKED_TLDS.has(host.tld) ||
  host.candidates.some((d) => BLOCKED_DOMAINS.has(d));

export const isWhitelistedHost = (host: ParsedHost) =>
  host.candidates.some((d) => WHITELISTED_DOMAINS.has(d));

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

export const globalDomainSchema = z
  .object({
    domain: domainName.openapi({
      type: 'string',
      example: 'linkedin.com',
      description:
        'Domain allowed (`whitelisted`) or denied (`blocked`) for every account, including its subdomains',
    }),
    type: z.enum([DomainType.whitelisted, DomainType.blocked]).openapi({
      example: DomainType.whitelisted,
    }),
    created_at: z.string().nullable().optional().openapi({ readOnly: true }),
    is_builtin: z.boolean().optional().openapi({
      description:
        'Whitelisted in code (popular domains), cannot be removed from the API',
      readOnly: true,
    }),
  })
  .openapi('GlobalDomain');

export type GlobalDomain = z.infer<typeof globalDomainSchema>;
