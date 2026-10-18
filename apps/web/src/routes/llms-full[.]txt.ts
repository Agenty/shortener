import { createFileRoute } from '@tanstack/react-router';
import { docPath, docs } from '@/lib/docs';
import { SITE_URL } from '@/lib/site';

/** Every docs page as one markdown file, for LLMs that read the docs in a single request */
export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: () => {
        const body = docs
          .map(
            (doc) =>
              `# ${doc.title}\n\nSource: ${SITE_URL}${docPath(doc.slug)}\n\n${doc.description}\n\n${doc.body.trim()}`
          )
          .join('\n\n---\n\n');

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
