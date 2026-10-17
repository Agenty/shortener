import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { BrowserFrame, ThemedScreenshot } from '@/components/browser-frame';
import { AnalyticsMockup } from '@/components/mockups';
import { Eyebrow, Showcase } from '@/components/section';
import { buttonVariants } from '@/components/ui/button';
import { alternatives, comparisonFeatures, getAlternative } from '@/data/alternatives';
import { breadcrumbJsonLd, seo } from '@/lib/seo';
import { SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/alternatives/$slug')({
  loader: ({ params }) => {
    const item = getAlternative(params.slug);
    if (!item) throw notFound();
    return { slug: item.slug };
  },
  head: ({ loaderData }) => {
    const item = loaderData && getAlternative(loaderData.slug);
    if (!item) return {};
    return seo({
      title: `${item.name} alternative: Shortener.dev vs ${item.name}`,
      description: `Compare Shortener.dev and ${item.name}: branded links, click analytics, device and geo targeting, API and pricing. Shortener.dev starts at $7 a month with every link option on every plan.`,
      path: `/alternatives/${item.slug}`,
      type: 'article',
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Alternatives', path: '/alternatives' },
          { name: `${item.name} alternative`, path: `/alternatives/${item.slug}` },
        ]),
      ],
    });
  },
  component: AlternativeArticle,
});

const sections = [
  ['Who it fits', 'quick-answer'],
  ['Feature comparison', 'features'],
  ['Cost & next steps', 'pricing'],
] as const;

function AlternativeArticle() {
  const { slug } = Route.useLoaderData();
  const item = getAlternative(slug)!;

  const related = alternatives
    .filter((entry) => entry.category === item.category && entry.slug !== item.slug)
    .concat(alternatives.filter((entry) => entry.category !== item.category))
    .slice(0, 3);

  return (
    <div className="bg-background text-foreground">
      <div className="border-b">
        <div className="container pt-8 pb-10 md:pt-12 md:pb-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Shortener.dev
            </Link>
            <span>/</span>
            <Link to="/alternatives" className="hover:text-foreground">
              Alternatives
            </Link>
            <span>/</span>
            <span className="text-foreground">{item.name}</span>
          </nav>
          <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="lg:pt-6">
              <p className="pt-6 text-xs font-semibold tracking-[0.18em] text-brand uppercase lg:pt-0">
                {item.name} alternative
              </p>
              <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-[-0.03em] md:text-6xl">
                Shortener.dev vs {item.name}
              </h1>
              <p className="mt-5 text-xl font-medium text-foreground/80">
                Short links with every option, on every plan.
              </p>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {item.summary}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a href={SIGNUP_URL} className={cn(buttonVariants({ size: 'lg' }), 'rounded-xl')}>
                  Start free <ArrowRight data-icon="inline-end" />
                </a>
                <p className="text-sm text-muted-foreground">Free for 10 links · Paid from $7/month</p>
              </div>
            </div>
            <BrowserFrame url="app.shortener.dev/links" className="self-center">
              <ThemedScreenshot name="app-create"
              width={896}
              height={810} alt="Shortener.dev short link builder" eager />
            </BrowserFrame>
          </div>
        </div>
      </div>

      <div className="container grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-20">
        <article className="max-w-3xl min-w-0">
          <section id="quick-answer" className="scroll-mt-28 border-l-2 border-brand pl-5 md:pl-7">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">The short answer</p>
            <h2 className="mt-3 text-2xl font-semibold">Is Shortener.dev a good {item.name} alternative?</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{item.angle}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">When {item.name} may fit better: </strong>
              {item.bestFor}
            </p>
          </section>

          <section id="features" className="mt-16 scroll-mt-28">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">Side-by-side</p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
              Shortener.dev vs {item.name}: feature comparison
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {item.name} details are based on its public product and pricing pages and can change.
              Availability and limits depend on the plan.
            </p>
            <div className="mt-7 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[580px] border-collapse text-left text-sm">
                <thead className="bg-surface">
                  <tr>
                    <th scope="col" className="w-[28%] p-4 font-semibold">
                      Capability
                    </th>
                    <th scope="col" className="w-[36%] p-4 font-semibold text-brand">
                      Shortener.dev
                    </th>
                    <th scope="col" className="w-[36%] p-4 font-semibold">
                      {item.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row) => (
                    <tr key={row.key} className="border-t">
                      <th scope="row" className="p-4 font-medium">
                        {row.label}
                      </th>
                      <td className="p-4 text-muted-foreground">{row.ours}</td>
                      <td className="p-4 text-muted-foreground">
                        {item.cells[row.key] ?? <span className="text-muted-foreground/60">See their docs</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <details className="mt-4 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium hover:text-foreground">Sources</summary>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href={item.pricingUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-brand underline underline-offset-2"
                  >
                    {item.name} pricing and documentation <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </details>
          </section>

          <section id="pricing" className="mt-16 scroll-mt-28">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">Cost & adoption</p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">Pricing and ease of use</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Shortener.dev is free for 10 links. Paid plans start at $7 a month for 500 links, a
              custom domain, two team members and API access, and a one-time $149 lifetime deal is
              available. Clicks are unlimited on every plan, and every link option is included.
            </p>
            <h3 className="mt-6 font-semibold">Before you commit</h3>
            <ul className="mt-3 space-y-2">
              {item.considerations.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <nav aria-label="Related pages" className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
              <Link to="/pricing" className="text-sm font-medium text-brand underline underline-offset-4">
                Shortener.dev pricing
              </Link>
              <Link to="/short-links-builder" className="text-sm font-medium text-brand underline underline-offset-4">
                Short link builder
              </Link>
              <Link to="/lifetime-deal" className="text-sm font-medium text-brand underline underline-offset-4">
                Lifetime deal
              </Link>
            </nav>
          </section>

          <section className="mt-16 border-y bg-surface px-6 py-9 md:px-9">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">Next step</p>
            <h2 className="mt-3 text-2xl font-semibold">Try it on your own links.</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
              Create a free account, add a few links from {item.name}, and compare the analytics
              side by side before you move everything.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={SIGNUP_URL} className={cn(buttonVariants({ size: 'lg' }), 'rounded-xl')}>
                Start free <ArrowRight data-icon="inline-end" />
              </a>
              <Link to="/contact" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-xl')}>
                Ask about migrating
              </Link>
            </div>
          </section>
          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            Product descriptions reflect publicly available positioning; capabilities and pricing may
            change. Check each provider’s current documentation before making a purchase decision.{' '}
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 text-brand underline underline-offset-2"
            >
              Visit {item.name} <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </p>
        </article>
        <aside className="hidden lg:block">
          <div className="sticky top-28 border-l pl-5 text-sm">
            <p className="mb-4 text-xs font-semibold text-muted-foreground uppercase">In this comparison</p>
            {sections.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="block py-2 text-muted-foreground hover:text-foreground">
                {label}
              </a>
            ))}
          </div>
        </aside>
      </div>

      <section className="border-t bg-surface py-16">
        <div className="container">
          <Eyebrow tone="violet">Product tour</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">Click analytics you can read at a glance</h2>
          <Showcase className="bg-background">
            <AnalyticsMockup />
          </Showcase>
        </div>
      </section>

      <section>
        <div className="container py-14">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">More comparisons</h2>
            <Link to="/alternatives" className="text-sm font-semibold text-brand hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
            {related.map((entry) => (
              <Link
                key={entry.slug}
                to="/alternatives/$slug"
                params={{ slug: entry.slug }}
                className="group flex items-center justify-between gap-3 bg-card p-6 font-medium hover:bg-surface"
              >
                {entry.name} alternative{' '}
                <ArrowRight
                  className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
