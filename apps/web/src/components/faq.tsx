import { Plus } from 'lucide-react';
import { Eyebrow } from '@/components/section';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

/**
 * Native details/summary keeps every answer in the server HTML for search
 * engines. Pair with `faqJsonLd` in the route head.
 */
export function Faq({
  faqs,
  title,
  className,
}: {
  faqs: Array<{ q: string; a: string }>;
  title?: string;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={cn('grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16', className)}>
      <div>
        <Eyebrow tone="violet">{t.common.faq}</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
          {title ?? t.common.faqTitle}
        </h2>
      </div>
      <div className="divide-y border-y">
        {faqs.map((faq) => (
          <details key={faq.q} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-start text-[15px] font-medium [&::-webkit-details-marker]:hidden">
              {faq.q}
              <Plus className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
            </summary>
            <p className="pb-5 leading-relaxed text-muted-foreground">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
