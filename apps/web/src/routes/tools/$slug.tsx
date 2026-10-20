import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { Faq } from '@/components/faq';
import { LinkBuilder } from '@/components/link-builder';
import { ToolIcon } from '@/components/tool-icon';
import { PageHero } from '@/components/page-hero';
import { Eyebrow, NumberedList, Section, Showcase } from '@/components/section';
import { getTool, shortenerTools } from '@/data/tools';
import { breadcrumbJsonLd, faqJsonLd, seo } from '@/lib/seo';

export const Route = createFileRoute('/tools/$slug')({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { slug: tool.slug };
  },
  head: ({ loaderData }) => {
    const tool = loaderData && getTool(loaderData.slug);
    if (!tool) return {};
    return seo({
      title: tool.title,
      description: tool.description,
      path: `/tools/${tool.slug}`,
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: tool.title,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        faqJsonLd(tool.faqs),
        breadcrumbJsonLd([
          { name: 'Free tools', path: '/tools' },
          { name: tool.title, path: `/tools/${tool.slug}` },
        ]),
      ],
    });
  },
  component: ToolPage,
});

function ToolPage() {
  const { slug } = Route.useLoaderData();
  const tool = getTool(slug)!;
  const related = shortenerTools.filter((item) => item.slug !== tool.slug).slice(0, 4);

  return (
    <>
      <PageHero eyebrow="Free tool" tone="green" title={tool.headline} description={tool.subhead} />

      <div className="container">
        <Showcase className="mt-0">
          <div className="mx-auto max-w-3xl">
            <LinkBuilder
              key={tool.slug}
              placeholder={tool.placeholder}
              examples={[tool.example]}
              expectHost={tool.domain}
              submitLabel="Shorten link"
              className="shadow-lg"
            />
          </div>
        </Showcase>
      </div>

      <Section>
        <Eyebrow tone="blue">Why shorten {tool.platform} links</Eyebrow>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {tool.uses.map((use) => (
            <div key={use.title} className="bg-background p-6">
              <tool.icon className="size-5 text-muted-foreground" />
              <h2 className="mt-4 font-semibold">{use.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{use.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section surface>
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow tone="violet">How it works</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              Shorten {/^[AEIOU]/.test(tool.platform) ? 'an' : 'a'} {tool.platform} link in three steps
            </h2>
          </div>
          <NumberedList
            items={[
              `Copy the ${tool.platform} URL you want to share`,
              'Paste it in the form above and select Shorten link',
              'Copy the short link, or sign up to track its clicks',
            ]}
          />
        </div>
      </Section>

      <Section>
        <Faq faqs={tool.faqs} />
      </Section>

      <Section surface>
        <h2 className="text-2xl font-semibold tracking-tight">More free link shorteners</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <Link
              key={item.slug}
              to="/tools/$slug"
              params={{ slug: item.slug }}
              className="group flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm transition-colors hover:border-foreground/20"
            >
              <ToolIcon domain={item.domain} icon={item.icon} />
              {item.title}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
