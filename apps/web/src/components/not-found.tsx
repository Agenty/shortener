import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { buttonVariants } from '@/components/ui/button';

export function NotFound() {
  return (
    <PageHero
      eyebrow="404"
      tone="amber"
      title="Page not found."
      accent="The link may be old or mistyped."
      description="Check the address, or start again from the home page."
    >
      <div className="mt-8 flex gap-3">
        <Link to="/" className={buttonVariants({ size: 'lg' })}>
          Go to home <ArrowRight data-icon="inline-end" />
        </Link>
        <Link to="/contact" className={buttonVariants({ size: 'lg', variant: 'ghost' })}>
          Contact support
        </Link>
      </div>
    </PageHero>
  );
}
