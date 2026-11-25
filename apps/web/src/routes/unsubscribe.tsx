import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/page-hero';
import { buttonVariants } from '@/components/ui/button';
import { seo } from '@/lib/seo';
import { API_URL, APP_URL, SUPPORT_EMAIL } from '@/lib/site';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/unsubscribe')({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === 'string' ? search.email : undefined,
    uuid: typeof search.uuid === 'string' ? search.uuid : undefined,
  }),
  head: () =>
    seo({
      title: 'Unsubscribe',
      description: 'Unsubscribe from Shortener.dev emails.',
      path: '/unsubscribe',
      noindex: true,
    }),
  component: Unsubscribe,
});

function Unsubscribe() {
  const { email, uuid } = Route.useSearch();
  const [status, setStatus] = useState<'pending' | 'done' | 'failed'>('pending');

  useEffect(() => {
    if (!email || !uuid) {
      setStatus('failed');
      return;
    }
    fetch(`${API_URL}/public/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, uuid }),
    })
      .then((res) => setStatus(res.ok ? 'done' : 'failed'))
      .catch(() => setStatus('failed'));
  }, [email, uuid]);

  if (status === 'failed') {
    return (
      <PageHero
        eyebrow="Email preferences"
        tone="amber"
        title="We couldn’t unsubscribe you."
        accent="The link may be incomplete."
        description={`Sign in and change your email preference on the profile page, or email ${SUPPORT_EMAIL} and we’ll do it for you.`}
      >
        <div className="mt-8 flex gap-3">
          <a href={`${APP_URL}/settings`} className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5')}>
            Open settings
          </a>
        </div>
      </PageHero>
    );
  }

  return (
    <PageHero
      eyebrow="Email preferences"
      tone="blue"
      title={status === 'done' ? 'You’re unsubscribed.' : 'Unsubscribing…'}
      accent="Sorry to see you go."
      description="You won’t receive marketing emails from us anymore. Changed your mind? Sign in and update your email preference on the profile page."
    >
      <div className="mt-8 flex gap-3">
        <Link to="/" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-11 rounded-xl px-5')}>
          Go to home
        </Link>
      </div>
    </PageHero>
  );
}
