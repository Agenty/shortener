import { useEffect, useState } from "react";
import { Puzzle, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/** Short link to the Chrome Web Store listing, so promo clicks show up in analytics */
const CHROME_EXTENSION_SHORT_URL = "https://srt1.link/extension";
const STORAGE_KEY = "extension-toast-dismissed-at";
const HIDE_FOR_MS = 30 * 24 * 60 * 60 * 1000;
const SHOW_AFTER_MS = 5000;

function wasDismissed() {
  try {
    return Date.now() - Number(localStorage.getItem(STORAGE_KEY)) < HIDE_FOR_MS;
  } catch {
    return false;
  }
}

/** Chrome Web Store favicon, same as the store buttons on the website */
function BrowserLogo() {
  return (
    <img
      src="https://www.google.com/s2/favicons?domain=chromewebstore.google.com&sz=32"
      alt=""
      aria-hidden="true"
      width={18}
      height={18}
      className="size-[18px]"
    />
  );
}

/** Desktop Chrome, Edge, Brave and Opera, which all install from the Chrome Web Store. Mobile Chrome has no extensions */
function isDesktopChromium() {
  const ua = navigator.userAgent;
  return /Chrome\//.test(ua) && !/Mobile|Android|CriOS/.test(ua);
}

/** Bottom-right nudge to install the Chrome extension, hidden for a month once closed */
export function ExtensionToast() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (navigator.webdriver || !isDesktopChromium() || wasDismissed()) return;
    const timer = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

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
            className={cn(buttonVariants({ size: "sm" }), "mt-3 gap-2")}
          >
            <BrowserLogo /> {t.extensionPromo.cta}
          </a>
        </div>
      </div>
    </div>
  );
}
