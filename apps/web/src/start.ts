import { createMiddleware, createStart } from '@tanstack/react-start';
import { OPENAPI_URL } from '@/lib/site';

/**
 * RFC 8288 `Link` header on every page, so agents can find the API catalog,
 * OpenAPI spec, llms.txt and agent skills without parsing HTML
 */
const DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  `<${OPENAPI_URL}>; rel="service-desc"; type="application/vnd.oai.openapi+json"`,
  '</docs/api>; rel="service-doc"; type="text/html"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
].join(', ');

const discoveryHeaders = createMiddleware().server(async ({ next }) => {
  const result = await next();
  const { headers } = result.response;
  if (headers.get('content-type')?.includes('text/html')) {
    try {
      headers.append('Link', DISCOVERY_LINKS);
    } catch {
      // Some responses have immutable headers, skip them
    }
  }
  return result;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [discoveryHeaders],
}));
