import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

const options = [
  { value: 'light', icon: Sun },
  { value: 'system', icon: Monitor },
  { value: 'dark', icon: Moon },
] as const;

/** Three-way segmented switch, highlighted after mount to avoid a hydration mismatch */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      role="radiogroup"
      aria-label={t.theme.label}
      className={cn('inline-flex items-center gap-0.5 rounded-full border p-0.5', className)}
    >
      {options.map(({ value, icon: Icon }) => {
        const active = mounted && theme === value;
        const label = t.theme[value];
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              'flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
              active && 'bg-muted text-foreground'
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
