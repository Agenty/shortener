import type { LucideIcon } from 'lucide-react';
import { DomainFavicon } from '@/components/domain-favicon';
import { cn } from '@/lib/utils';

/** Lazy-loaded favicon of the tool's platform, or its icon when it has no domain */
export function ToolIcon({
  domain,
  icon: Icon,
  size = 'sm',
}: {
  domain?: string;
  icon: LucideIcon;
  size?: 'default' | 'sm';
}) {
  if (domain) return <DomainFavicon domain={domain} size={size} />;
  const sm = size === 'sm';
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center border bg-muted/40',
        sm ? 'size-7 rounded-md' : 'size-9 rounded-lg'
      )}
    >
      <Icon className={cn('text-muted-foreground', sm ? 'size-3.5' : 'size-4')} />
    </span>
  );
}
