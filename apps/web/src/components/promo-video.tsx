import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Promo videos in `public/videos`. Each has a light and a `-dark` cut plus a
 * `.jpg` poster for both, so the video matches the site theme.
 */
export const promoVideos = {
  tour: {
    src: "/videos/shortener-tour.mp4",
    title: `${SITE_NAME} product tour`,
    description:
      "A tour of the Chrome extension, the link builder, click analytics, link safety and the REST API.",
    seconds: 77,
  },
  short: {
    src: "/videos/shortener-30s.mp4",
    title: `${SITE_NAME} in 30 seconds`,
    description:
      "Shorten any page from Chrome, add UTM tags, expiry and geo targeting, and track every click.",
    seconds: 29,
  },
} as const;

export type PromoVideoName = keyof typeof promoVideos;

const variant = (src: string, suffix: string, ext: string) =>
  src.replace(/\.mp4$/, `${suffix}.${ext}`);

/** `77` as `1:17` */
const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** VideoObject JSON-LD for a promo video */
export function videoJsonLd(name: PromoVideoName) {
  const video = promoVideos[name];
  return {
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: `${SITE_URL}${variant(video.src, "", "jpg")}`,
    contentUrl: `${SITE_URL}${video.src}`,
    uploadDate: "2026-11-17",
    duration: `PT${Math.floor(video.seconds / 60)}M${video.seconds % 60}S`,
  };
}

/**
 * 16:9 video with a play button over the poster. Nothing downloads until it
 * is played. Light and dark cuts are swapped by the theme class, the same way
 * as `ThemedScreenshot`.
 */
export function PromoVideo({
  src,
  title,
  seconds,
  autoPlay,
  className,
}: {
  /** Light cut, e.g. `/videos/shortener-tour.mp4`; `-dark.mp4` and `.jpg` posters sit next to it */
  src: string;
  title: string;
  seconds?: number;
  /** Start playing on mount, for videos opened by a click such as in a dialog */
  autoPlay?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  // Only the cut for the current theme is rendered (`offsetParent` is null under display: none)
  const visible = () =>
    Array.from(ref.current?.querySelectorAll("video") ?? []).find(
      (video) => video.offsetParent !== null,
    );

  const play = () => {
    setStarted(true);
    visible()
      ?.play()
      .catch(() => {});
  };

  useEffect(() => {
    if (autoPlay) play();
    // Pause the hidden cut if the theme changes mid-play
    const observer = new MutationObserver(() => {
      ref.current?.querySelectorAll("video").forEach((video) => {
        if (video.offsetParent === null && !video.paused) video.pause();
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative aspect-video overflow-hidden rounded-xl border bg-card shadow-[0_24px_60px_-24px_rgb(0_0_0/0.25)] dark:shadow-[0_24px_60px_-24px_rgb(0_0_0/0.8)]",
        className,
      )}
    >
      {(["", "-dark"] as const).map((suffix) => (
        <video
          key={suffix}
          src={variant(src, suffix, "mp4")}
          poster={variant(src, suffix, "jpg")}
          title={title}
          aria-hidden={suffix ? true : undefined}
          controls={started}
          preload="none"
          playsInline
          width={1920}
          height={1080}
          className={cn(
            "size-full object-cover",
            suffix ? "hidden dark:block" : "dark:hidden",
          )}
        />
      ))}
      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label={`${t.common.playVideo}: ${title}`}
          className="group absolute inset-0 flex items-end justify-center p-4 outline-none sm:p-8"
        >
          <span className="flex items-center gap-2.5 rounded-full bg-foreground py-2 pr-4 pl-2 text-sm font-medium text-background shadow-xl ring-4 ring-background/40 transition-transform group-hover:scale-105 group-focus-visible:ring-ring">
            <span className="flex size-8 items-center justify-center rounded-full bg-background text-foreground">
              <Play className="size-3.5 translate-x-px fill-current" />
            </span>
            {t.common.playVideo}
            {seconds && (
              <span className="font-mono text-xs opacity-60">
                {clock(seconds)}
              </span>
            )}
          </span>
        </button>
      )}
    </div>
  );
}

/** A promo video by name, with its title and length filled in */
export function NamedPromoVideo({
  name,
  ...props
}: {
  name: PromoVideoName;
  autoPlay?: boolean;
  className?: string;
}) {
  const video = promoVideos[name];
  return (
    <PromoVideo
      src={video.src}
      title={video.title}
      seconds={video.seconds}
      {...props}
    />
  );
}

/** Button that opens a promo video in a dialog and plays it */
export function WatchVideoButton({
  name = "short",
  className,
}: {
  name?: PromoVideoName;
  className?: string;
}) {
  const { t } = useI18n();
  const video = promoVideos[name];
  return (
    <Dialog>
      <DialogTrigger
        className={cn("inline-flex items-center gap-2", className)}
      >
        <Play className="size-3.5 fill-current" />
        {t.common.watchDemo}
        <span className="font-mono text-xs opacity-60">
          {clock(video.seconds)}
        </span>
      </DialogTrigger>
      <DialogContent className="gap-0 rounded-2xl p-2 sm:max-w-5xl sm:p-3">
        <DialogTitle className="sr-only">{video.title}</DialogTitle>
        <NamedPromoVideo
          name={name}
          autoPlay
          className="rounded-lg shadow-none"
        />
      </DialogContent>
    </Dialog>
  );
}
