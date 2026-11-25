import { useState } from 'react';
import { Globe } from 'lucide-react';
import { cn } from "@/lib/utils";

interface DomainFaviconProps {
  domain: string;
  size?: 'default' | 'sm';
  className?: string;
}

/** Google favicon for a domain inside a tile, falls back to a globe icon */
export function DomainFavicon({ domain, size = 'default', className }: DomainFaviconProps) {
  const [failed, setFailed] = useState(false);
  const sm = size === 'sm';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center border bg-muted/40',
        sm ? 'h-7 w-7 rounded-md' : 'h-9 w-9 rounded-lg',
        className
      )}
    >
      {failed || !domain ? (
        <Globe className={cn('text-muted-foreground', sm ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          width={sm ? 16 : 20}
          height={sm ? 16 : 20}
          loading="lazy"
          decoding="async"
          className={cn('rounded-sm', sm ? 'h-4 w-4' : 'h-5 w-5')}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
