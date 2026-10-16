import { useState } from 'react';
import { Globe } from 'lucide-react';
import { cn } from 'cn';

interface DomainFaviconProps {
  domain: string;
  className?: string;
}

/** Google favicon for a domain inside a tile, falls back to a globe icon */
export function DomainFavicon({ domain, className }: DomainFaviconProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40',
        className
      )}
    >
      {failed ? (
        <Globe className="h-4 w-4 text-muted-foreground" />
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          loading="lazy"
          className="h-5 w-5 rounded-sm"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
