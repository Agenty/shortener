import { Link } from '@tanstack/react-router';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

/** Monoline letterforms for "shortener" and "dev"; the period is drawn separately. */
const WORDMARK_LETTERS =
  'M8.7 7.9C7.8 6.4 6.4 6 5.2 6C3.4 6 2.1 7 2.1 8.6C2.1 11.9 8.9 10.2 8.9 13.3C8.9 15 7.4 16 5.4 16C3.9 16 2.5 15.4 1.7 14.1M13 1.2V16M13 16V10.5A4.5 4.5 0 0 1 22 10.5V16M25.9 11A5 5 0 1 0 35.9 11A5 5 0 1 0 25.9 11ZM39.8 6V16M39.8 16V11A5 5 0 0 1 44.8 6H45.8M50.4 2.6V12.8A3.2 3.2 0 0 0 53.6 16H54.6M48.2 6H54.4M57.5 11H67.5A5 5 0 1 0 66.04 14.54M71.4 6V16M71.4 16V10.5A4.5 4.5 0 0 1 80.4 10.5V16M84.3 11H94.3A5 5 0 1 0 92.84 14.54M98.2 6V16M98.2 16V11A5 5 0 0 1 103.2 6H104.2M120.8 11A5 5 0 1 0 110.8 11A5 5 0 1 0 120.8 11ZM120.8 1.2V16M124.7 11H134.7A5 5 0 1 0 133.24 14.54M138.6 6L143.4 16L148.2 6';

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

/** "shortener.dev" logotype. Letters use currentColor; the period is a muted gray. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 149.7 17.4"
      role="img"
      aria-label="shortener.dev"
      className={cn('h-[1.1rem] w-auto', className)}
    >
      <path
        d={WORDMARK_LETTERS}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="107.2" cy="14.6" r="1.75" className="fill-current opacity-45" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link
      to="/"
      aria-label={t.common.home}
      className={cn('flex items-center gap-2', className)}
    >
      <LogoMark className="size-8" />
      <Wordmark />
    </Link>
  );
}
