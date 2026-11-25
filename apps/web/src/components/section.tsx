import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const dotColors = {
  blue: 'bg-brand',
  violet: 'bg-brand-2',
  green: 'bg-brand-3',
  amber: 'bg-brand-4',
} as const;

export type Tone = keyof typeof dotColors;

/** Mono uppercase label with a colored dot, e.g. "● ANALYTICS" */
export function Eyebrow({
  children,
  tone = 'blue',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase',
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', dotColors[tone])} aria-hidden="true" />
      {children}
    </p>
  );
}

export function Section({
  children,
  className,
  surface,
  ...rest
}: { surface?: boolean } & ComponentProps<'section'>) {
  return (
    <section className={cn('py-20 md:py-28', surface && 'border-y bg-surface', className)} {...rest}>
      <div className="container">{children}</div>
    </section>
  );
}

/** Heading and intro on the left, numbered points on the right */
export function SectionHeader({
  eyebrow,
  tone,
  title,
  description,
  points,
  as: Heading = 'h2',
}: {
  eyebrow: string;
  tone?: Tone;
  title: ReactNode;
  description?: ReactNode;
  points?: string[];
  as?: 'h1' | 'h2';
}) {
  return (
    <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-end md:gap-16">
      <div>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <Heading className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
          {title}
        </Heading>
        {description && (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {points && <NumberedList items={points} />}
    </div>
  );
}

export function NumberedList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ol className={cn('divide-y border-y', className)}>
      {items.map((item, index) => (
        <li key={item} className="flex items-baseline gap-4 py-3.5">
          <span className="font-mono text-xs text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-[15px]">{item}</span>
        </li>
      ))}
    </ol>
  );
}

/** Gradient-tinted rounded panel that frames product mockups */
export function Showcase({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'glow-panel relative mt-12 overflow-hidden rounded-[1.75rem] border p-3 sm:p-6 md:p-8',
        className
      )}
    >
      {children}
    </div>
  );
}
