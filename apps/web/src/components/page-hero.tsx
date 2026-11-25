import type { ReactNode } from 'react';
import { Eyebrow, type Tone } from '@/components/section';
import { cn } from '@/lib/utils';

/** Left-aligned hero for inner pages: eyebrow, large title, muted italic line */
export function PageHero({
  eyebrow,
  tone,
  title,
  accent,
  description,
  children,
  className,
  contained = true,
}: {
  eyebrow?: string;
  tone?: Tone;
  title: ReactNode;
  /** Second line rendered in italic muted text */
  accent?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Set false when the hero sits inside a page's own container grid */
  contained?: boolean;
}) {
  return (
    <div className={cn(contained && 'container', 'pt-14 pb-12 md:pt-20 md:pb-16', className)}>
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <h1 className="mt-4 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.04em] md:text-7xl">
        {title}
        {accent && (
          <>
            <br />
            <span className="font-medium text-muted-foreground italic">{accent}</span>
          </>
        )}
      </h1>
      {description && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
