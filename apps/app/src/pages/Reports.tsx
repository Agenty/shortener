import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { Download, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { api } from "@/lib/api";
import * as Flags from "country-flag-icons/react/3x2";

const LIMIT = 25;
const DEVICES = [
  { label: "All Devices", value: "all" },
  { label: "Desktop", value: "desktop" },
  { label: "Mobile", value: "mobile" },
  { label: "Tablet", value: "tablet" },
];
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

export default function Reports() {
  const [device, setDevice] = useQueryState("device", { defaultValue: "all" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const offset = (page - 1) * LIMIT;

  const { data, isLoading } = useQuery({
    queryKey: ["reports", offset],
    queryFn: () => api.reports.list({ offset, limit: LIMIT }),
    refetchOnWindowFocus: false,
  });

  const reports = data?.result ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);


  const filtered = device === "all"
    ? reports
    : reports.filter((r) => r.device.toLowerCase() === device);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Detailed click reports {total > 0 && `· ${total} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select items={DEVICES} value={device} onValueChange={(v) => v && setDevice(v)}>
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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead className="hidden md:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Browser</TableHead>
              <TableHead>Device</TableHead>
              <TableHead className="hidden lg:table-cell">Referrer</TableHead>
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
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.map((r, i) => (
              <TableRow key={`${r.timestamp}-${r.ip}-${i}`}>
                <TableCell className="max-w-[200px]">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 font-medium truncate"
                  >
                    {r.url.replace("https://", "")}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <CountryFlag code={r.country} />
                    <span className="text-xs text-muted-foreground">{r.city}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={`https://app.idm.in/assets/icon/browsers/${r.browser?.toLowerCase()}.png`}
                      alt={r.browser}
                      className="h-3.5 w-3.5"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className="text-sm">{r.browser}</span>
                    <span className="text-xs text-muted-foreground">{r.os}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <DeviceIcon device={r.device} />
                    <span className="capitalize text-sm">{r.device}</span>
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                  {r.referer || "Direct"}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm whitespace-nowrap">
                  {format(new Date(r.timestamp), "MMM d, HH:mm")}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No click data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
