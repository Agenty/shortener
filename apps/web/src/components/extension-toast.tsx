import { useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { isbot } from 'isbot';
import { Puzzle, X } from 'lucide-react';
import { BrowserLogo } from '@/components/extension';
import { buttonVariants } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { CHROME_EXTENSION_SHORT_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'extension-toast-dismissed-at';
const HIDE_FOR_MS = 30 * 24 * 60 * 60 * 1000;
const SHOW_AFTER_MS = 5000;

function wasDismissed() {
  try {
    return Date.now() - Number(localStorage.getItem(STORAGE_KEY)) < HIDE_FOR_MS;
  } catch {
    return false;
  }
}

/** Desktop Chrome, Edge, Brave and Opera, which all install from the Chrome Web Store. Mobile Chrome has no extensions */
function isDesktopChromium() {
  const ua = navigator.userAgent;
  return /Chrome\//.test(ua) && !/Mobile|Android|CriOS/.test(ua);
}

/**
 * Bottom-right nudge to install the Chrome extension, shown after a screen of
 * scrolling or a delay, then hidden for a month once closed. Client only, so
 * crawlers and the SSR markup never include it
 */
export function ExtensionToast() {
  const { t } = useI18n();
  const pathname = useLocation({ select: (location) => location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isbot(navigator.userAgent) || navigator.webdriver || !isDesktopChromium() || wasDismissed()) return;
    const show = () => setOpen(true);
    const onScroll = () => {
      if (window.scrollY > window.innerHeight) show();
    };
    const timer = setTimeout(show, SHOW_AFTER_MS);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // The extension pages already pitch it
  if (!open || pathname.startsWith('/extension')) return null;

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Storage blocked, the toast just shows again next visit
    }
  };

  return (
    <div
      role="status"
      className="fixed end-4 bottom-4 z-50 w-[calc(100vw-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-4 rounded-xl border bg-background p-4 shadow-lg duration-300"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.extensionPromo.dismiss}
        className="absolute end-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <div className="flex gap-3 pe-6">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Puzzle className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{t.extensionPromo.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.extensionPromo.body}</p>
          <a
            href={CHROME_EXTENSION_SHORT_URL}
            target="_blank"
            rel="noopener"
            onClick={dismiss}
            className={cn(buttonVariants({ size: 'sm' }), 'mt-3 gap-2')}
          >
            <BrowserLogo browser="chrome" /> {t.extensionPromo.cta}
          </a>
        </div>
      </div>
    </div>
  );
}
