import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { buttonVariants } from '@/components/ui/button';
import { useI18n } from '@/i18n';

export function NotFound() {
  const { t } = useI18n();
  return (
    <PageHero
      eyebrow="404"
      tone="amber"
      title={t.notFound.title}
      accent={t.notFound.accent}
      description={t.notFound.description}
    >
      <div className="mt-8 flex gap-3">
        <Link to="/" className={buttonVariants({ size: 'lg' })}>
          {t.notFound.home} <ArrowRight data-icon="inline-end" className="rtl:rotate-180" />
        </Link>
        <Link to="/contact" className={buttonVariants({ size: 'lg', variant: 'ghost' })}>
          {t.notFound.support}
        </Link>
      </div>
    </PageHero>
  );
}
