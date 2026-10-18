import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DocsLayout } from '@/components/docs/docs-layout';
import { DocsToc } from '@/components/docs/docs-toc';
import { Markdown } from '@/components/docs/markdown';
import { Eyebrow } from '@/components/section';
import { type Doc, docPath, getPager } from '@/lib/docs';
import { breadcrumbJsonLd, seo } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/** `head()` for a docs page: meta, JSON-LD and a link to its raw markdown for agents */
export function docHead(doc: Doc) {
  const path = docPath(doc.slug);
  const head = seo({
    title: doc.title,
    description: doc.description,
    path,
    type: 'article',
    jsonLd: [
      {
        '@type': 'TechArticle',
        headline: doc.title,
        description: doc.description,
        url: `${SITE_URL}${path}`,
        articleSection: doc.section,
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      },
      breadcrumbJsonLd([
        { name: 'Docs', path: '/docs' },
        ...(doc.slug === 'index' ? [] : [{ name: doc.title, path }]),
      ]),
    ],
  });
  return {
    ...head,
    links: [
      ...head.links,
      { rel: 'alternate', type: 'text/markdown', href: `/docs/${doc.slug}.md` },
    ],
  };
}

export function DocPage({ doc }: { doc: Doc }) {
  const { prev, next } = getPager(doc.slug);

  return (
    <DocsLayout toc={<DocsToc headings={doc.headings} />}>
      <article className="max-w-3xl">
        <Eyebrow tone="blue">{doc.section}</Eyebrow>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">{doc.title}</h1>
        {doc.description && (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{doc.description}</p>
        )}
        <div className="mt-10">
          <Markdown>{doc.body}</Markdown>
        </div>

        <nav aria-label="Pagination" className="mt-16 grid gap-3 border-t pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              to={docPath(prev.slug)}
              className="group rounded-xl border p-4 transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft className="size-3" /> Previous
              </span>
              <span className="mt-1 block font-medium">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={docPath(next.slug)}
              className="group rounded-xl border p-4 text-right transition-colors hover:bg-muted"
            >
              <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                Next <ArrowRight className="size-3" />
              </span>
              <span className="mt-1 block font-medium">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>
    </DocsLayout>
  );
}
