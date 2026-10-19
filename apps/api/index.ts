import { showRoutes } from 'hono/dev';
import { links } from './controllers/links.controller';
import { cors } from 'hono/cors';
import { auth } from './controllers/auth.controller';
import { users } from './controllers/users.controller';
import { accounts } from './controllers/accounts.controller';
import { profile } from './controllers/profile.controller';
import { apiKeys } from './controllers/apikeys.controller';
import { inlineSchemas, removeDomainInPaths, removeTagsInPaths } from './helper/utility';
import { analytics } from './controllers/analytics.controller';
import { subscription } from './controllers/subscription.controller';
import { jwtAuth } from './middleware/auth';
import { HTTPException } from 'hono/http-exception';
import { oauth } from './controllers/oauth.controller';
import { OpenAPIHono } from '@hono/zod-openapi';
import { reports } from './controllers/reports.controller';
import { webhook } from './controllers/webhook.controller';
import { admin } from './controllers/admin.controller';
import { otp } from './controllers/otp.controller';
import { publicApi } from './controllers/public.controller';
import { projects } from './controllers/projects.controller';
import { domains } from './controllers/domains.controller';
import { files } from './controllers/files.controller';
import { waitUntil } from 'cloudflare:workers';
import apiDescription from "./helper/api-description.txt";
import { rateLimit } from './middleware/rate-limit';
import { logger } from './middleware/logger';
import { getLinkForRedirect, getRedirectUrl } from './services/links.service';
import { passwordPage, redirectPage, unavailablePage } from './helper/redirect-page';

/** Short link paths, e.g. /summer-sale */
const SHORT_LINK_PATH = /^\/[a-zA-Z0-9-]{1,32}$/;

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

app.onError(async (err, ctx) => {
  if (err instanceof HTTPException) {
    return ctx.json({ message: err.message }, err.status);
  } else if (
    err.message.includes("D1_ERROR") &&
    err.message.includes("FOREIGN KEY constraint failed")
  ) {
    return ctx.json({ message: "Invalid reference id in request body" }, 400);
  } else if (err instanceof URIError) {
    return ctx.json({ message: err.message }, 400);
  }
  // Report as an uncaught exception in Cloudflare logs without failing the response
  waitUntil(Promise.reject(err));
  const data =
    ctx.env.ENVIRONMENT == "production"
      ? {
        message:
          "Server error, the issue has been reported to administrator. If you still need help, contact support@shortener.dev",
      }
      : {
        message: err.message,
        stack: err.stack,
      };
  return ctx.json(data, 500);
});

// CORS Caching for preflight requests
app.use(
  "*",
  cors({
    origin: (origin, ctx) => {
      if (!origin) return origin;

      try {
        const hostname = new URL(origin).hostname;
        const allowed =
          hostname === "localhost" ||
          hostname === "shortener.dev" ||
          hostname.endsWith(".shortener.dev");

        if (allowed || ctx.req.path === "/mcp") {
          return origin;
        }

        const allowedPaths = ["/v1/public", "/openapi.json"];

        if (allowedPaths.some((path) => ctx.req.path.startsWith(path))) {
          return origin;
        }
      } catch { }

      return "https://app.shortener.dev";
    },
    maxAge: 86400 * 7,
    credentials: true,
  }),
);

// Rate limit
const rateLimitMiddleware = rateLimit({
  getRateLimitKey: (c) => c.req.header("cf-connecting-ip") ?? "unknown",
});
// Short link redirects are public traffic, skip rate limit
app.use("*", (ctx, next) =>
  SHORT_LINK_PATH.test(ctx.req.path) ? next() : rateLimitMiddleware(ctx, next),
);

// Healthcheck
app.get("/healthcheck", async (ctx) => {
  return ctx.json({ healthy: true }, 200);
});

// API specification
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  description: "API key or bearer token from sign in",
});

app.get("/openapi.json", async (ctx) => {
  const apiSpecs = app.getOpenAPIDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "URL Shortener API",
      description: apiDescription,
    },
    security: [{ Bearer: [] }],
    tags: [
      {
        name: "Links",
        description:
          "Create, update and manage short links with custom alias, UTM parameters, expiration, password protection, app deep links and geo-targeting",
      },
      {
        name: "Domains",
        description:
          "Add and verify the domains you own. Short links can be created only for destination URLs on verified or whitelisted domains",
      },
      {
        name: "Projects",
        description: "Organize short links by campaign, client or brand",
      },
      {
        name: "Analytics",
        description:
          "Click analytics of short links by date, referrer, country, city, browser, OS and device",
      },
      {
        name: "Reports",
        description: "Raw click log export with visitor details",
      },
      {
        name: "Users",
        description: "Manage team members of your account",
      },
    ],
    servers: [
      {
        url: "https://api.shortener.dev/v1",
        description: "API",
      },
    ],
  });
  const publicSpecs = inlineSchemas(
    removeTagsInPaths(removeDomainInPaths(apiSpecs), ["API Keys", "Authentication", "Tools"]),
  );
  return ctx.json(publicSpecs, {
    headers: {
      "Cache-Control": `max-age=3600, s-maxage=7200`,
    },
  });
});

// Public API
app.route(`/v1/public`, publicApi);
app.route(`/v1/auth`, auth);
app.route(`/v1/oauth`, oauth);
app.route(`/webhook`, webhook);

// Authentication middleware
app.use(jwtAuth());
app.use('*', logger('api.shortener.dev'));

// All API controllers
app.route(`/v1/links`, links);
app.route(`/v1/files`, files);
app.route(`/v1/projects`, projects);
app.route(`/v1/domains`, domains);
app.route(`/v1/analytics`, analytics);
app.route(`/v1/reports`, reports);
app.route(`/v1/users`, users);
app.route(`/v1/profile`, profile);
app.route(`/v1/accounts`, accounts);
app.route(`/v1/apikeys`, apiKeys);
app.route(`/v1/subscription`, subscription);
app.route(`/v1/otp`, otp);
app.route(`/v1/admin`, admin);

// Short link redirect, e.g. srt1.link/summer-sale
app.notFound(async (ctx) => {
  if (!SHORT_LINK_PATH.test(ctx.req.path)) {
    return ctx.json(
      { error: "No routes found", url: ctx.req.url, path: ctx.req.path },
      404,
    );
  }

  const key = ctx.req.path.slice(1).toLowerCase();
  const link = await getLinkForRedirect(ctx.env, key);
  if (!link || !link.is_enabled) {
    return ctx.html(unavailablePage("not-found"), 404);
  }

  if (link.expire_at && new Date(link.expire_at) <= new Date()) {
    return ctx.html(unavailablePage("expired"), 410);
  }

  // Password protected link, ask for password and verify on form post
  if (link.password) {
    if (ctx.req.method !== "POST") {
      return ctx.html(passwordPage(false), 200, { "Cache-Control": "no-store" });
    }
    const { password } = await ctx.req.parseBody();
    if (password !== link.password) {
      return ctx.html(passwordPage(true), 401, { "Cache-Control": "no-store" });
    }
  }

  const url = getRedirectUrl(
    link,
    ctx.req.header("user-agent"),
    ctx.req.raw.cf?.country as string | undefined,
  );
  
  return ctx.html(redirectPage(url), 200, {
    "Cache-Control": "no-store",
  });
});

// Print all routes
showRoutes(app);

export default {
  fetch: app.fetch,

  async queue(batch: MessageBatch, env: CloudflareBindings, ctx: ExecutionContext) {
    for (const message of batch.messages) {
      // Implement message processing 
      message.ack();
    }
  }
}
