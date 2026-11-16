import { useEffect, useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AlertCircle, Check, Copy, Download, Loader2, X } from 'lucide-react';
import { DomainFavicon } from '@/components/domain-favicon';
import { Faq } from '@/components/faq';
import { LoginDialog } from '@/components/login-dialog';
import { PageHero } from '@/components/page-hero';
import { Eyebrow, NumberedList, Section, Showcase } from '@/components/section';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { normalizeUrl } from '@/components/link-builder';
import { clearAuth, useAuth } from '@/lib/auth';
import { faqJsonLd, seo } from '@/lib/seo';
import { API_URL, APP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const MAX_LINKS = 50;
/** Requests in flight at once, well under the API rate limit */
const CONCURRENCY = 4;
/** URLs to shorten once the visitor is back from Google sign in */
const PENDING_KEY = 'shortener:pending-bulk';

const faqs = [
  {
    q: 'How many links can I shorten at once?',
    a: `Up to ${MAX_LINKS} links in one go. Paste one URL per line, select Shorten all, then copy the results or download them as a CSV file.`,
  },
  {
    q: 'Is the bulk URL shortener free?',
    a: 'Yes. Sign in with your email or Google account and the links are created in your free account, where you can see clicks for each one.',
  },
  {
    q: 'What happens to duplicate or invalid URLs?',
    a: 'Duplicate lines are shortened once, and lines that are not valid URLs are listed with an error so you can fix them and try again.',
  },
  {
    q: 'Can I shorten more than 50 links?',
    a: 'Run the tool again with the next batch, or use the API to create links from a script or spreadsheet. Your plan sets how many links your account can hold in total.',
  },
  {
    q: 'How do I export the short links?',
    a: 'Select Download CSV to save a file with the original URL and short URL of every link, ready to open in Excel or Google Sheets.',
  },
];

export const Route = createFileRoute('/tools/bulk-url-shortener')({
  head: () =>
    seo({
      title: 'Bulk URL shortener',
      description: `Shorten up to ${MAX_LINKS} links at once. Paste a list of URLs, get short links with click tracking and download them as CSV.`,
      path: '/tools/bulk-url-shortener',
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: 'Bulk URL shortener',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        faqJsonLd(faqs),
      ],
    }),
  component: BulkShortener,
});

type Row = {
  url: string;
  status: 'pending' | 'done' | 'error';
  shortUrl?: string;
  error?: string;
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return /^https?:$/.test(parsed.protocol) && parsed.hostname.includes('.');
  } catch {
    return false;
  }
};

/** One URL per line, also splitting on commas, tabs and spaces from pasted spreadsheets */
const parseUrls = (value: string) => {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const part of value.split(/[\s,]+/)) {
    const url = normalizeUrl(part);
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
};

const session = {
  get: (key: string) => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string | null) => {
    try {
      if (value === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    } catch {
      // Storage can be blocked, the visitor submits again after sign in
    }
  },
};

/** Stops the remaining requests, e.g. when the plan's link limit is reached */
class FatalError extends Error {}

function BulkShortener() {
  const auth = useAuth();
  const [input, setInput] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const urls = useMemo(() => parseUrls(input), [input]);
  const tooMany = urls.length > MAX_LINKS;
  const done = rows.filter((row) => row.status === 'done');
  const finished = rows.filter((row) => row.status !== 'pending').length;

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const createLink = async (url: string, token: string) => {
    const res = await fetch(`${API_URL}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      clearAuth();
      throw new FatalError('Your session expired. Sign in again to continue.');
    }
    if (res.status === 402) throw new FatalError(json.message || 'Your plan link limit is reached.');
    if (res.status === 429) throw new FatalError('Too many requests. Wait a minute and try the remaining links again.');
    if (!res.ok) throw new Error(json.message || 'Could not shorten this link');
    return json.short_url as string;
  };

  const run = async (list: string[], token: string) => {
    setError(null);
    setRunning(true);
    setRows(
      list.map((url) =>
        isValidUrl(url) ? { url, status: 'pending' } : { url, status: 'error', error: 'Not a valid URL' }
      )
    );

    let next = 0;
    let stopped = false;
    const worker = async () => {
      while (!stopped && next < list.length) {
        const index = next++;
        const url = list[index];
        if (!isValidUrl(url)) continue;
        try {
          update(index, { status: 'done', shortUrl: await createLink(url, token) });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Could not shorten this link';
          if (err instanceof FatalError) {
            stopped = true;
            setError(message);
          }
          update(index, { status: 'error', error: message });
        }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    if (stopped) {
      setRows((current) =>
        current.map((row) => (row.status === 'pending' ? { ...row, status: 'error', error: 'Not processed' } : row))
      );
    }
    setRunning(false);
  };

  // Back from Google sign in: shorten the list the visitor submitted before leaving
  useEffect(() => {
    const pending = session.get(PENDING_KEY);
    if (!auth || !pending) return;
    session.set(PENDING_KEY, null);
    setInput(pending);
    run(parseUrls(pending).slice(0, MAX_LINKS), auth.token);
  }, [auth]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!urls.length || tooMany) return;
    if (auth) run(urls, auth.token);
    else setLoginOpen(true);
  };

  const retryFailed = () => {
    if (!auth) return setLoginOpen(true);
    const failed = rows.filter((row) => row.status === 'error' && isValidUrl(row.url)).map((row) => row.url);
    setInput(failed.join('\n'));
    run(failed, auth.token);
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard can be denied; the links are still selectable
    }
  };

  const downloadCsv = () => {
    const escape = (value = '') => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      'original_url,short_url,status',
      ...rows.map((row) => [escape(row.url), escape(row.shortUrl), escape(row.status === 'done' ? 'ok' : row.error)].join(',')),
    ].join('\n');
    const href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = href;
    a.download = 'short-links.csv';
    a.click();
    URL.revokeObjectURL(href);
  };

  const allShort = done.map((row) => row.shortUrl).join('\n');
  const hasRetryable = !running && rows.some((row) => row.status === 'error' && isValidUrl(row.url));

  return (
    <>
      <PageHero
        eyebrow="Free tool"
        tone="green"
        title="Bulk URL shortener"
        description={`Paste up to ${MAX_LINKS} links and shorten them all at once. Copy the results or download a CSV, and track clicks on every link.`}
      />

      <div className="container">
        <Showcase className="mt-0">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-4 text-left shadow-lg">
            <form onSubmit={submit} className="grid gap-3" noValidate>
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor="bulk-urls">Links to shorten, one per line</Label>
                <span className={cn('text-xs tabular-nums text-muted-foreground', tooMany && 'text-destructive')}>
                  {urls.length} / {MAX_LINKS}
                </span>
              </div>
              <Textarea
                id="bulk-urls"
                rows={8}
                spellCheck={false}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={'https://example.com/spring-sale\nhttps://example.com/blog/launch-post\nhttps://example.com/pricing'}
                aria-invalid={tooMany}
                className="font-mono text-xs leading-relaxed"
              />
              {tooMany && (
                <p role="alert" className="text-sm text-destructive">
                  You can shorten up to {MAX_LINKS} links at a time. Remove {urls.length - MAX_LINKS} to continue.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={running || !urls.length || tooMany} className="h-11 rounded-xl px-5">
                  {running && <Loader2 className="animate-spin" />}
                  {running ? `Shortening ${finished} of ${rows.length}` : `Shorten ${urls.length || ''} ${urls.length === 1 ? 'link' : 'links'}`}
                </Button>
                {input && !running && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setInput('');
                      setRows([]);
                      setError(null);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </form>

            {error && (
              <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </p>
            )}

            {rows.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium" aria-live="polite">
                    {done.length} of {rows.length} shortened
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hasRetryable && (
                      <Button type="button" variant="outline" size="sm" onClick={retryFailed}>
                        Retry failed
                      </Button>
                    )}
                    <Button type="button" variant="outline" size="sm" disabled={!done.length} onClick={() => copy(allShort)}>
                      {copied === allShort ? <Check /> : <Copy />}
                      Copy all
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={running || !done.length} onClick={downloadCsv}>
                      <Download />
                      Download CSV
                    </Button>
                  </div>
                </div>
                <ul className="max-h-[28rem] divide-y overflow-y-auto rounded-xl border">
                  {rows.map((row) => (
                    <li key={row.url} className="flex items-center gap-3 bg-background px-3 py-2.5">
                      <DomainFavicon domain={hostOf(row.url)} size="sm" />
                      <div className="min-w-0 flex-1">
                        {row.status === 'done' && row.shortUrl ? (
                          <a
                            href={row.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-sm font-semibold hover:underline"
                          >
                            {row.shortUrl.replace(/^https?:\/\//, '')}
                          </a>
                        ) : row.status === 'error' ? (
                          <p className="truncate text-sm text-destructive">{row.error}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Waiting…</p>
                        )}
                        <p className="truncate text-xs text-muted-foreground">{row.url}</p>
                      </div>
                      {row.status === 'pending' && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                      {row.status === 'error' && <X className="size-4 text-destructive" />}
                      {row.status === 'done' && row.shortUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => copy(row.shortUrl!)}
                          aria-label={`Copy ${row.shortUrl}`}
                        >
                          {copied === row.shortUrl ? <Check className="text-brand-3" /> : <Copy />}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-3 px-1 text-xs text-muted-foreground">
              {auth ? (
                <>
                  Links are saved to your account.{' '}
                  <a href={APP_URL} className="font-medium text-foreground underline underline-offset-2">
                    Open dashboard
                  </a>
                </>
              ) : (
                'Sign in free to create the links and track clicks on each one.'
              )}
            </p>
          </div>
        </Showcase>
      </div>

      <Section>
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow tone="violet">How it works</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              Shorten a list of links in three steps
            </h2>
          </div>
          <NumberedList
            items={[
              `Paste up to ${MAX_LINKS} URLs, one per line or straight from a spreadsheet column`,
              'Select Shorten and sign in if asked',
              'Copy the short links or download them as a CSV file',
            ]}
          />
        </div>
      </Section>

      <Section surface>
        <Faq faqs={faqs} />
      </Section>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        title="Sign in to shorten your links"
        description="The short links are created in your free account so you can track their clicks."
        onSuccess={(user) => urls.length && !tooMany && run(urls, user.token)}
        onBeforeRedirect={() => urls.length && !tooMany && session.set(PENDING_KEY, urls.join('\n'))}
      />
    </>
  );
}
