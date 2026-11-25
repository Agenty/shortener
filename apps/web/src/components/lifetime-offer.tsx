import { Link } from '@tanstack/react-router';
import { ArrowRight, Gift } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { lifetime, lifetimeClaimed } from '@/data/plans';
import { fmt, rich, useI18n, withLang } from '@/i18n';
import { cn } from '@/lib/utils';

export function LifetimeSpots({ className }: { className?: string }) {
  const { t } = useI18n();
  const claimed = lifetimeClaimed();
  const left = lifetime.spots - claimed;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-medium">
          {rich(t.lifetime.claimed, {
            claimed: <span className="tabular-nums">{claimed}</span>,
            spots: lifetime.spots,
          })}
        </span>
        <span className="font-semibold text-red-600 dark:text-red-400">
          {rich(t.lifetime.left, { left: <span className="tabular-nums">{left}</span> })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t.lifetime.progress}
        aria-valuemin={0}
        aria-valuemax={lifetime.spots}
        aria-valuenow={claimed}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-orange-100 dark:bg-orange-950"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
          style={{ width: `${(claimed / lifetime.spots) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function LifetimeOffer({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  return (
    <div
      className={cn(
        'grid gap-6 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8 dark:border-orange-900/60 dark:from-orange-950/40 dark:to-red-950/30',
        className
      )}
    >
      <div className="flex gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[0_10px_30px_-10px_rgb(234_88_12/0.7)]">
          <Gift className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-[0.14em] text-red-600 uppercase dark:text-red-400">
            {fmt(t.lifetime.offerEyebrow, { spots: lifetime.spots })}
          </p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight md:text-2xl">
            {fmt(t.lifetime.offerTitle, { price: lifetime.price })}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {fmt(t.lifetime.offerBody, { links: t.lifetime.links })}
          </p>
          <LifetimeSpots className="mt-5 max-w-md" />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
        <a
          href={withLang(lifetime.href, locale)}
          rel="nofollow"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'rounded-xl border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90'
          )}
        >
          {t.lifetime.claim} <ArrowRight data-icon="inline-end" className="rtl:rotate-180" />
        </a>
        <Link to="/lifetime-deal" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'rounded-xl')}>
          {t.lifetime.seeIncluded}
        </Link>
      </div>
    </div>
  );
}
