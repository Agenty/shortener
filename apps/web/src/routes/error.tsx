import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/page-hero';
import { buttonVariants } from '@/components/ui/button';
import { seo } from '@/lib/seo';
import { SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

type Reason = 'blocked' | 'expired' | 'not-found';

const copy: Record<Reason, { title: string; accent: string; description: string }> = {
  blocked: {
    title: 'Link blocked.',
    accent: 'For your safety.',
    description:
      'This short link was disabled because its destination was reported or detected as harmful, which breaks our fair use policy.',
  },
  expired: {
    title: 'Link expired.',
    accent: 'It reached its end date.',
    description: 'The owner of this short link set it to stop working after a date and time, which has passed.',
  },
  'not-found': {
    title: 'Link not found.',
    accent: 'It may have been deleted.',
    description: 'This short link doesn’t exist, or its owner deleted it.',
  },
};

export const Route = createFileRoute('/error')({
  validateSearch: (search: Record<string, unknown>): { reason?: Reason } => {
    const reason = search.reason;
    return reason === 'blocked' || reason === 'expired' ? { reason } : {};
  },
  head: () =>
    seo({
      title: 'Link unavailable',
      description: 'This short link is not available.',
      path: '/error',
      noindex: true,
    }),
  component: ErrorPage,
});

function ErrorPage() {
  const { reason = 'not-found' } = Route.useSearch();
  const content = copy[reason];

  return (
    <PageHero eyebrow="Shortener.dev" tone="amber" title={content.title} accent={content.accent} description={content.description}>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={SIGNUP_URL} className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5')}>
          Create your own short links
        </a>
        {reason === 'blocked' ? (
          <Link to="/terms" hash="fair-use" className={cn(buttonVariants({ size: 'lg', variant: 'ghost' }), 'h-11 rounded-xl')}>
            Read the fair use policy
          </Link>
        ) : (
          <Link to="/report" className={cn(buttonVariants({ size: 'lg', variant: 'ghost' }), 'h-11 rounded-xl')}>
            Report a link
          </Link>
        )}
      </div>
    </PageHero>
  );
}
