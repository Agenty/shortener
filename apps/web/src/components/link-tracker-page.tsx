import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { Faq } from '@/components/faq';
import { LinkBuilder } from '@/components/link-builder';
import { PageHero } from '@/components/page-hero';
import { Eyebrow, Section, Showcase } from '@/components/section';
import { ToolIcon } from '@/components/tool-icon';
import { getLinkTracker, linkTrackers } from '@/data/link-trackers';
import { getTool } from '@/data/tools';

/** Docs that explain the features each step uses, linked from every tracker page */
const guides = [
  { slug: 'social-media-link-tracking', label: 'Social media link tracking: one link per placement' },
  { slug: 'social-traffic-direct', label: 'Why social media clicks show as Direct' },
  { slug: 'utm-parameters', label: 'Add UTM parameters to a short link' },
  { slug: 'click-analytics', label: 'Track clicks with link analytics' },
  { slug: 'click-reports', label: 'Export a click-by-click report' },
  { slug: 'verify-domain', label: 'Verify a domain to shorten links to your website' },
];

/** Inline `code` in data strings, rendered without pulling in a markdown parser */
function Text({ children }: { children: string }) {
  return (
    <>
      {children.split(/(`[^`]+`)/).map((part, index) =>
        part.startsWith('`') ? (
          <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        )
      )}
    </>
  );
}

function Screenshot({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  return (
    <figure className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="block h-auto w-full" />
      <figcaption className="border-t px-4 py-2.5 text-xs text-muted-foreground">{alt}</figcaption>
    </figure>
  );
}

function Step({
  number,
  title,
  children,
  image,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  image?: React.ReactNode;
}) {
  return (
    <div className="grid gap-8 border-t py-12 first:border-t-0 first:pt-0 md:grid-cols-[1fr_1.2fr] md:gap-16">
      <div>
        <span className="font-mono text-xs text-muted-foreground">{String(number).padStart(2, '0')}</span>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3>
        <div className="mt-4 space-y-3 leading-relaxed text-muted-foreground">{children}</div>
      </div>
      {image}
    </div>
  );
}

const docLink = 'font-medium text-foreground underline underline-offset-4 hover:no-underline';

export function LinkTrackerPage({ slug }: { slug: string }) {
  const tracker = getLinkTracker(slug)!;
  const shortener = tracker.shortener ? getTool(tracker.shortener) : undefined;
  const related = linkTrackers.filter((item) => item.slug !== tracker.slug);
  const first = tracker.placements[0];
  const { source, medium, campaign } = tracker.utm;
  const taggedUrl = `https://example.com/sale?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${first.content}`;

  return (
    <>
      <PageHero eyebrow="Free tool" tone="green" title={tracker.headline} description={tracker.subhead} />

      <div className="container">
        <Showcase className="mt-0">
          <div className="mx-auto max-w-3xl">
            <LinkBuilder
              key={tracker.slug}
              placeholder="https://example.com/your-page"
              examples={[tracker.example]}
              submitLabel="Create tracking link"
              className="shadow-lg"
            />
          </div>
        </Showcase>
      </div>

      <Section>
        <Eyebrow tone="blue">What {tracker.platform} shows you</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
          What {tracker.platform} analytics count, and what they leave out
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2">
          <div className="bg-background p-6 md:p-8">
            <h3 className="font-semibold">In {tracker.platform}</h3>
            <ul className="mt-4 space-y-3 text-[15px] text-muted-foreground">
              {tracker.shows.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-brand-3" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-background p-6 md:p-8">
            <h3 className="font-semibold">Not in {tracker.platform}</h3>
            <ul className="mt-4 space-y-3 text-[15px] text-muted-foreground">
              {tracker.misses.map((item) => (
                <li key={item} className="flex gap-3">
                  <X className="mt-1 size-4 shrink-0 text-destructive" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">
          A short link sits between the post and your page, so it sees every click no matter where the link was
          shared. Each click is recorded with its time, country, city, referrer, browser, operating system and device.
          Clicks from crawlers that build link previews are left out.
        </p>
      </Section>

      <Section surface>
        <Eyebrow tone="violet">One link per placement</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
          Where you can put a link on {tracker.platform}
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          Create a separate short link for each place below, all pointing to the same page. The click count of each
          link then answers which placement works, without guessing from referrers.
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border bg-background">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Placement</th>
                <th className="px-4 py-3 font-medium">Clickable</th>
                <th className="px-4 py-3 font-medium">Short link</th>
                <th className="px-4 py-3 font-medium">utm_content</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tracker.placements.map((row) => (
                <tr key={row.key}>
                  <td className="px-4 py-3 font-medium">{row.place}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.clickable}</td>
                  <td className="px-4 py-3 font-mono text-xs">srt1.link/{row.key}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Where a link is not clickable, write a short back-half people can type, all lowercase and without dashes if
          you can.
        </p>
      </Section>

      <Section>
        <Eyebrow tone="amber">Step by step</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
          Set up {tracker.platform} link tracking
        </h2>
        <div className="mt-12">
          <Step
            number={1}
            title="Create a short link for the first placement"
            image={
              <Screenshot
                src="/docs/images/create-link-filled.webp"
                alt="Short Link Builder with the Original URL and a custom back-half"
                width={1792}
                height={1620}
              />
            }
          >
            <p>
              Sign in to the dashboard, open <strong>Links</strong> and click <strong>Create Link</strong>. Paste the
              page you want {tracker.platform} visitors to land on into <strong>Original URL</strong>, and type a
              back-half such as <code className="font-mono text-sm">{first.key}</code> into{' '}
              <strong>Short Link</strong>.
            </p>
            <p>
              Links to your own website need a{' '}
              <Link to="/docs/$slug" params={{ slug: 'verify-domain' }} className={docLink}>
                verified domain
              </Link>
              . {tracker.platform} itself and sites like YouTube, Amazon and Google Forms work right away.
            </p>
          </Step>

          <Step
            number={2}
            title="Add UTM parameters"
            image={
              <Screenshot
                src="/docs/images/option-utm.webp"
                alt="UTM Builder with source, medium and campaign filled in"
                width={1792}
                height={1620}
              />
            }
          >
            <p>
              Open <strong>Options</strong>, click <strong>UTM Builder</strong> and fill in the source, medium,
              campaign and content. The short link stays clean, and Google Analytics still receives the full tagged URL.
            </p>
            <p>
              Use the values in the table below. See{' '}
              <Link to="/docs/$slug" params={{ slug: 'utm-parameters' }} className={docLink}>
                UTM parameters
              </Link>{' '}
              for naming tips.
            </p>
          </Step>

          <Step
            number={3}
            title="Repeat for every placement and share"
            image={
              <Screenshot
                src="/docs/images/link-created.webp"
                alt="The new short link at the top of the Links page"
                width={2880}
                height={1800}
              />
            }
          >
            <p>
              Click <strong>Create Short Link</strong>, copy the link and put it where it belongs on{' '}
              {tracker.platform}. Create the next link for the next placement, changing only the back-half and{' '}
              <code className="font-mono text-sm">utm_content</code>.
            </p>
            <p>
              Need it on a poster or packaging too? Every short link has a{' '}
              <Link to="/docs/$slug" params={{ slug: 'qr-codes' }} className={docLink}>
                QR code
              </Link>
              , and scans are counted on the same link.
            </p>
          </Step>

          <Step
            number={4}
            title="Read the clicks"
            image={
              <Screenshot
                src="/docs/images/analytics.webp"
                alt="Analytics with clicks over time and the top countries, referrers, links, browsers and devices"
                width={2880}
                height={3000}
              />
            }
          >
            <p>
              Open{' '}
              <Link to="/docs/$slug" params={{ slug: 'click-analytics' }} className={docLink}>
                Analytics
              </Link>{' '}
              for clicks over time and the top countries, referrers, browsers and devices, for all links or a single
              one. <strong>Reports</strong> lists every click with its time, and{' '}
              <Link to="/docs/$slug" params={{ slug: 'click-reports' }} className={docLink}>
                Export
              </Link>{' '}
              downloads them as CSV.
            </p>
            <p>Compare links on the same day range. A link that was live for a week can't be fairly compared with one that was live for a day.</p>
          </Step>
        </div>
      </Section>

      <Section surface>
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow tone="blue">UTM values</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">UTM parameters for {tracker.platform}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Keep every value lowercase and use the same source on every {tracker.platform} link. Google Analytics
              treats <code className="font-mono text-sm">{source}</code> and{' '}
              <code className="font-mono text-sm">{source[0].toUpperCase() + source.slice(1)}</code> as two different
              sources.
            </p>
          </div>
          <div className="min-w-0 space-y-4">
            <div className="overflow-hidden rounded-2xl border bg-background">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y">
                  {[
                    ['utm_source', source],
                    ['utm_medium', medium],
                    ['utm_campaign', campaign],
                    ['utm_content', tracker.placements.map((row) => row.content).slice(0, 3).join(', ') + ' ...'],
                  ].map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{key}</td>
                      <td className="px-4 py-3 font-mono text-xs break-words">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              A visitor who taps <code className="font-mono">srt1.link/{first.key}</code> lands on:
            </p>
            <pre className="overflow-x-auto rounded-xl border bg-background p-4 font-mono text-xs leading-relaxed">
              {taggedUrl}
            </pre>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow tone="violet">Reading the data</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              How {tracker.platform} clicks show up in your reports
            </h2>
          </div>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            {tracker.referrer.map((paragraph) => (
              <p key={paragraph}>
                <Text>{paragraph}</Text>
              </p>
            ))}
            <p>
              More on this in{' '}
              <Link to="/docs/$slug" params={{ slug: 'social-traffic-direct' }} className={docLink}>
                why social media clicks show as Direct
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="mt-12">
          <Screenshot
            src="/docs/images/reports.webp"
            alt="Reports page with the location, browser, device and referrer of each click"
            width={2520}
            height={1800}
          />
        </div>
      </Section>

      <Section surface>
        <Eyebrow tone="green">Tips</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Getting more out of {tracker.platform} links</h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
          {tracker.tips.map((tip) => (
            <div key={tip.title} className="bg-background p-6">
              <tracker.icon className="size-5 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">{tip.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Faq faqs={tracker.faqs} />
      </Section>

      <Section surface>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Guides</h2>
            <ul className="mt-6 divide-y border-y">
              {guides.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    to="/docs/$slug"
                    params={{ slug: guide.slug }}
                    className="group flex items-center justify-between gap-4 py-3 text-[15px]"
                  >
                    {guide.label}
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">More link trackers</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {shortener && (
                <Link
                  to="/tools/$slug"
                  params={{ slug: shortener.slug }}
                  className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm transition-colors hover:border-foreground/20"
                >
                  <ToolIcon domain={shortener.domain} icon={shortener.icon} />
                  {shortener.title}
                </Link>
              )}
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to="/tools/$slug"
                  params={{ slug: item.slug }}
                  className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm transition-colors hover:border-foreground/20"
                >
                  <ToolIcon domain={item.domain} icon={item.icon} />
                  {item.headline}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
