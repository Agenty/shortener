import { MiddlewareHandler } from 'hono';

export const cached = (): MiddlewareHandler => {
  const options = {
    wait: false,
    cacheName: 'default',
  };

  const dictionary = {
    '/docs': 86400,
    '/v1/analytics': 10,
    '/v1': 5,
    '/': 3600,
  };

  const addHeader = (response: Response, ttl = 5) => {
    if (ttl) {
      response.headers.set('Cache-Control', `max-age=${ttl}`);
    }
  };

  return async function cached(c, next) {
    // Generate custom key with auth header
    const headerToken = c.req.header('Authorization');
    const uri = new URL(c.req.url);
    uri.searchParams.set('authtoken', headerToken);
    const key = uri.toString();

    const cache = await caches.open(options.cacheName);
    const response = await cache.match(key);
    if (!response) {
      await next();
      if (!c.res.ok || c.env.ENVIRONMENT == 'development') {
        return;
      }

      const ttl = c.req.url.includes('v1/') ? 5 : 3600;
      addHeader(c.res, ttl);
      const response = c.res.clone();
      if (options.wait) {
        await cache.put(key, response);
      } else {
        c.executionCtx.waitUntil(cache.put(key, response));
      }
    } else {
      return new Response(response.body, response);
    }
  };
};
