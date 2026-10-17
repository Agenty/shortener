import { useEffect, useId, useState } from 'react';
import { ArrowRight, Check, Copy, Link2, Loader2, X } from 'lucide-react';
import { DomainFavicon } from '@/components/domain-favicon';
import { Button } from '@/components/ui/button';
import { API_URL, SHORT_HOST, SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

export type ShortLink = {
  key: string;
  url: string;
  short_url: string;
  expire_at?: string | null;
  /** Demo link passed in by the page, not created by the visitor */
  example?: boolean;
};

const STORAGE_KEY = 'shortener:links';

const readStored = (): ShortLink[] => {
  try {
    const links: ShortLink[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const now = Date.now();
    return links.filter((link) => !link.expire_at || new Date(link.expire_at).getTime() > now);
  } catch {
    return [];
  }
};

const writeStored = (links: ShortLink[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links.slice(0, 10)));
  } catch {
    // Storage can be blocked, the list still works for this visit
  }
};

/** Adds https:// when the visitor pastes `example.com/page` */
export const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export type LinkBuilderProps = {
  placeholder?: string;
  /** Demo links shown before the visitor creates their own */
  examples?: Array<{ url: string; key: string }>;
  /** Prefill the input, e.g. a generated WhatsApp link */
  defaultUrl?: string;
  /** Hint shown under the input when the URL is not on this host, e.g. `amazon.com` */
  expectHost?: string;
  submitLabel?: string;
  className?: string;
  /** Called with each new short link, e.g. to show it elsewhere on the page */
  onCreated?: (link: ShortLink) => void;
};

/**
 * Public short link form. Used on the home page and every
 * `/tools/*-link-shortener` page, so keep it free of page-specific copy.
 */
export function LinkBuilder({
  placeholder = 'Paste a long URL, e.g. https://example.com/blog/my-post',
  examples = [],
  defaultUrl = '',
  expectHost,
  submitLabel = 'Shorten',
  className,
  onCreated,
}: LinkBuilderProps) {
  const inputId = useId();
  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<ShortLink[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => setCreated(readStored()), []);
  useEffect(() => setUrl(defaultUrl), [defaultUrl]);

  const exampleLinks: ShortLink[] = examples.map((item) => ({
    ...item,
    short_url: `https://${SHORT_HOST}/${item.key}`,
    example: true,
  }));
  const links = created.length ? created : exampleLinks;

  const destination = normalizeUrl(url);
  const host = hostOf(destination);
  const offHost = Boolean(expectHost && host && !host.endsWith(expectHost));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      new URL(destination);
    } catch {
      setError('Enter a valid URL, starting with https://');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: destination }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          res.status === 429
            ? 'Too many links in a minute. Wait a moment, or sign up for higher limits.'
            : res.status === 401 || res.status === 404
              ? 'Shortening without an account is not available right now.'
              : json.message || 'Could not shorten this link.'
        );
      }
      const link: ShortLink = {
        key: json.key,
        url: json.url ?? destination,
        short_url: json.short_url,
        expire_at: json.expire_at,
      };
      const next = [link, ...created.filter((item) => item.key !== link.key)];
      setCreated(next);
      writeStored(next);
      setUrl('');
      onCreated?.(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not shorten this link.');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (shortUrl: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(shortUrl);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard can be denied; the link is still selectable
    }
  };

  const remove = (key: string) => {
    const next = created.filter((item) => item.key !== key);
    setCreated(next);
    writeStored(next);
  };

  return (
    <div className={cn('rounded-2xl border bg-card p-3 text-left shadow-sm sm:p-4', className)}>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row" noValidate>
        <label htmlFor={inputId} className="sr-only">
          URL to shorten
        </label>
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id={inputId}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="h-12 w-full rounded-xl border bg-background pr-3 pl-10 text-[15px] outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
          />
        </div>
        <Button type="submit" disabled={loading || !url.trim()} className="h-12 rounded-xl px-5 text-[15px]">
          {loading ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
          {!loading && <ArrowRight data-icon="inline-end" />}
        </Button>
      </form>

      {offHost && !error && (
        <p className="mt-2 px-1 text-xs text-muted-foreground">
          This isn’t a {expectHost} link, but you can shorten it anyway.
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-2 px-1 text-sm text-destructive">
          {error}{' '}
          <a
            href={`${SIGNUP_URL}?url=${encodeURIComponent(destination)}`}
            className="font-medium text-foreground underline underline-offset-2"
          >
            Sign up free to shorten it in your account
          </a>
        </p>
      )}

      {links.length > 0 && (
        <ul className="mt-3 divide-y overflow-hidden rounded-xl border" aria-live="polite">
          {links.map((link) => (
            <li key={link.key} className="flex items-center gap-3 bg-background px-3 py-2.5">
              <DomainFavicon domain={hostOf(link.url)} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <a
                    href={link.short_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm font-semibold hover:underline"
                  >
                    {link.short_url.replace(/^https?:\/\//, '')}
                  </a>
                  {link.example && (
                    <span className="rounded-full bg-muted px-1.5 py-px text-[10px] text-muted-foreground">
                      Example
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{link.url}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => copy(link.short_url)}
                aria-label={`Copy ${link.short_url}`}
              >
                {copied === link.short_url ? <Check className="text-brand-3" /> : <Copy />}
              </Button>
              {!link.example && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(link.key)}
                  aria-label="Remove from this list"
                >
                  <X />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 px-1 text-xs text-muted-foreground">
        Links created here expire after 24 hours.{' '}
        <a href={SIGNUP_URL} className="font-medium text-foreground underline underline-offset-2">
          Sign up free
        </a>{' '}
        to keep them, pick the back-half and see click analytics.
      </p>
    </div>
  );
}
