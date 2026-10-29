import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHero } from '@/components/page-hero';
import { extensionSearch, TallyForm } from '@/components/extension';
import { NumberedList, Section } from '@/components/section';
import { buttonVariants } from '@/components/ui/button';
import { extensionForms } from '@/data/extension';
import { seo } from '@/lib/seo';
import { SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/extension/installed')({
  validateSearch: extensionSearch,
  head: () =>
    seo({
      title: 'Extension installed',
      description: 'The Shortener.dev extension is installed. Pin it, sign in and shorten your first link.',
      path: '/extension/installed',
      noindex: true,
    }),
  component: Installed,
});

function Installed() {
  const { browser, version } = Route.useSearch();
  const firefox = browser === 'firefox';

  return (
    <>
      <PageHero
        eyebrow="Extension installed"
        tone="green"
        title="You're all set."
        accent="Now pin it where you can see it."
        description={
          firefox
            ? 'Firefox puts new extensions behind the puzzle piece icon. Pin Shortener.dev to the toolbar, then click it to open the sidebar.'
            : 'Chrome hides new extensions behind the puzzle piece icon. Pin Shortener.dev to the toolbar, then click it to open the side panel.'
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={SIGNUP_URL} className={cn(buttonVariants({ size: 'lg' }), 'h-11 rounded-xl px-5')}>
            Create a free account
          </a>
          <Link
            to="/docs/$slug"
            params={{ slug: 'browser-extension' }}
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'h-11 rounded-xl px-5')}
          >
            Read the guide
          </Link>
        </div>
      </PageHero>

      <div className="container pb-8">
        <NumberedList
          className="max-w-2xl"
          items={[
            `Click the puzzle piece icon next to the address bar and pin Shortener.dev`,
            'Click the Shortener.dev icon and sign in, or create a free account',
            'Open a page you want to share and click Shorten link. The short link is copied',
            'Right click any link and choose Shorten this link to skip opening it',
          ]}
        />
      </div>

      {extensionForms.installed && (
        <Section surface>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">How did you find us?</h2>
            <p className="mt-3 text-muted-foreground">Two quick questions. It helps us decide what to build next.</p>
            <TallyForm
              className="mt-6"
              formId={extensionForms.installed}
              title="Shortener.dev extension install survey"
              fields={{ browser, version }}
            />
          </div>
        </Section>
      )}
    </>
  );
}
