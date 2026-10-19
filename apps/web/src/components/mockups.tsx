import { Globe2, Lock, MapPin, Monitor, Smartphone, TabletSmartphone } from 'lucide-react';
import { BrowserFrame } from '@/components/browser-frame';
import { LogoMark } from '@/components/logo';
import { cn } from '@/lib/utils';

/*
 * Illustrative product UI built in HTML so it follows the theme and stays
 * crisp. Numbers are sample data, not customer data.
 */

const clicks = [32, 41, 38, 52, 47, 61, 58, 73, 66, 84, 79, 92, 88, 104];

const countries = [
  { name: 'United States', code: 'us', share: 38 },
  { name: 'India', code: 'in', share: 21 },
  { name: 'Germany', code: 'de', share: 12 },
  { name: 'United Kingdom', code: 'gb', share: 9 },
];

const referrers = [
  { name: 'linkedin.com', share: 34 },
  { name: 'x.com', share: 22 },
  { name: 'newsletter', share: 18 },
  { name: 'Direct', share: 26 },
];

function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn('h-full rounded-full bg-brand', className)} style={{ width: `${value}%` }} />
    </div>
  );
}

export function AnalyticsMockup() {
  const max = Math.max(...clicks);
  return (
    <BrowserFrame url="app.shortener.dev/analytics" label="Sample data">
      <div className="grid gap-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold">Analytics</p>
            <p className="text-xs text-muted-foreground">srt1.link/spring-launch · last 14 days</p>
          </div>
          <span className="rounded-full border px-3 py-1 text-xs">Last 14d</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Total clicks', '1,015'],
            ['Countries', '27'],
            ['Referrers', '14'],
            ['Mobile', '61%'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm font-medium">Clicks over time</p>
          <div className="mt-4 flex h-32 items-end gap-1.5" role="img" aria-label="Clicks rising over 14 days">
            {clicks.map((value, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-md bg-brand/80 transition-colors hover:bg-brand"
                style={{ height: `${(value / max) * 100}%` }}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">Countries</p>
            <ul className="mt-3 space-y-3">
              {countries.map((country) => (
                <li key={country.code} className="grid gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <MapPin className="size-3 text-muted-foreground" />
                      {country.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{country.share}%</span>
                  </div>
                  <Bar value={country.share * 2} />
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">Referrers</p>
            <ul className="mt-3 space-y-3">
              {referrers.map((referrer) => (
                <li key={referrer.name} className="grid gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span>{referrer.name}</span>
                    <span className="tabular-nums text-muted-foreground">{referrer.share}%</span>
                  </div>
                  <Bar value={referrer.share * 2} className="bg-brand-2" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

const rules = [
  { icon: TabletSmartphone, when: 'iPhone and iPad', to: 'apps.apple.com/app/acme', tone: 'bg-brand/10 text-brand' },
  { icon: Smartphone, when: 'Android', to: 'play.google.com/store/apps/details?id=acme', tone: 'bg-brand-3/10 text-brand-3' },
  { icon: Globe2, when: 'Visitors from Germany', to: 'acme.com/de/spring', tone: 'bg-brand-4/15 text-brand-4' },
  { icon: Monitor, when: 'Everyone else', to: 'acme.com/spring', tone: 'bg-muted text-muted-foreground' },
];

export function TargetingMockup() {
  return (
    <div className="grid items-center gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          One short link
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-xl border bg-background p-3">
          <LogoMark className="size-7 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">go.acme.com/app</p>
            <p className="truncate text-xs text-muted-foreground">Created 2 days ago · 3,284 clicks</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
            <Lock className="size-3" /> Password
          </span>
          <span className="rounded-full border px-2 py-1">Expires Dec 31</span>
          <span className="rounded-full border px-2 py-1">utm_source=print</span>
        </div>
      </div>
      <ol className="grid gap-2.5">
        {rules.map((rule) => (
          <li key={rule.when} className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', rule.tone)}>
              <rule.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{rule.when}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">→ {rule.to}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ApiMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-neutral-950 text-neutral-200 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-white/10 px-3.5 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-xs text-neutral-400">terminal</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed">
        <code>
          <span className="text-neutral-500">$ </span>
          <span className="text-sky-300">curl</span> -X POST https://api.shortener.dev/v1/links \{'\n'}
          {'    '}-H <span className="text-amber-200">"Authorization: Bearer $SHORTENER_API_KEY"</span> \{'\n'}
          {'    '}-H <span className="text-amber-200">"Content-Type: application/json"</span> \{'\n'}
          {'    '}-d <span className="text-amber-200">{`'{"url": "https://acme.com/spring",`}</span>{'\n'}
          {'         '}<span className="text-amber-200">{`"key": "spring",`}</span>{'\n'}
          {'         '}<span className="text-amber-200">{`"params": {"utm_source": "email"}}'`}</span>
          {'\n\n'}
          <span className="text-neutral-500">{'{'}</span>
          {'\n  '}<span className="text-violet-300">"key"</span>: <span className="text-emerald-300">"spring"</span>,
          {'\n  '}<span className="text-violet-300">"short_url"</span>: <span className="text-emerald-300">"https://srt1.link/spring"</span>,
          {'\n  '}<span className="text-violet-300">"url"</span>: <span className="text-emerald-300">"https://acme.com/spring"</span>,
          {'\n  '}<span className="text-violet-300">"is_enabled"</span>: <span className="text-sky-300">true</span>
          {'\n'}
          <span className="text-neutral-500">{'}'}</span>
        </code>
      </pre>
    </div>
  );
}
