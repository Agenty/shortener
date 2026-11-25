import type { ReactNode } from 'react';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from 'cn';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { DOCS_URL } from '@/env';

interface EmptyStateProps {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Primary call to action, usually a button or a dialog with its trigger */
  action?: ReactNode;
  /** Docs page slug like `manage-links`, or an absolute URL */
  docs?: string;
  docsLabel?: string;
  className?: string;
}

/** Placeholder for lists with no items yet, or no results for a filter */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  docs,
  docsLabel = 'Learn more',
  className,
}: EmptyStateProps) {
  const docsHref = docs && (/^https?:\/\//.test(docs) ? docs : `${DOCS_URL}/${docs}`);

  return (
    <Empty
      className={cn(
        'relative overflow-hidden border bg-muted/20 py-14',
        'bg-[radial-gradient(circle_at_center,var(--color-muted)_0,transparent_65%)]',
        className
      )}
    >
      <EmptyHeader>
        <EmptyMedia className="relative mb-3">
          <div className="absolute inset-0 -m-3 rounded-2xl border border-dashed opacity-60" />
          <div className="relative flex size-12 items-center justify-center rounded-xl border bg-background text-muted-foreground shadow-sm">
            <Icon className="size-6" />
          </div>
        </EmptyMedia>
        <EmptyTitle className="text-base font-semibold">{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {(action || docsHref) && (
        <EmptyContent className="flex-row flex-wrap justify-center gap-3">
          {action}
          {docsHref && (
            <a
              href={docsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {docsLabel}
              <ArrowUpRight className="size-3.5" />
            </a>
          )}
        </EmptyContent>
      )}
    </Empty>
  );
}
