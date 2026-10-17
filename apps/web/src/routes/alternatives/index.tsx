import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, ArrowUpRight, GitCompareArrows } from 'lucide-react';
import { DomainFavicon } from '@/components/domain-favicon';
import { LogoMark } from '@/components/logo';
import { buttonVariants } from '@/components/ui/button';
import { alternatives, categories } from '@/data/alternatives';
import { breadcrumbJsonLd, seo } from '@/lib/seo';
import { SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/alternatives/')({
  head: () =>
    seo({
      title: `Shortener.dev alternatives and URL shortener comparisons`,
      description: `Compare Shortener.dev with ${alternatives.length} URL shorteners, including Bitly, Rebrandly, Short.io, Dub and TinyURL. See features, pricing and which tool fits your team.`,
      path: '/alternatives',
      jsonLd: [
        {
          '@type': 'ItemList',
          itemListElement: alternatives.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: `${item.name} alternative`,
            url: `https://shortener.dev/alternatives/${item.slug}`,
          })),
        },
        breadcrumbJsonLd([{ name: 'Alternatives', path: '/alternatives' }]),
      ],
    }),
  component: AlternativesIndex,
});

function AlternativesIndex() {
  return (
    <div className="bg-background text-foreground">
      <div className="border-b">
        <div className="container pt-10 pb-14 md:pt-16 md:pb-20">
          <div className="grid items-end gap-8 md:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <h1 className="text-4xl leading-tight font-semibold tracking-[-0.03em] md:text-6xl">
                URL shortener comparisons
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Shortener.dev gives every link a custom back-half, UTM parameters, social preview,
                expiration, password, device and geo targeting, with click analytics, on every plan.
                Compare it with the tool you are using or considering. Paid plans start at $7 a month.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={SIGNUP_URL} className={cn(buttonVariants({ size: 'lg' }), 'rounded-xl')}>
                  Start free <ArrowRight data-icon="inline-end" />
                </a>
                <Link to="/pricing" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-xl')}>
                  See pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3 border-l pl-5 text-muted-foreground">
              <GitCompareArrows className="size-7 text-brand" aria-hidden="true" />
              <span className="text-sm">
                <strong className="block text-2xl text-foreground">{alternatives.length}</strong>{' '}
                comparisons
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-24">
        {categories.map((category, categoryIndex) => {
          const items = alternatives.filter((item) => item.category === category);
          return (
            <section
              key={category}
              className="border-b py-12 md:py-16"
              aria-labelledby={`category-${categoryIndex}`}
            >
              <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-brand">
                    {String(categoryIndex + 1).padStart(2, '0')} /{' '}
                    {String(categories.length).padStart(2, '0')}
                  </p>
                  <h2 id={`category-${categoryIndex}`} className="mt-2 text-2xl font-semibold md:text-3xl">
                    {category}
                  </h2>
                </div>
                <span className="text-sm text-muted-foreground">{items.length} comparisons</span>
              </div>
              <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Link
                    key={item.slug}
                    to="/alternatives/$slug"
                    params={{ slug: item.slug }}
                    className="group flex min-h-64 flex-col bg-card transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-ring"
                  >
                    <div className="dot-grid flex h-28 items-center justify-center gap-4 border-b bg-surface/60">
                      <DomainFavicon domain={item.domain} className="size-12 rounded-xl bg-background [&_img]:size-7" />
                      <span className="font-mono text-xs text-muted-foreground">vs</span>
                      <span className="flex size-12 items-center justify-center rounded-xl border bg-background">
                        <LogoMark className="size-7" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold">{item.name} alternative</h3>
                        <ArrowUpRight
                          className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.positioning}</p>
                      <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-brand">
                        Read comparison <ArrowRight className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ))}
                {/* Fill the last row so the grid's border color doesn't show as empty cells */}
                {Array.from({ length: (3 - (items.length % 3)) % 3 }, (_, index) => (
                  <div key={`lg-${index}`} className="hidden bg-card lg:block" aria-hidden="true" />
                ))}
                {items.length % 2 === 1 && <div className="hidden bg-card sm:block lg:hidden" aria-hidden="true" />}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
