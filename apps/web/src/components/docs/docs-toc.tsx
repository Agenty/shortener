import { useEffect, useState } from 'react';
import type { DocHeading } from '@/lib/docs';
import { cn } from '@/lib/utils';

/** "On this page" links, highlighting the heading currently in view */
export function DocsToc({ headings }: { headings: DocHeading[] }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => !!element);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      // A heading becomes active once it reaches the top third of the viewport
      { rootMargin: '-80px 0px -66% 0px' }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav aria-label="On this page">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        On this page
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.depth === 3 && 'pl-3')}>
            <a
              href={`#${heading.id}`}
              className={cn(
                'block leading-snug text-muted-foreground transition-colors hover:text-foreground',
                active === heading.id && 'font-medium text-foreground'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
