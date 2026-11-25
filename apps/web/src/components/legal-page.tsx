import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/section';

export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="container pt-14 pb-24 md:pt-20">
      <Eyebrow tone="blue">{eyebrow}</Eyebrow>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-6xl">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated {updated}</p>
      <div className="prose prose-neutral mt-12 max-w-3xl dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
