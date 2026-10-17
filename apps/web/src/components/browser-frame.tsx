import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Window chrome with traffic lights and an address bar around a mockup or screenshot */
export function BrowserFrame({
  url,
  label,
  children,
  className,
  bodyClassName,
}: {
  url: string;
  label?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card shadow-[0_24px_60px_-24px_rgb(0_0_0/0.25)] dark:shadow-[0_24px_60px_-24px_rgb(0_0_0/0.8)]',
        className
      )}
    >
      <div className="flex items-center gap-3 border-b bg-muted/60 px-3.5 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="truncate font-mono text-xs text-muted-foreground">{url}</span>
        {label && (
          <span className="ml-auto shrink-0 rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
            {label}
          </span>
        )}
      </div>
      <div className={cn('bg-background', bodyClassName)}>{children}</div>
    </div>
  );
}

/** Light and dark screenshot of the dashboard, swapped by the theme class */
export function ThemedScreenshot({
  name,
  alt,
  width = 1440,
  height = 900,
  className,
  eager,
}: {
  name: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  eager?: boolean;
}) {
  const loading: 'eager' | 'lazy' = eager ? 'eager' : 'lazy';
  return (
    <>
      <img
        src={`/images/${name}-light.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={cn('block h-auto w-full dark:hidden', className)}
      />
      <img
        src={`/images/${name}-dark.webp`}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={cn('hidden h-auto w-full dark:block', className)}
      />
    </>
  );
}
