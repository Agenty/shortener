import { createFileRoute } from '@tanstack/react-router';
import { getDoc } from '@/lib/docs';

/** Raw markdown of a docs page, e.g. `/docs/create-short-link.md`, for agents and LLMs */
export const Route = createFileRoute('/docs/{$slug}.md')({
  server: {
    handlers: {
      GET: ({ params }) => {
        const doc = getDoc(params.slug);
        if (!doc) return new Response('Not found', { status: 404 });
        const markdown = `# ${doc.title}\n\n${doc.description}\n\n${doc.body.trim()}\n`;
        return new Response(markdown, {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          },
        });
      },
    },
  },
});
