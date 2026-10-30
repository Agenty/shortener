import { useEffect, useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { CHROME_EXTENSION_URL, FIREFOX_EXTENSION_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

export type ExtensionBrowser = 'chrome' | 'firefox';

const storeLinks: Record<ExtensionBrowser, { label: string; href: string }> = {
  chrome: { label: 'Add to Chrome', href: CHROME_EXTENSION_URL },
  firefox: { label: 'Add to Firefox', href: FIREFOX_EXTENSION_URL },
};

/** The extension opens /extension/installed and /extension/uninstalled with `?browser=chrome&version=1.0.0` */
export const extensionSearch = (search: Record<string, unknown>) => ({
  browser: typeof search.browser === 'string' ? search.browser : undefined,
  version: typeof search.version === 'string' ? search.version : undefined,
});

export const storeUrl = (browser: ExtensionBrowser) => storeLinks[browser].href;

/** Firefox visitors see the Firefox button first, everyone else Chrome (Edge, Brave and Opera install from the Chrome Web Store) */
function useVisitorBrowser(): ExtensionBrowser {
  const [browser, setBrowser] = useState<ExtensionBrowser>('chrome');
  useEffect(() => {
    if (/firefox/i.test(navigator.userAgent)) setBrowser('firefox');
  }, []);
  return browser;
}

export function StoreButtons({ className }: { className?: string }) {
  const first = useVisitorBrowser();
  const order: ExtensionBrowser[] = first === 'firefox' ? ['firefox', 'chrome'] : ['chrome', 'firefox'];
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {order.map((browser, index) => (
        <a
          key={browser}
          href={storeLinks[browser].href}
          target="_blank"
          rel="noopener"
          className={cn(
            buttonVariants({ size: 'lg', variant: index === 0 ? 'default' : 'outline' }),
            'h-11 gap-2 rounded-xl px-5 text-base'
          )}
        >
          <BrowserLogo browser={browser} />
          {storeLinks[browser].label}
        </a>
      ))}
    </div>
  );
}

/** Store favicon, same Google favicon service as `DomainFavicon` */
function BrowserLogo({ browser }: { browser: ExtensionBrowser }) {
  const domain = new URL(storeLinks[browser].href).hostname;
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      aria-hidden="true"
      width={18}
      height={18}
      className="size-[18px]"
    />
  );
}

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

const TALLY_SCRIPT = 'https://tally.so/widgets/embed.js';

/**
 * Embedded Tally form. `fields` are passed as URL parameters, which Tally fills
 * into hidden fields of the same name (e.g. `browser` and `version`).
 */
export function TallyForm({
  formId,
  title,
  fields = {},
  className,
}: {
  formId: string;
  title: string;
  fields?: Record<string, string | undefined>;
  className?: string;
}) {
  const params = new URLSearchParams({
    alignLeft: '1',
    hideTitle: '1',
    transparentBackground: '1',
    dynamicHeight: '1',
  });
  for (const [key, value] of Object.entries(fields)) if (value) params.set(key, value);
  const src = `https://tally.so/embed/${formId}?${params}`;

  useEffect(() => {
    if (window.Tally) {
      window.Tally.loadEmbeds();
      return;
    }
    if (document.querySelector(`script[src="${TALLY_SCRIPT}"]`)) return;
    const script = document.createElement('script');
    script.src = TALLY_SCRIPT;
    script.async = true;
    script.onload = () => window.Tally?.loadEmbeds();
    document.body.appendChild(script);
  }, [src]);

  return (
    <iframe
      data-tally-src={src}
      title={title}
      loading="lazy"
      width="100%"
      height="400"
      className={cn('w-full border-0', className)}
    />
  );
}
