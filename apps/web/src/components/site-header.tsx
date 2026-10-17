import { useEffect, useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronDown, Menu } from 'lucide-react';
import { Logo } from '@/components/logo';
import { buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { productNav, toolNav } from '@/data/nav';
import { LOGIN_URL, SIGNUP_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

type NavItem = { label: string; to: string; description?: string };

/**
 * Dropdowns open on hover and focus with CSS only, so every link is in the
 * server-rendered HTML for crawlers.
 */
function NavMenu({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div className="group/menu relative">
      <button
        type="button"
        className="flex items-center gap-1 rounded-full px-3 py-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
      >
        {label}
        <ChevronDown className="size-3.5 transition-transform group-focus-within/menu:rotate-180 group-hover/menu:rotate-180" />
      </button>
      <div className="invisible absolute top-full left-1/2 z-50 -translate-x-1/2 pt-2 opacity-0 transition-all group-focus-within/menu:visible group-focus-within/menu:opacity-100 group-hover/menu:visible group-hover/menu:opacity-100">
        <div className="w-80 rounded-2xl border bg-popover p-2 shadow-xl">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
            >
              <span className="block text-sm font-medium">{item.label}</span>
              {item.description && (
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {item.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  // Close the mobile sheet, and the focus-driven dropdowns, after navigating
  useEffect(() => {
    setMenuOpen(false);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-2 pt-2 sm:px-4">
      <div
        className={cn(
          'mx-auto flex max-w-[76rem] items-center justify-between rounded-2xl border border-transparent px-3 py-2.5 transition-all duration-300 sm:px-4',
          scrolled &&
            'border-border bg-background/80 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.18)] backdrop-blur-xl'
        )}
      >
        <Logo />

        <nav aria-label="Main" className="hidden items-center md:flex">
          <NavMenu label="Product" items={productNav} />
          <NavMenu label="Free tools" items={toolNav} />
          <Link
            to="/pricing"
            className="rounded-full px-3 py-2 text-sm text-foreground/80 hover:text-foreground"
            activeProps={{ className: 'text-foreground' }}
          >
            Pricing
          </Link>
          <Link
            to="/alternatives"
            className="rounded-full px-3 py-2 text-sm text-foreground/80 hover:text-foreground"
          >
            Compare
          </Link>
          <a
            href={LOGIN_URL}
            className="rounded-full px-3 py-2 text-sm text-foreground/80 hover:text-foreground"
          >
            Sign in
          </a>
          <a href={SIGNUP_URL} className={cn(buttonVariants({ size: 'lg' }), 'ml-2 rounded-xl')}>
            Start free
          </a>
        </nav>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-sm">
            <SheetTitle className="px-5 pt-5">Menu</SheetTitle>
            <nav aria-label="Mobile" className="flex flex-col gap-6 p-5">
              {[
                { title: 'Product', items: productNav },
                { title: 'Free tools', items: toolNav },
              ].map((group) => (
                <div key={group.title}>
                  <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                    {group.title}
                  </p>
                  <div className="mt-2 flex flex-col">
                    {group.items.map((item) => (
                      <Link key={item.to} to={item.to} className="py-1.5 text-[15px]">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex flex-col">
                <Link to="/pricing" className="py-1.5 text-[15px]">
                  Pricing
                </Link>
                <Link to="/alternatives" className="py-1.5 text-[15px]">
                  Compare
                </Link>
                <Link to="/contact" className="py-1.5 text-[15px]">
                  Contact
                </Link>
              </div>
              <div className="grid gap-2">
                <a href={SIGNUP_URL} className={buttonVariants({ size: 'lg' })}>
                  Start free
                </a>
                <a href={LOGIN_URL} className={buttonVariants({ size: 'lg', variant: 'outline' })}>
                  Sign in
                </a>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
