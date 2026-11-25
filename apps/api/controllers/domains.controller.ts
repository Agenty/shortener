import { AuthUser } from '../models/auth-user';
import { createRoute, z } from '@hono/zod-openapi';
import { pagedSchema } from '../models/paged';
import {
  archiveDomain,
  createDomain,
  getDomainById,
  getDomainCount,
  getDomains,
  getSearchConsoleConsentUri,
  getStateSecret,
  getWhitelistedDomains,
  sendDomainOtp,
  updateDomain,
  verifyDomainOtp,
} from '../services/domain.service';
import { HTTPException } from 'hono/http-exception';
import {
  Domain,
  domainOtpSchema,
  domainSchema,
  domainVerifySchema,
  globalDomainSchema,
} from '../models/domain';
import {
  createApi,
  errorResponses,
  idParamSchema,
  messageSchema,
} from '../helper/openapi';
import { API_SAMPLES } from '../helper/api-samples';
import { tableSchema, toTableResult } from '../models/table';
import { addMinutes, getUnixTime } from 'date-fns';
import { sign } from 'hono/jwt';

const domains = createApi();

const domainUpdateSchema = domainSchema
  .pick({ user_id: true, is_default: true })
  .openapi('DomainUpdate');

const getUnverifiedDomain = async (
  env: CloudflareBindings,
  authUser: AuthUser,
  id: number
): Promise<Domain> => {
  const domain = await getDomainById(env, id, authUser);
  if (!domain) {
    throw new HTTPException(404, { message: `No domain found with id: ${id}` });
  }
  if (domain.is_verified) {
    throw new HTTPException(400, {
      message: `The domain ${domain.domain} is already verified`,
    });
  }
  return domain;
};

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'get',
    path: '/',
    summary: 'List domains',
    description:
      'Get all domains added to your account with their ownership verification status. Short links can be created only for destination URLs on verified domains.',
    request: {
      query: pagedSchema.pick({ offset: true, limit: true }),
    },
    responses: {
      200: {
        description: 'Paginated list of domains',
        content: {
          'application/json': {
            schema: tableSchema(domainSchema),
          },
        },
      },
      ...errorResponses(401),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const { offset, limit } = ctx.req.valid('query');
    const data = await getDomains(ctx.env, authUser, offset, limit);
    return ctx.json(toTableResult(data, offset, limit), 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'post',
    path: '/',
    summary: 'Add a domain',
    description:
      'Add a domain you own to your account. Then verify the ownership with an email OTP sent to an address on that domain, or with Google Search Console, to create short links for it. The number of domains is limited by your plan.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: domainSchema,
            example: API_SAMPLES.domains.post,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The added (unverified) domain',
        content: {
          'application/json': {
            schema: domainSchema,
          },
        },
      },
      ...errorResponses(400, 401, 402),
    } as any,
  }),
  async (ctx) => {
    const authUser: AuthUser = ctx.req['user'];
    const domain = ctx.req.valid('json') as Domain;
    const totalDomains = await getDomainCount(ctx.env, authUser, domain.domain);
    if (totalDomains >= authUser.domains_limit) {
      throw new HTTPException(402, {
        message: `The ${authUser.plan} plan is limited to ${authUser.domains_limit} domains only, including removed domains, please upgrade`,
      });
    }
    const result = await createDomain(ctx.env, authUser, domain);
    return ctx.json(result, 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'get',
    path: '/whitelisted',
    summary: 'List whitelisted domains',
    description:
      'Popular domains (e.g. `linkedin.com`, `youtube.com`) allowed for every account without ownership verification, including their subdomains.',
    responses: {
      200: {
        description: 'List of whitelisted domains',
        content: {
          'application/json': {
            schema: tableSchema(globalDomainSchema),
          },
        },
      },
      ...errorResponses(401),
    } as any,
  }),
  async (ctx) => {
    const data = await getWhitelistedDomains(ctx.env);
    return ctx.json(toTableResult(data, 0, data.length), 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'get',
    path: '/{id}',
    summary: 'Get a domain',
    description: 'Retrieve a domain and its ownership verification status.',
    request: {
      params: idParamSchema,
    },
    responses: {
      200: {
        description: 'The domain',
        content: {
          'application/json': {
            schema: domainSchema,
          },
        },
      },
      ...errorResponses(401, 404),
    } as any,
  }),
  async (ctx) => {
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const data = await getDomainById(ctx.env, id, authUser);
    if (!data) {
      throw new HTTPException(404, {
        message: `No domain found with id: ${id}`,
      });
    }
    return ctx.json(data, 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'put',
    path: '/{id}',
    summary: 'Update a domain',
    description:
      'Assign the domain to another team member or set it as default. The domain name itself cannot be changed, remove and add it again instead.',
    request: {
      params: idParamSchema,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: domainUpdateSchema,
            example: API_SAMPLES.domains.put,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The updated domain',
        content: {
          'application/json': {
            schema: domainSchema,
          },
        },
      },
      ...errorResponses(400, 401, 404),
    } as any,
  }),
  async (ctx) => {
    const data = ctx.req.valid('json');
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const result = await updateDomain(ctx.env, authUser, id, data);
    if (!result) {
      throw new HTTPException(404, {
        message: `No domain found with id: ${id}`,
      });
    }
    return ctx.json(result, 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'delete',
    path: '/{id}',
    summary: 'Remove a domain',
    description:
      'Remove a domain from your account. New short links to this domain cannot be created until it is added and verified again. Removed domains are archived for audit and still count towards the domain limit of your plan. Adding a removed domain again restores it.',
    request: {
      params: idParamSchema,
    },
    responses: {
      200: {
        description: 'Domain removed',
        content: {
          'application/json': {
            schema: messageSchema,
          },
        },
      },
      ...errorResponses(401, 404),
    } as any,
  }),
  async (ctx) => {
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const isArchived = await archiveDomain(ctx.env, authUser, id);
    if (!isArchived) {
      throw new HTTPException(404, {
        message: `No domain found with id: ${id}`,
      });
    }
    return ctx.json({ message: 'Domain removed successfully' }, 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'post',
    path: '/{id}/otp',
    summary: 'Send domain verification code',
    description:
      'Send a 6-digit one-time code to an email address on the domain (e.g. `admin@example.com` for `example.com`) to prove the domain ownership. The code is valid for 10 minutes. Public and disposable email providers are not accepted.',
    request: {
      params: idParamSchema,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: domainOtpSchema,
            example: API_SAMPLES.domains.otp,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Verification code sent',
        content: {
          'application/json': {
            schema: messageSchema,
          },
        },
      },
      ...errorResponses(400, 401, 404, 429),
    } as any,
  }),
  async (ctx) => {
    const { id } = ctx.req.valid('param');
    const { email } = ctx.req.valid('json');
    const authUser: AuthUser = ctx.req['user'];
    const domain = await getUnverifiedDomain(ctx.env, authUser, id);
    await sendDomainOtp(ctx.env, authUser, domain, email);
    return ctx.json({ message: `Verification code sent to ${email}` }, 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'post',
    path: '/{id}/verify',
    summary: 'Verify domain with code',
    description:
      'Verify the domain ownership with the 6-digit code received by email. Once verified, short links can be created for the domain and all of its subdomains.',
    request: {
      params: idParamSchema,
      body: {
        required: true,
        content: {
          'application/json': {
            schema: domainVerifySchema,
            example: API_SAMPLES.domains.verify,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The verified domain',
        content: {
          'application/json': {
            schema: domainSchema,
          },
        },
      },
      ...errorResponses(400, 401, 404),
    } as any,
  }),
  async (ctx) => {
    const { id } = ctx.req.valid('param');
    const { code } = ctx.req.valid('json');
    const authUser: AuthUser = ctx.req['user'];
    const domain = await getUnverifiedDomain(ctx.env, authUser, id);
    await verifyDomainOtp(ctx.env, authUser, domain, code);
    const result = await getDomainById(ctx.env, id, authUser);
    return ctx.json(result, 200);
  }
);

domains.openapi(
  createRoute({
    tags: ['Domains'],
    method: 'get',
    path: '/{id}/google',
    summary: 'Verify domain with Google Search Console',
    description:
      'Get a Google sign-in URL to verify the domain ownership with Google Search Console. Open the URL in a browser and sign in with a Google account that owns the domain property (`sc-domain:example.com`) or the `https://example.com/` URL-prefix property. You will be redirected back to the app after verification.',
    request: {
      params: idParamSchema,
    },
    responses: {
      200: {
        description: 'Google consent URL to open in the browser',
        content: {
          'application/json': {
            schema: z.object({
              url: z.url().openapi({
                example: 'https://accounts.google.com/o/oauth2/v2/auth?...',
              }),
            }),
          },
        },
      },
      ...errorResponses(400, 401, 404),
    } as any,
  }),
  async (ctx) => {
    const { id } = ctx.req.valid('param');
    const authUser: AuthUser = ctx.req['user'];
    const domain = await getUnverifiedDomain(ctx.env, authUser, id);
    const state = await sign(
      {
        purpose: 'domain-verification',
        domain_id: domain.domain_id,
        account_id: authUser.account_id,
        user_id: authUser.user_id,
        exp: getUnixTime(addMinutes(new Date(), 10)),
      },
      getStateSecret(ctx.env)
    );
    return ctx.json({ url: getSearchConsoleConsentUri(ctx.env, state) }, 200);
  }
);

export { domains };
