import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const GITHUB_URL = "https://github.com/Agenty/shortener";
const STORAGE_KEY = "github-star-toast-dismissed";
const SHOW_AFTER_MS = 4000;

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Bottom-left nudge to star the repo, hidden once dismissed */
export function GithubStarToast({ className }: { className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (wasDismissed()) return;
    const timer = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Storage blocked, the toast just shows again next visit
    }
  };

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-4 left-4 z-50 w-[calc(100vw-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-4 rounded-xl border bg-background p-4 shadow-lg duration-300",
        className
      )}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.githubStar.dismiss}
        className="absolute end-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <div className="flex gap-3 pe-6">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <Star className="size-5 fill-current" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{t.githubStar.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.githubStar.body}</p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className={cn(buttonVariants({ size: "sm" }), "mt-3")}
          >
            <Star data-icon="inline-start" /> {t.githubStar.cta}
          </a>
        </div>
      </div>
    </div>
  );
}
