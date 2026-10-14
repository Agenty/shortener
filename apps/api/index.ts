import { handle } from 'hono/cloudflare-pages';
import { showRoutes } from 'hono/dev';
import { Bindings } from './types/bindings';
import { website } from './controllers/website.controller';
import { links } from './controllers/links.controller';
import { cors } from 'hono/cors';
import { auth } from './controllers/auth.controller';
import { users } from './controllers/users.controller';
import { accounts } from './controllers/accounts.controller';
import { profile } from './controllers/profile.controller';
import { apiKeys } from './controllers/apikeys.controller';
import { getPath } from 'hono/utils/url';
import { getFileExtension, removeDomainInPaths } from './helper/utility';
import { analytics } from './controllers/analytics.controller';
import { docs } from './controllers/docs.controller';
import { subscription } from './controllers/subscription.controller';
import { jwtAuth } from './middleware/auth';
import { HTTPException } from 'hono/http-exception';
import { cached } from './middleware/cached';
import { oauth } from './controllers/oauth.controller';
import { OpenAPIHono } from '@hono/zod-openapi';
import { reports } from './controllers/reports.controller';
import { webhook } from './controllers/webhook.controller';
import { admin } from './controllers/admin.controller';
import { otp } from './controllers/otp.controller';
import { meta } from './controllers/meta.controller';
import { tools } from './controllers/tools.controller';
import { redirectHandler } from './services/redirect.service';
import { projects } from './controllers/projects.controller';
import { domains } from './controllers/domains.controller';
import { qrCodes } from './controllers/qrcodes.controller';
import { files } from './controllers/files.controller';
import { pages } from './controllers/pages.controller';
import { tryApi } from './controllers/try.controller';
import { sysAlertEmail } from './services/emailer.service';
import { ExecutionContext } from 'hono';

const API_URL = 'api.idm.in';
const WEBSITE_URL = 'idm.in';
const APP_URL = 'app.idm.in';

const app = new OpenAPIHono<{ Bindings: Bindings }>({
  getPath: (req, ctx: { env: Bindings }) => {
    const path = getPath(req);
    let host = req.headers.get('Host');
    if (ctx.env.ENVIRONMENT == 'development') {
      if (path.startsWith('/v1')) {
        host = API_URL;
      } else {
        host = WEBSITE_URL;
      }
    }
    // validate the value of the host header, if necessary.
    return `/${host}${path === '/' ? '' : path}`;
  },
});

app.onError(async (err, ctx) => {
  if (err instanceof HTTPException) {
    return ctx.json({ message: err.message }, err.status);
  } else if (err instanceof URIError) {
    return ctx.json({ message: err.message }, 400);
  } else {
    console.log(`Server error`, err);
    if (ctx.env.ENVIRONMENT != 'development') {
      const { url, method } = ctx.req.raw;
      let jsonBody = '';
      if (method == 'POST' || method == 'PUT') {
        try {
          jsonBody = await ctx.req.text();
        } catch { }
      }
      const logs = {
        url: url,
        method: method,
        data: jsonBody,
        stack: err.stack,
        cause: err.cause,
      };
      await sysAlertEmail(ctx.env, logs);
    }
    return ctx.json({ message: 'Server error' }, 500);
  }
});

// Caching middleware
app.get('*', cached());
app.get(`/${WEBSITE_URL}/docs/swagger-json`, async (ctx) => {
  const { url } = ctx.req.raw;
  const uri = new URL(url);
  uri.pathname = '/static/api.md';
  const assetReq = new Request(uri.toString(), {
    cf: {
      cacheEverything: true,
      cacheTtl: ctx.env.ENVIRONMENT == 'development' ? 0 : 60 * 60 * 24,
    },
  });
  const apiMdRequest = await ctx.env.ASSETS.fetch(assetReq, {});
  const swaggerJson = app.getOpenAPIDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'URL shortener API',
      description: await apiMdRequest.text(),
    },
    servers: [
      {
        url: 'https://api.idm.in/v1',
        description: 'API',
      },
    ],
  });
  return ctx.json(removeDomainInPaths(swaggerJson));
});

app.route(`/${WEBSITE_URL}/docs`, docs);
app.route(`/${WEBSITE_URL}/tools`, tools);
app.route(`/${WEBSITE_URL}`, website);

// API Routes
app.use(
  `/${API_URL}/v1/*`,
  cors({
    origin: (origin) => {
      return origin.indexOf('localhost') > 0 ||
        origin.endsWith('.idm.in') ||
        origin.startsWith('chrome-extension://') ||
        origin.includes('lovable.')
        ? origin
        : 'https://idm.in';
    },
    maxAge: 86400 * 7,
    credentials: true,
  })
);

// Public API
app.route(`/${API_URL}/v1/try`, tryApi);
app.route(`/${API_URL}/v1/meta`, meta);
app.route(`/${API_URL}/v1/auth`, auth);
app.route(`/${API_URL}/v1/oauth`, oauth);
app.route(`/${API_URL}/v1/webhook`, webhook);
app.route(`/${API_URL}/webhook`, webhook);

// Authentication middleware
app.use(jwtAuth());

// All API controllers
app.route(`/${API_URL}/v1/links`, links);
app.route(`/${API_URL}/v1/qrcodes`, qrCodes);
app.route(`/${API_URL}/v1/pages`, pages);
app.route(`/${API_URL}/v1/files`, files);
app.route(`/${API_URL}/v1/projects`, projects);
app.route(`/${API_URL}/v1/domains`, domains);
app.route(`/${API_URL}/v1/analytics`, analytics);
app.route(`/${API_URL}/v1/reports`, reports);
app.route(`/${API_URL}/v1/users`, users);
app.route(`/${API_URL}/v1/profile`, profile);
app.route(`/${API_URL}/v1/accounts`, accounts);
app.route(`/${API_URL}/v1/apikeys`, apiKeys);
app.route(`/${API_URL}/v1/subscription`, subscription);
app.route(`/${API_URL}/v1/otp`, otp);
app.route(`/${API_URL}/v1/admin`, admin);

app.notFound(async (ctx) => {
  const { path, method } = ctx.req;
  const { cf } = ctx.req.raw;
  if (method != 'GET') {
    return ctx.json({ error: 'No routes found' }, 404);
  }

  const crawlBots = ['GoogleBot', 'BingBot'];
  if (cf && crawlBots.includes(cf.asOrganization)) {
    return ctx.json({ message: 'Bot disallowed' }, 403);
  }

  try {
    return await redirectHandler(ctx, path);
  } catch (err) {
    return ctx.json({ error: 'Redirect error' }, 500);
  }
});

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};

// Print all routes
showRoutes(app);

export const onRequest = handle(app);
