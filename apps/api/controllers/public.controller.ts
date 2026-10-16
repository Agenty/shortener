import { createRoute, z } from '@hono/zod-openapi';
import { extractMetadata } from '../services/meta.service';
import { createApi, errorResponses } from '../helper/openapi';

const meta = createApi();

const metadataSchema = z
  .object({
    url: z.string().openapi({ example: 'https://example.com/blog/url-shortener-guide' }),
    title: z.string().optional().openapi({ example: 'The complete guide to URL shortening' }),
    description: z.string().optional().openapi({
      example: 'Learn how to create branded short links and track clicks.',
    }),
    image: z.string().optional().openapi({ example: 'https://example.com/og-banner.png' }),
    favicon: z.string().optional().openapi({ example: '/favicon.ico' }),
    author: z.string().optional(),
    domain: z.string().optional().openapi({ example: 'example.com' }),
    siteName: z.string().optional().openapi({ example: 'Example Blog' }),
  })
  .openapi('Metadata', {
    description: 'Open Graph and SEO meta tags of a web page',
  });

meta.openapi(
  createRoute({
    tags: ['Tools'],
    method: 'get',
    path: '/',
    summary: 'Get page metadata',
    description:
      'Extract the title, description, Open Graph image, favicon and site name of any web page. Use it to prefill the social media preview of a short link.',
    request: {
      query: z.object({
        url: z.url().openapi({
          example: 'https://example.com/blog/url-shortener-guide',
          description: 'Web page URL to extract meta tags from',
        }),
      }),
    },
    responses: {
      200: {
        description: 'Page metadata',
        content: {
          'application/json': {
            schema: metadataSchema,
          },
        },
      },
      ...errorResponses(400, 429),
    } as any,
  }),
  async (ctx) => {
    const { url } = ctx.req.valid('query');
    const json = await extractMetadata(url);
    return ctx.json(json, 200);
  }
);

export { meta };
