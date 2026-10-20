import { OpenAPIHono, z } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { formatZodError } from './utility';

/** OpenAPIHono app that rejects invalid requests with a 400 HTTPException */
export const createApi = () =>
  new OpenAPIHono<{ Bindings: CloudflareBindings }>({
    defaultHook: (result) => {
      if (result.success === false) {
        throw new HTTPException(400, {
          message: formatZodError(result.error),
        });
      }
    },
  });

export const messageSchema = z
  .object({
    message: z.string().openapi({ example: 'Deleted successfully' }),
  })
  .openapi('Message');

const ERRORS = {
  400: ['Bad request, the request body or parameters are invalid', 'url: Invalid URL'],
  401: ['Unauthorized, the API key or bearer token is missing or invalid', 'Unauthorized'],
  402: ['Payment required, the current plan limit has been reached', 'The Free plan is limited to 50 links only, please upgrade'],
  403: ['Forbidden, the domain or resource is not allowed', 'Domain not verified: example.com'],
  404: ['Not found, no record exists with the given id', 'No data found'],
  428: ['Precondition required, the email address is not verified yet', 'Email not verified'],
  429: ['Too many requests, rate limit exceeded', 'Too many requests'],
} as const;

type ErrorStatus = keyof typeof ERRORS;

type ErrorResponse = {
  description: string;
  content: {
    'application/json': {
      schema: typeof messageSchema;
      example: { message: string };
    };
  };
};

/** Standard error responses documented for a route */
export const errorResponses = <S extends ErrorStatus>(...statuses: S[]) =>
  Object.fromEntries(
    statuses.map((status) => [
      status,
      {
        description: ERRORS[status][0],
        content: {
          'application/json': {
            schema: messageSchema,
            example: { message: ERRORS[status][1] },
          },
        },
      },
    ])
  ) as { [K in S]: ErrorResponse };

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: { name: 'id', in: 'path' },
    example: 1,
  }),
});
