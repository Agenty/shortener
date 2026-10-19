import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { ToolIcon } from '@/components/tool-icon';
import { Section } from '@/components/section';
import { otherTools, shortenerTools } from '@/data/tools';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/tools/')({
  head: () =>
    seo({
      title: 'Free link tools',
      description:
        'Free link shorteners for ChatGPT, Amazon, Spotify, LinkedIn, YouTube and more, plus a WhatsApp link generator and a social share preview tool.',
      path: '/tools',
    }),
  component: Tools,
});

function Tools() {
  return (
    <>
      <PageHero
        eyebrow="Free tools"
        tone="green"
        title="Free link tools"
        accent="for everything you share."
        description="Shorten links for the apps you share from, build WhatsApp chat links and check how a link looks before you post it."
      />
      <Section className="pt-0 md:pt-0">
        <h2 className="text-xl font-semibold">Link shorteners</h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {shortenerTools.map((tool) => (
            <Link
              key={tool.slug}
              to="/tools/$slug"
              params={{ slug: tool.slug }}
              className="group flex min-h-44 flex-col bg-background p-5 transition-colors hover:bg-surface"
            >
              <div className="flex items-start justify-between">
                <ToolIcon domain={tool.domain} icon={tool.icon} size="default" />
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground" />
              </div>
              <h3 className="mt-6 font-semibold">{tool.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{tool.subhead}</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-semibold">More tools</h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2">
          {otherTools.map((tool) => (
            <Link
              key={tool.slug}
              to={tool.to}
              className="group flex flex-col bg-background p-5 transition-colors hover:bg-surface"
            >
              <div className="flex items-start justify-between">
                <ToolIcon domain={tool.domain} icon={tool.icon} size="default" />
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground" />
              </div>
              <h3 className="mt-6 font-semibold">{tool.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{tool.description}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
