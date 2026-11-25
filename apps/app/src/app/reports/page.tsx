import { useLayoutEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router";
import { useQueryState, useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { Download, ExternalLink, Lock, Monitor, Smartphone, Tablet, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { ClickReport } from "@/types/report";
import * as Flags from "country-flag-icons/react/3x2";

const LIMIT = 25;
const DEVICES = [
  { label: "All Devices", value: "all" },
  { label: "Desktop", value: "desktop" },
  { label: "Mobile", value: "mobile" },
  { label: "Tablet", value: "tablet" },
];

/** Drill-down filters, same names as the analytics page so links carry over */
const FILTERS = [
  { name: "key", label: "Link" },
  { name: "country", label: "Country" },
  { name: "referer", label: "Referer" },
  { name: "browser", label: "Browser" },
  { name: "os", label: "OS" },
] as const;

type FilterName = (typeof FILTERS)[number]["name"];

const filterParsers = Object.fromEntries(
  FILTERS.map(({ name }) => [name, parseAsString]),
) as Record<FilterName, typeof parseAsString>;

/** Sample rows shown blurred behind the paywall when the plan has no access at all */
const PLACEHOLDER_CLICKS: ClickReport[] = Array.from({ length: 8 }, (_, i) => ({
  timestamp: new Date(Date.now() - i * 3_600_000).toISOString(),
  url: "https://srt1.link/••••••",
  country: ["US", "GB", "IN", "DE"][i % 4],
  city: "••••••",
  region: "",
  referer: ["linkedin.com", "", "x.com", "google.com"][i % 4],
  browser: ["Chrome", "Safari", "Firefox", "Edge"][i % 4],
  os: ["macOS", "iOS", "Windows", "Android"][i % 4],
  device: ["desktop", "mobile", "desktop", "mobile"][i % 4],
  ip: "•••.•••.•••.•••",
  locked: true,
}));

const flagComponents = Flags as any as Record<string, React.FC<any>>;

function CountryFlag({ code }: { code: string }) {
  const Flag = flagComponents[code?.toUpperCase()];
  if (!Flag) return <span className="text-xs text-muted-foreground">{code}</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <Flag className="h-3.5 w-5 rounded-sm" />
      <span>{code}</span>
    </span>
  );
}

function DeviceIcon({ device }: { device: string }) {
  const d = device?.toLowerCase();
  const Icon = d === "mobile" ? Smartphone : d === "tablet" ? Tablet : Monitor;
  return <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
}

/** Cell content that adds a drill-down filter when clicked */
function FilterButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-sm text-left enabled:hover:text-primary enabled:hover:underline enabled:cursor-pointer"
    >
      {children}
    </button>
  );
}

export default function Reports() {
  const [device, setDevice] = useQueryState("device", { defaultValue: "all" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [filters, setFilters] = useQueryStates(filterParsers);
  const offset = (page - 1) * LIMIT;

  const params = {
    offset,
    limit: LIMIT,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    device: device === "all" ? undefined : device,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["reports", params],
    queryFn: () => api.reports.list(params),
    refetchOnWindowFocus: false,
    retry: (count, err) => !(err instanceof ApiError && err.status === 402) && count < 2,
  });

  // The plan has no access to reports, show sample data behind the paywall
  const noAccess = error instanceof ApiError && error.status === 402;
  const reports = noAccess ? PLACEHOLDER_CLICKS : data?.result ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const firstLocked = reports.findIndex((r) => r.locked);

  const setFilter = (name: FilterName, value: string | null) => {
    setFilters({ [name]: value || null });
    setPage(null);
  };

  const activeFilters = FILTERS.filter(({ name }) => filters[name]);

  // Paywall overlay starts at the first locked row
  const tableRef = useRef<HTMLDivElement>(null);
  const [paywallTop, setPaywallTop] = useState<number | null>(null);
  useLayoutEffect(() => {
    const row = tableRef.current?.querySelector<HTMLElement>("[data-locked='true']");
    setPaywallTop(row ? row.offsetTop : null);
  }, [reports, isLoading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Detailed click reports {total > 0 && `· ${total.toLocaleString()} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            items={DEVICES}
            value={device}
            onValueChange={(v) => {
              if (!v) return;
              setDevice(v === "all" ? null : v);
              setPage(null);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              {DEVICES.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => toast.success("Report exported!")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map(({ name, label }) => (
            <Badge key={name} variant="outline" className="h-7 gap-1 pl-2.5 pr-1">
              <span className="text-muted-foreground">{label}:</span>
              {name === "key"
                ? `/${filters[name]}`
                : name === "referer" && filters[name] === "(direct)"
                  ? "Direct"
                  : filters[name]}
              <button
                type="button"
                aria-label={`Remove ${label} filter`}
                onClick={() => setFilter(name, null)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters(null);
              setPage(null);
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      <div ref={tableRef} className="relative border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Browser</TableHead>
              <TableHead>Device</TableHead>
              <TableHead className="hidden lg:table-cell">Referrer</TableHead>
              <TableHead className="hidden xl:table-cell">IP</TableHead>
              <TableHead className="hidden sm:table-cell">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
            {!isLoading && reports.map((r, i) => {
              const locked = !!r.locked;
              const key = r.url.split("/").pop();
              return (
                <TableRow
                  key={`${r.timestamp}-${r.ip}-${i}`}
                  data-locked={locked}
                  aria-hidden={locked}
                  className={locked ? "blur-[5px] select-none pointer-events-none" : undefined}
                >
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <FilterButton onClick={() => setFilter("key", key ?? null)} disabled={locked}>
                        <span className="font-medium truncate">{r.url.replace("https://", "")}</span>
                      </FilterButton>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open short link"
                        className="text-muted-foreground hover:text-primary shrink-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <FilterButton onClick={() => setFilter("country", r.country)} disabled={locked || !r.country}>
                        <CountryFlag code={r.country} />
                      </FilterButton>
                      <span className="text-xs text-muted-foreground">{r.city}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={`https://app.shortener.dev/assets/icon/browsers/${r.browser?.toLowerCase()}.png`}
                        alt={r.browser}
                        className="h-3.5 w-3.5"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <FilterButton onClick={() => setFilter("browser", r.browser)} disabled={locked || !r.browser}>
                        <span className="text-sm">{r.browser}</span>
                      </FilterButton>
                      <FilterButton onClick={() => setFilter("os", r.os)} disabled={locked || !r.os}>
                        <span className="text-xs text-muted-foreground">{r.os}</span>
                      </FilterButton>
                    </div>
                  </TableCell>
                  <TableCell>
                    <FilterButton
                      onClick={() => {
                        setDevice(r.device.toLowerCase());
                        setPage(null);
                      }}
                      disabled={locked || !r.device}
                    >
                      <DeviceIcon device={r.device} />
                      <span className="capitalize text-sm">{r.device}</span>
                    </FilterButton>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    <FilterButton
                      onClick={() => setFilter("referer", r.referer || "(direct)")}
                      disabled={locked}
                    >
                      {r.referer && r.referer !== "null" ? r.referer : "Direct"}
                    </FilterButton>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-muted-foreground text-sm font-mono">
                    {r.ip || "-"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm whitespace-nowrap">
                    {format(new Date(r.timestamp), "MMM d, HH:mm")}
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No click data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {!isLoading && firstLocked >= 0 && paywallTop !== null && (
          <div
            className="absolute inset-x-0 bottom-0 flex items-start justify-center bg-gradient-to-b from-background/40 via-background/70 to-background px-4 pt-10"
            style={{ top: paywallTop }}
          >
            <div className="sticky top-24 max-w-sm rounded-xl border bg-background p-6 text-center shadow-lg">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">
                {noAccess ? "Click reports are a paid feature" : "Unlock all your clicks"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {noAccess
                  ? "Your trial has ended. Upgrade to see every click with location, referrer, device and IP address."
                  : `The free plan shows the latest ${offset + firstLocked} clicks. Upgrade to see all ${total.toLocaleString()} clicks with full visitor details.`}
              </p>
              <Button className="mt-4" nativeButton={false} render={<RouterLink to="/billings" />}>
                Upgrade plan
              </Button>
            </div>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(1, page - 1))}
                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <PaginationItem key={p}>
                  <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
