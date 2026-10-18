import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { DocPage, docHead } from '@/components/docs/doc-page';
import { getDoc } from '@/lib/docs';

export const Route = createFileRoute('/docs/$slug')({
  loader: ({ params }) => {
    // The docs home lives at /docs, not /docs/index
    if (params.slug === 'index') throw redirect({ to: '/docs', statusCode: 301 });
    const doc = getDoc(params.slug);
    if (!doc) throw notFound();
    return doc;
  },
  head: ({ loaderData }) => (loaderData ? docHead(loaderData) : {}),
  component: DocRoute,
});

function DocRoute() {
  const doc = Route.useLoaderData();
  return <DocPage doc={doc} />;
}
