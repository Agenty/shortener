import { useEffect, useRef } from 'react';
import { env } from '@/env';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          theme?: 'auto' | 'light' | 'dark';
          size?: 'normal' | 'flexible' | 'compact';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ): string;
      remove(widgetId: string): void;
    };
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

const loadScript = () =>
  (scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Allow a retry on the next mount, e.g. after a network blip
      scriptPromise = null;
      script.remove();
      reject(new Error('Turnstile failed to load'));
    };
    document.head.appendChild(script);
  }));

/**
 * Cloudflare Turnstile widget. Tokens are single use, so change the `key`
 * after every submit to render a fresh challenge.
 */
export function Turnstile({
  action,
  onToken,
  className,
}: {
  action: string;
  /** New token, or `null` once it expires or the challenge errors */
  onToken: (token: string | null) => void;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;

  useEffect(() => {
    let widgetId: string | undefined;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId = window.turnstile.render(container.current, {
          sitekey: env.TURNSTILE_SITE_KEY,
          action,
          theme: 'auto',
          size: 'flexible',
          callback: (token) => callback.current(token),
          'expired-callback': () => callback.current(null),
          'error-callback': () => callback.current(null),
        });
      })
      .catch(() => callback.current(null));

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [action]);

  return <div ref={container} className={cn('min-h-[65px]', className)} />;
}
