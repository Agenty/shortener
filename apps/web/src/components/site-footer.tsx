import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { LogoMark, Wordmark } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { buttonVariants } from '@/components/ui/button';
import { alternatives, featuredAlternatives } from '@/data/alternatives';
import { shortenerTools } from '@/data/tools';
import { GITHUB_URL, LOGIN_URL, SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Short links', to: '/short-links-builder' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Lifetime deal', to: '/lifetime-deal' },
    ],
  },
  {
    title: 'Compare',
    links: [
      ...featuredAlternatives.map((slug) => ({
        label: `${alternatives.find((item) => item.slug === slug)?.name} alternative`,
        to: `/alternatives/${slug}`,
      })),
      { label: 'All comparisons', to: '/alternatives' },
    ],
  },
  {
    title: 'Free tools',
    links: [
      ...shortenerTools.slice(0, 5).map((tool) => ({ label: tool.title, to: `/tools/${tool.slug}` })),
      { label: 'WhatsApp link generator', to: '/tools/whatsapp-link-generator' },
      { label: 'Social share preview', to: '/tools/social-share-preview' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Report a link', to: '/report' },
      { label: 'Terms of use', to: '/terms' },
      { label: 'Privacy policy', to: '/privacy' },
    ],
  },
];

/** Closing call to action shared by every page */
export function CtaBand({
  title = 'Your next link, shorter and tracked.',
  description = 'Free for 10 links with click analytics, no card required.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="container py-24 text-center md:py-32">
      <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.03em] text-balance md:text-6xl">
        {title}
      </h2>
      <div className="mt-8 flex items-center justify-center gap-3">
        <a
          href={SIGNUP_URL}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'h-11 rounded-xl bg-white px-5 text-base text-neutral-900 hover:bg-white/90'
          )}
        >
          Start free
        </a>
        <a href={LOGIN_URL} className="px-3 py-2 text-sm text-white/80 hover:text-white">
          Sign in
        </a>
      </div>
      <p className="mt-5 text-sm text-white/60">{description}</p>
    </div>
  );
}

export function SiteFooter({ hideCta }: { hideCta?: boolean }) {
  return (
    <footer className="relative overflow-hidden bg-neutral-950 text-white dark:border-t">
      {!hideCta && <CtaBand />}
      <div className="container">
        <div className="grid grid-cols-2 gap-10 border-t border-white/10 py-14 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2" aria-label="Shortener.dev home">
              <LogoMark className="[&_path]:stroke-neutral-950 [&_rect]:fill-white" />
              <Wordmark className="text-xl" />
            </Link>
            <p className="mt-4 max-w-56 text-sm leading-relaxed text-white/60">
              Short links with click analytics, built on Cloudflare.
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
          {columns.map((column) => (
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
          <p>© {new Date().getFullYear()} Agenty Analytics Pvt. Ltd. All rights reserved.</p>
          <p>Made for marketers and developers.</p>
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
