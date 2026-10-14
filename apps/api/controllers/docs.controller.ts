import { SiteData } from '../models/siteData';
import { getPost, getSite } from '../services/discourse.service';
import { Docs } from '../theme/docs';
import { ApiDocs } from '../theme/api-docs';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings } from '../types/bindings';
import { Context } from 'hono';

const docs = new OpenAPIHono();

// The OpenAPI documentation will be available at swagger-json
docs.get('/api', async (ctx) => {
  const props: SiteData = {
    meta: {
      title: 'URL shortener API',
      description:
        'URL shortener API to generate short url from long hyperlinks using Python, C#, Java, Node.js etc with click reports, analytics and QR code',
      canonical: '/docs/api',
    },
  };
  return ctx.html(ApiDocs(props));
});

docs.get(
  '/*',
  async (
    ctx: Context<{
      Bindings: Bindings;
    }>
  ) => {
    const uri = new URL(ctx.req.url);
    let slug = uri.pathname;
    if (slug === '/docs') {
      slug = 't/getting-started-with-idm/402';
    } else if (slug === '/docs/change-log') {
      slug = 't/change-log/296';
    } else {
      slug = slug.replace('/docs', '');
    }
    const post = await getPost(ctx.env, slug);
    if (post && post.title) {
      const categories = await getSite(ctx.env);
      const article = post.post_stream.posts[0];
      // const template = slug == 't/change-log/296' ? 'change-log' : 'index';
      //const schema = this.discourseService.getSchema(post);
      const props: SiteData = {
        article: {
          categories: categories,
          title: post.title,
          content: article.html,
          posts: post.post_stream.posts,
        },
        meta: {
          title: post.title,
          description: article.description,
          image: post.image || post.image_url,
          canonical: `/docs/t/${post.slug}/${post.id}`
            .replace('/t/change-log/296', 'change-log')
            .replace('/t/getting-started-with-idm/402', ''),
        },
        //schema: schema,
      };
      return ctx.html(Docs(props));
    }
    return ctx.json({ message: `No page found` }, 404);
  }
);

export { docs };
