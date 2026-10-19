import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { docsNav } from '@/lib/docs';

function DocsSidebar() {
  return (
    <nav aria-label="Docs" className="space-y-7">
      {docsNav.map((group) => (
        <div key={group.section}>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            {group.section}
          </p>
          <ul className="mt-2.5 space-y-0.5 border-l">
            {group.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: true }}
                  className="-ml-px block border-l border-transparent py-1 pl-3.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  activeProps={{ className: 'border-foreground! font-medium text-foreground!' }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * Three columns on wide screens: sidebar, content and the "On this page" TOC.
 * The sidebar folds into a disclosure on small screens, the TOC is hidden.
 */
export function DocsLayout({ children, toc }: { children: ReactNode; toc?: ReactNode }) {
  return (
    <div className="container grid gap-x-12 pt-6 pb-24 md:pt-10 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_12rem]">
      <details className="group mb-8 rounded-xl border lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          Docs menu
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t px-4 py-5">
          <DocsSidebar />
        </div>
      </details>

      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 pb-8">
          <DocsSidebar />
        </div>
      </aside>

      <div className="min-w-0">{children}</div>

      <aside className="hidden xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">{toc}</div>
      </aside>
    </div>
  );
}
