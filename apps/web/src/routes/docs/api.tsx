import { lazy, Suspense } from 'react';
import { ClientOnly, createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { breadcrumbJsonLd, seo } from '@/lib/seo';
import { OPENAPI_URL } from '@/lib/site';

// Scalar touches `window` on import, so it only loads in the browser
const ScalarWrapper = lazy(() =>
  import('@/components/docs/scalar-wrapper').then((m) => ({ default: m.ScalarWrapper }))
);

export const Route = createFileRoute('/docs/api')({
  head: () => {
    const head = seo({
      title: 'URL shortener API reference',
      description:
        'REST API reference for Shortener.dev: create short links with UTM parameters, expiration, passwords and geo targeting, verify domains, and read click analytics.',
      path: '/docs/api',
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Docs', path: '/docs' },
          { name: 'API reference', path: '/docs/api' },
        ]),
      ],
    });
    return {
      ...head,
      links: [
        ...head.links,
        { rel: 'service-desc', type: 'application/json', href: OPENAPI_URL },
      ],
    };
  },
  component: ApiReference,
});

function Loading() {
  return (
    <div className="container py-24 text-sm text-muted-foreground">Loading API reference...</div>
  );
}

function ApiReference() {
  return (
    // Scalar's sticky sidebar starts below the site header
    <div className="[--scalar-custom-header-height:4.5rem]">
      <div className="container flex flex-wrap items-center justify-between gap-3 border-b pt-4 pb-4">
        <Link
          to="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Docs
        </Link>
        <p className="text-sm text-muted-foreground">
          OpenAPI spec:{' '}
          <a href={OPENAPI_URL} className="font-mono text-foreground underline underline-offset-2">
            openapi.json
          </a>
        </p>
      </div>
      <h1 className="sr-only">URL shortener API reference</h1>
      <ClientOnly fallback={<Loading />}>
        <Suspense fallback={<Loading />}>
          <ScalarWrapper />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
