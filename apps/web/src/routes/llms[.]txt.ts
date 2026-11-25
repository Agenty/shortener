import { createFileRoute } from '@tanstack/react-router';
import { DOC_SECTIONS, docs } from '@/lib/docs';
import { OPENAPI_URL, SITE_URL } from '@/lib/site';

/** https://llmstxt.org index of the docs, linking the markdown version of each page */
export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () => {
        const sections = DOC_SECTIONS.map((section) => {
          const items = docs
            .filter((doc) => doc.section === section)
            .map((doc) => `- [${doc.title}](${SITE_URL}/docs/${doc.slug}.md): ${doc.description}`);
          return items.length ? `## ${section}\n\n${items.join('\n')}` : '';
        }).filter(Boolean);

        const body = [
          '# Shortener.dev',
          '> URL shortener with click analytics. Create short links with custom back-halves, UTM parameters, expiration, passwords, iOS and Android app targeting and geo targeting, from the dashboard or the REST API.',
          `Destination URLs must be on a domain verified in the account or on the global whitelist. The API base URL is https://api.shortener.dev/v1 and requests authenticate with \`Authorization: Bearer <API key>\`.`,
          ...sections,
          [
            '## API',
            '',
            `- [OpenAPI spec](${OPENAPI_URL}): Machine-readable spec of every endpoint`,
            `- [API reference](${SITE_URL}/docs/api): Interactive reference`,
            `- [Agent skill](${SITE_URL}/.well-known/agent-skills/SKILL.md): How an AI agent should use the API`,
          ].join('\n'),
          ['## Optional', '', `- [Full docs](${SITE_URL}/llms-full.txt): Every docs page in one file`].join('\n'),
        ].join('\n\n');

        return new Response(`${body}\n`, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          },
        });
      },
    },
  },
});
