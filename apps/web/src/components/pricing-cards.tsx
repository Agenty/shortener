import { Check } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { plans } from '@/data/plans';
import { cn } from '@/lib/utils';

export function PricingCards({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            'relative flex flex-col rounded-2xl border bg-card p-6',
            plan.popular && 'border-foreground/80 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.35)]'
          )}
        >
          {plan.popular && (
            <span className="absolute -top-2.5 left-6 rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-medium text-background">
              Most popular
            </span>
          )}
          <h3 className="font-semibold">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
          <p className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">${plan.price}</span>
            <span className="text-sm text-muted-foreground">{plan.period ?? 'forever'}</span>
          </p>
          <div className="mt-6 space-y-1 border-y py-4 text-sm">
            <p className="font-medium">{plan.links}</p>
            <p className="text-muted-foreground">{plan.analytics}</p>
          </div>
          <ul className="mt-4 mb-6 space-y-2.5 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-3" />
                {feature}
              </li>
            ))}
          </ul>
          <a
            href={plan.cta.href}
            rel="nofollow"
            className={cn(
              buttonVariants({ variant: plan.popular ? 'default' : 'outline', size: 'lg' }),
              'mt-auto rounded-xl'
            )}
          >
            {plan.cta.label}
          </a>
        </div>
      ))}
    </div>
  );
}
