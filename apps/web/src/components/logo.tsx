import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn('size-7', className)}>
      <rect width="64" height="64" rx="14" className="fill-foreground" />
      <path
        d="M43 20.5C39.5 15 25 14 21.5 21.5C18.5 28.5 28 30.5 32 31.5C37.5 33 46 35.5 42.5 43C39 50.5 24 50 20 43.5"
        fill="none"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-background"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-semibold tracking-tight', className)}>
      shortener<span className="text-brand">.</span>dev
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Shortener.dev home"
      className={cn('flex items-center gap-2', className)}
    >
      <LogoMark />
      <Wordmark className="text-xl" />
    </Link>
  );
}
