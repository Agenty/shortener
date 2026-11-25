import { createFileRoute } from '@tanstack/react-router';
import { PageHero } from '@/components/page-hero';
import { extensionSearch, storeUrl, TallyForm } from '@/components/extension';
import { buttonVariants } from '@/components/ui/button';
import { extensionForms } from '@/data/extension';
import { seo } from '@/lib/seo';
import { APP_URL, SUPPORT_EMAIL } from '@/lib/site';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/extension/uninstalled')({
  validateSearch: extensionSearch,
  head: () =>
    seo({
      title: 'Extension removed',
      description: 'The Shortener.dev extension was removed. Tell us what went wrong.',
      path: '/extension/uninstalled',
      noindex: true,
    }),
  component: Uninstalled,
});

function Uninstalled() {
  const { browser, version } = Route.useSearch();

  return (
    <>
      <PageHero
        eyebrow="Extension removed"
        tone="amber"
        title="The extension is gone."
        accent="Your links are not."
        description={`Every short link you created keeps working, and you can still manage them at app.shortener.dev. If something didn't work the way you expected, tell us below. We read every answer.`}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`${APP_URL}/links`}
            className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5')}
          >
            Open my links
          </a>
          <a
            href={storeUrl(browser === 'firefox' ? 'firefox' : 'chrome')}
            target="_blank"
            rel="noopener"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-11 rounded-xl px-5')}
          >
            Reinstall
          </a>
        </div>
      </PageHero>

      <div className="container pb-24">
        <div className="max-w-2xl">
          {extensionForms.uninstalled ? (
            <TallyForm
              formId={extensionForms.uninstalled}
              title="Why did you remove the Shortener.dev extension?"
              fields={{ browser, version }}
            />
          ) : (
            <p className="text-muted-foreground">
              Why did you remove it? Email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}?subject=Extension feedback`} className="font-medium text-foreground underline underline-offset-2">
                {SUPPORT_EMAIL}
              </a>
              , even one line helps.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
