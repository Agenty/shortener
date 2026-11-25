import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Loader2, Search } from 'lucide-react';
import { Faq } from '@/components/faq';
import { normalizeUrl } from '@/components/link-builder';
import { PageHero } from '@/components/page-hero';
import { Section, Showcase } from '@/components/section';
import { Button } from '@/components/ui/button';
import { faqJsonLd, seo } from '@/lib/seo';
import { API_URL } from '@/lib/site';

type Meta = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  siteName?: string;
};

const sample: Meta = {
  url: 'https://shortener.dev',
  title: 'Shortener.dev - URL shortener with click analytics',
  description:
    'Free URL shortener to create short links on your own domain, with click analytics, UTM builder, expiration, passwords, device and geo targeting, and an API.',
  image: '/og.png',
  domain: 'shortener.dev',
};

const faqs = [
  {
    q: 'What is a social share preview?',
    a: 'The card shown when a link is posted on X, Facebook, LinkedIn, Slack or WhatsApp. It is built from the page’s Open Graph tags: og:title, og:description and og:image.',
  },
  {
    q: 'Why does my preview show the wrong image?',
    a: 'The page may be missing an og:image tag, the image may be too small, or the network may have cached an old version. Fix the tags, then ask the network to scrape the page again.',
  },
  {
    q: 'Can I change the preview without editing the page?',
    a: 'Yes. With a Shortener.dev account you can set a custom title, description and image on any short link, and that preview is shown wherever the short link is shared.',
  },
];

export const Route = createFileRoute('/tools/social-share-preview')({
  head: () =>
    seo({
      title: 'Social share preview generator',
      description:
        'Check how a link will look when shared on X, Facebook and LinkedIn. Reads the page’s Open Graph title, description and image.',
      path: '/tools/social-share-preview',
      jsonLd: [faqJsonLd(faqs)],
    }),
  component: SocialPreview,
});

const truncate = (text = '', length: number) => (text.length > length ? `${text.slice(0, length - 1)}…` : text);

function PreviewImage({ meta, className }: { meta: Meta; className?: string }) {
  return meta.image ? (
    <img src={meta.image} alt="" className={`aspect-[1.91/1] w-full bg-muted object-cover ${className ?? ''}`} />
  ) : (
    <div className={`flex aspect-[1.91/1] w-full items-center justify-center bg-muted text-xs text-muted-foreground ${className ?? ''}`}>
      No og:image found
    </div>
  );
}

function SocialPreview() {
  const [url, setUrl] = useState('');
  const [meta, setMeta] = useState<Meta>(sample);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const target = normalizeUrl(url);
    if (!target) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/public/meta?url=${encodeURIComponent(target)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not read this page.');
      setMeta({ ...json, url: target, domain: json.domain || new URL(target).hostname });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read this page.');
    } finally {
      setLoading(false);
    }
  };

  const domain = (meta.domain || '').replace(/^www\./, '');

  return (
    <>
      <PageHero
        eyebrow="Free tool"
        tone="green"
        title="Social share preview"
        description="Enter a URL to see the card X, Facebook and LinkedIn will show when it is shared."
      />
      <div className="container">
        <Showcase className="mt-0">
          <form onSubmit={submit} className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl border bg-card p-3 shadow-lg sm:flex-row">
            <label htmlFor="preview-url" className="sr-only">
              Page URL
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="preview-url"
                type="url"
                inputMode="url"
                placeholder="https://example.com/blog/post"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="h-12 w-full rounded-xl border bg-background pr-3 pl-10 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>
            <Button type="submit" disabled={loading || !url.trim()} className="h-12 rounded-xl px-5 text-[15px]">
              {loading && <Loader2 className="animate-spin" />}
              Preview
            </Button>
          </form>
          {error && (
            <p role="alert" className="mx-auto mt-3 max-w-3xl px-1 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <figure>
              <figcaption className="mb-2 px-1 text-xs font-medium text-muted-foreground">X (Twitter)</figcaption>
              <div className="overflow-hidden rounded-2xl border bg-background">
                <PreviewImage meta={meta} />
                <div className="p-3">
                  <p className="text-xs text-muted-foreground">{domain}</p>
                  <p className="text-sm font-medium">{truncate(meta.title, 70)}</p>
                </div>
              </div>
            </figure>
            <figure>
              <figcaption className="mb-2 px-1 text-xs font-medium text-muted-foreground">Facebook</figcaption>
              <div className="overflow-hidden border bg-background">
                <PreviewImage meta={meta} />
                <div className="bg-muted/50 p-3">
                  <p className="text-[11px] text-muted-foreground uppercase">{domain}</p>
                  <p className="font-semibold">{truncate(meta.title, 80)}</p>
                  <p className="text-sm text-muted-foreground">{truncate(meta.description, 110)}</p>
                </div>
              </div>
            </figure>
            <figure>
              <figcaption className="mb-2 px-1 text-xs font-medium text-muted-foreground">LinkedIn</figcaption>
              <div className="overflow-hidden rounded-lg border bg-background">
                <PreviewImage meta={meta} />
                <div className="p-3">
                  <p className="text-sm font-semibold">{truncate(meta.title, 100)}</p>
                  <p className="text-xs text-muted-foreground">{domain}</p>
                </div>
              </div>
            </figure>
          </div>
        </Showcase>
      </div>
      <Section>
        <Faq faqs={faqs} />
      </Section>
    </>
  );
}
