// https://developers.cloudflare.com/workers/examples/cache-post-request/

import { Bindings } from '../types/bindings';

const getCacheKey = (env: Bindings, key: string) => {
  const cacheUrl = new URL(env.API_URL);
  cacheUrl.pathname = '/cache/' + key;
  const url = cacheUrl.toString().split('?')[0];
  return new Request(url, {
    method: 'GET',
  });
};

export const getCache = async (env: Bindings, key: string) => {
  const cacheKey = getCacheKey(env, key);
  const cache = caches.default;
  const response = await cache.match(cacheKey);
  if (response) {
    return await response.json();
  }
};

export const setCache = async (env: Bindings, key: string, data: any) => {
  const cacheKey = getCacheKey(env, key);
  const cache = caches.default;
  const response = new Response(JSON.stringify(data), {
    status: 200,
  });
  response.headers.append('Cache-Control', 's-maxage=30');
  await cache.put(cacheKey, response);
};
