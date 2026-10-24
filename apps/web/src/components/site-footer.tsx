import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { LogoMark, Wordmark } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { alternatives, featuredAlternatives } from '@/data/alternatives';
import { shortenerTools } from '@/data/tools';
import { fmt, useI18n, withLang, type Messages } from '@/i18n';
import { GITHUB_URL, LOGIN_URL, SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const footerColumns = (t: Messages) => [
  {
    title: t.common.product,
    links: [
      { label: t.nav.shortLinks, to: '/short-links-builder' },
      { label: t.common.pricing, to: '/pricing' },
      { label: t.nav.lifetimeDeal, to: '/lifetime-deal' },
      { label: t.footer.enterprise, to: '/enterprise' },
      { label: t.common.docs, to: '/docs' },
      { label: t.footer.apiReference, to: '/docs/api' },
    ],
  },
  {
    title: t.footer.compare,
    links: [
      ...featuredAlternatives.map((slug) => ({
        label: fmt(t.footer.alternative, {
          name: alternatives.find((item) => item.slug === slug)?.name ?? slug,
        }),
        to: `/alternatives/${slug}`,
      })),
      { label: t.footer.allComparisons, to: '/alternatives' },
    ],
  },
  {
    title: t.common.freeTools,
    links: [
      ...shortenerTools.slice(0, 5).map((tool) => ({ label: tool.title, to: `/tools/${tool.slug}` })),
      { label: 'QR code generator', to: '/tools/qr-code-generator' },
      { label: t.nav.whatsapp, to: '/tools/whatsapp-link-generator' },
      { label: t.nav.socialPreview, to: '/tools/social-share-preview' },
    ],
  },
  {
    title: t.footer.company,
    links: [
      { label: t.footer.about, to: '/about' },
      { label: t.common.contact, to: '/contact' },
      { label: t.footer.report, to: '/report' },
      { label: t.footer.terms, to: '/terms' },
      { label: t.footer.privacy, to: '/privacy' },
    ],
  },
];

/** Closing call to action shared by every page */
export function CtaBand({ title, description }: { title?: string; description?: string }) {
  const { locale, t } = useI18n();
  return (
    <div className="container py-24 text-center md:py-32">
      <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-6xl">
        {title ?? t.footer.ctaTitle}
      </h2>
      <div className="mt-8 flex items-center justify-center gap-3">
        <a
          href={withLang(SIGNUP_URL, locale)}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'h-11 rounded-xl bg-white px-5 text-base text-neutral-900 hover:bg-white/90'
          )}
        >
          {t.common.startFree}
        </a>
        <a href={withLang(LOGIN_URL, locale)} className="px-3 py-2 text-sm text-white/80 hover:text-white">
          {t.common.signIn}
        </a>
      </div>
      <p className="mt-5 text-sm text-white/60">{description ?? t.common.freeNote}</p>
    </div>
  );
}

export function SiteFooter({ hideCta }: { hideCta?: boolean }) {
  const { t } = useI18n();
  return (
    <footer className="relative overflow-hidden bg-neutral-950 text-white dark:border-t">
      {!hideCta && <CtaBand />}
      <div className="container">
        <div className="grid grid-cols-2 gap-10 border-t border-white/10 py-14 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2" aria-label={t.common.home}>
              <LogoMark className="size-8 [&_path]:stroke-neutral-950 [&_rect]:fill-white" />
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-56 text-sm leading-relaxed text-white/60">
              {t.footer.tagline}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <ThemeToggle className="border-white/15 [&_button]:text-white/60 [&_button:hover]:text-white [&_button[aria-checked=true]]:bg-white/10 [&_button[aria-checked=true]]:text-white" />
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white"
              >
                GitHub <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </div>
          {footerColumns(t).map((column) => (
            <div key={column.title}>
              <p className="font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-white/80 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-2 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
          <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <p>{t.footer.madeFor}</p>
        </div>
      </div>
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.22em] text-center text-[15vw] leading-none whitespace-nowrap font-semibold tracking-[-0.05em] text-white/[0.07] select-none"
      >
        shortener.dev
      </p>
    </footer>
  );
}
