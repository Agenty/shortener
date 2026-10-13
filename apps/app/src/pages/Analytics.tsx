import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MousePointerClick, Globe, BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  LabelList,
} from "recharts";
import { api } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { hasFlag } from "country-flag-icons";
import * as Flags from "country-flag-icons/react/3x2";

const INTERVALS = [
  { label: "24h", value: "1" },
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
];

function CountryFlag({ code }: { code: string }) {
  const upper = code.toUpperCase();
  if (hasFlag(upper)) {
    const FlagComponent = (Flags as unknown as Record<string, React.ComponentType<{ className?: string }>>)[upper];
    if (FlagComponent) return <FlagComponent className="h-4 w-5 rounded-sm" />;
  }
  return <Globe className="h-4 w-4 text-muted-foreground" />;
}

function StatCard({ label, value, loading }: { label: string; value: string | number; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function ListCard({
  title,
  data,
  loading,
  renderItem,
}: {
  title: string;
  data: { label: string; clicks: number; icon?: React.ReactNode }[];
  loading: boolean;
  renderItem?: (item: { label: string; clicks: number; icon?: React.ReactNode }, maxClicks: number) => React.ReactNode;
}) {
  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);
  const total = data.reduce((sum, d) => sum + d.clicks, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available</p>
        ) : (
          data.slice(0, 8).map((item, i) =>
            renderItem ? (
              <div key={i}>{renderItem(item, maxClicks)}</div>
            ) : (
              <div key={i} className="relative flex items-center justify-between rounded-md px-2 py-1.5 text-sm overflow-hidden">
                <div
                  className="absolute inset-0 rounded-md bg-accent"
                  style={{ width: `${(item.clicks / maxClicks) * 100}%` }}
                />
                <div className="relative flex items-center gap-2 truncate">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>
                <span className="relative font-medium tabular-nums shrink-0">
                  {item.clicks.toLocaleString()}
                </span>
              </div>
            )
          )
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const keyParam = searchParams.get("key") || undefined;
  const [interval, setInterval] = useState("7");
  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");
  const [showLabels, setShowLabels] = useState(false);
  const intervalNum = Number(interval);

  const queryParams = { interval: intervalNum, key: keyParam };

  const { data: clicksData, isLoading: clicksLoading } = useQuery({
    queryKey: ["analytics", "clicks", queryParams],
    queryFn: () => api.analytics.clicks(queryParams),
  });

  const { data: refererData, isLoading: refererLoading } = useQuery({
    queryKey: ["analytics", "referer", queryParams],
    queryFn: () => api.analytics.referer(queryParams),
  });

  const { data: countryData, isLoading: countryLoading } = useQuery({
    queryKey: ["analytics", "country", queryParams],
    queryFn: () => api.analytics.country(queryParams),
  });

  const { data: topData, isLoading: topLoading } = useQuery({
    queryKey: ["analytics", "top", queryParams],
    queryFn: () => api.analytics.top(queryParams),
  });

  const { data: browserData, isLoading: browserLoading } = useQuery({
    queryKey: ["analytics", "browser", queryParams],
    queryFn: () => api.analytics.browser(queryParams),
  });

  const { data: osData, isLoading: osLoading } = useQuery({
    queryKey: ["analytics", "os", queryParams],
    queryFn: () => api.analytics.os(queryParams),
  });

  const { data: deviceData, isLoading: deviceLoading } = useQuery({
    queryKey: ["analytics", "device", queryParams],
    queryFn: () => api.analytics.device(queryParams),
  });

  const chartData = useMemo(
    () =>
      (clicksData || []).map((d) => ({
        date: format(parseISO(d.date), "MMM dd"),
        clicks: Number(d.clicks),
      })),
    [clicksData]
  );

  const totalClicks = useMemo(
    () => (clicksData || []).reduce((sum, d) => sum + Number(d.clicks), 0),
    [clicksData]
  );

  const countriesList = useMemo(
    () =>
      (countryData || []).map((d) => ({
        label: d.country || "Unknown",
        clicks: Number(d.clicks),
        icon: <CountryFlag code={d.country} />,
      })),
    [countryData]
  );

  const referersList = useMemo(
    () =>
      (refererData || []).map((d) => ({
        label: d.referer || "Direct",
        clicks: Number(d.clicks),
        icon: d.referer ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${new URL(d.referer).hostname}&sz=16`}
            alt=""
            className="h-4 w-4 rounded-sm"
          />
        ) : (
          <Globe className="h-4 w-4 text-muted-foreground" />
        ),
      })),
    [refererData]
  );

  const topList = useMemo(
    () =>
      (topData || []).map((d) => {
        let domain = d.url;
        try { domain = new URL(d.url).pathname; } catch {}
        return {
          label: domain,
          clicks: Number(d.clicks),
          icon: (
            <img
              src={`https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(d.url).hostname; } catch { return ""; } })()}&sz=16`}
              alt=""
              className="h-4 w-4 rounded-sm"
            />
          ),
        };
      }),
    [topData]
  );

  const browserList = useMemo(
    () =>
      (browserData || []).map((d) => ({
        label: d.browser || "Unknown",
        clicks: Number(d.clicks),
        icon: (
          <img
            src={`https://app.idm.in/assets/icon/browsers/${d.browser}.png`}
            alt={d.browser}
            className="h-4 w-4"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ),
      })),
    [browserData]
  );

  const osList = useMemo(
    () =>
      (osData || []).map((d) => ({
        label: d.os || "Unknown",
        clicks: Number(d.clicks),
        icon: (
          <img
            src={`https://app.idm.in/assets/icon/os/${d.os}.png`}
            alt={d.os}
            className="h-4 w-4"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ),
      })),
    [osData]
  );

  const deviceList = useMemo(
    () =>
      (deviceData || []).map((d) => ({
        label: d.device || "Unknown",
        clicks: Number(d.clicks),
        icon: (
          <img
            src={`https://app.idm.in/assets/icon/types/${d.device}.png`}
            alt={d.device}
            className="h-4 w-4"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ),
      })),
    [deviceData]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analytics
            {keyParam && (
              <Badge variant="secondary" className="ml-2 text-xs font-normal">
                /{keyParam}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Track your link performance</p>
        </div>

        <Select
          items={INTERVALS.map((i) => ({ value: i.value, label: `Last ${i.label}` }))}
          value={interval}
          onValueChange={(v) => v && setInterval(v)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INTERVALS.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                Last {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} loading={clicksLoading} />
        <StatCard label="Countries" value={countryData?.length || 0} loading={countryLoading} />
        <StatCard label="Top Links" value={topData?.length || 0} loading={topLoading} />
        <StatCard label="Referers" value={refererData?.length || 0} loading={refererLoading} />
      </div>

      {/* Clicks Over Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Clicks Over Time</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
              <Label htmlFor="show-labels" className="text-xs text-muted-foreground">Labels</Label>
            </div>
            <ToggleGroup value={[chartType]} onValueChange={(v) => v[0] && setChartType(v[0] as typeof chartType)} size="sm">
              <ToggleGroupItem value="area" aria-label="Area chart"><AreaChartIcon className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="bar" aria-label="Bar chart"><BarChart3 className="h-4 w-4" /></ToggleGroupItem>
              <ToggleGroupItem value="line" aria-label="Line chart"><LineChartIcon className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          {clicksLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--popover-foreground))" }} />
                  <Bar dataKey="clicks" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}>
                    {showLabels && <LabelList dataKey="clicks" position="top" className="fill-foreground text-xs" />}
                  </Bar>
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--popover-foreground))" }} />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-1))" }}>
                    {showLabels && <LabelList dataKey="clicks" position="top" className="fill-foreground text-xs" />}
                  </Line>
                </LineChart>
              ) : (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--popover-foreground))" }} />
                  <Area type="monotone" dataKey="clicks" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1}>
                    {showLabels && <LabelList dataKey="clicks" position="top" className="fill-foreground text-xs" />}
                  </Area>
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Grid: Countries, Referers, Top Links */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ListCard title="Countries" data={countriesList} loading={countryLoading} />
        <ListCard title="Referers" data={referersList} loading={refererLoading} />
        <ListCard title="Top Links" data={topList} loading={topLoading} />
      </div>

      {/* Grid: Browser, OS, Device */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ListCard title="Browsers" data={browserList} loading={browserLoading} />
        <ListCard title="Operating Systems" data={osList} loading={osLoading} />

        <ListCard title="Devices" data={deviceList} loading={deviceLoading} />
      </div>
    </div>
  );
}
