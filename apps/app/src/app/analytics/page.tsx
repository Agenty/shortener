import { useState, useMemo } from "react";
import { Link as RouterLink, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MousePointerClick,
  Globe,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  ListFilter,
  TableProperties,
  X,
} from "lucide-react";
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
import type { AnalyticsParams } from "@/types/analytics";
import { format, parseISO } from "date-fns";
import { hasFlag } from "country-flag-icons";
import * as Flags from "country-flag-icons/react/3x2";

const INTERVALS = [
  { label: "24h", value: "1" },
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
];

// Theme chart color, see --chart-1 in index.css
const CHART_COLOR = "var(--chart-1)";
const AXIS_COLOR = "var(--muted-foreground)";
const GRID_COLOR = "var(--border)";
const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--popover-foreground)",
};

/** Drill-down filters, kept in the URL so a filtered view can be shared */
const FILTERS = [
  { name: "key", label: "Link" },
  { name: "country", label: "Country" },
  { name: "referer", label: "Referer" },
  { name: "browser", label: "Browser" },
  { name: "os", label: "OS" },
  { name: "device", label: "Device" },
] as const;

type FilterName = (typeof FILTERS)[number]["name"];

type ListItem = {
  label: string;
  clicks: number;
  icon?: React.ReactNode;
  /** Filter value applied when the row is clicked, rows without one can't be drilled into */
  value?: string;
};

/** The API reports clicks without a referrer as `(direct)` */
const isDirect = (referer?: string) =>
  !referer || referer === "(direct)" || referer === "null";

function getHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    try {
      return new URL(`https://${value}`).hostname;
    } catch {
      return "";
    }
  }
}

function CountryFlag({ code }: { code: string }) {
  const upper = code.toUpperCase();
  if (hasFlag(upper)) {
    const FlagComponent = (
      Flags as unknown as Record<
        string,
        React.ComponentType<{ className?: string }>
      >
    )[upper];
    if (FlagComponent) return <FlagComponent className="h-4 w-5 rounded-sm" />;
  }
  return <Globe className="h-4 w-4 text-muted-foreground" />;
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <MousePointerClick className="h-4 w-4 text-chart-1" />
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
  active,
  onSelect,
}: {
  title: string;
  data: ListItem[];
  loading: boolean;
  /** Value of the filter currently applied on this dimension */
  active?: string;
  onSelect?: (value: string) => void;
}) {
  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available</p>
        ) : (
          data.slice(0, 8).map((item, i) => {
            const clickable = !!onSelect && !!item.value;
            const isActive = !!active && active === item.value;
            return (
              <button
                key={i}
                type="button"
                disabled={!clickable}
                title={clickable ? `Filter by ${item.label}` : undefined}
                onClick={() => clickable && onSelect(item.value!)}
                className={`group relative flex w-full items-center justify-between overflow-hidden rounded-md px-2 py-1.5 text-left text-sm ${
                  clickable
                    ? "cursor-pointer hover:ring-1 hover:ring-chart-1/50"
                    : "cursor-default"
                } ${isActive ? "ring-1 ring-chart-1" : ""}`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-chart-1/15 dark:bg-chart-1/25"
                  style={{ width: `${(item.clicks / maxClicks) * 100}%` }}
                />
                <div className="relative flex items-center gap-2 truncate">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                  {clickable && !isActive && (
                    <ListFilter className="h-3 w-3 shrink-0 text-chart-1 opacity-0 group-hover:opacity-100" />
                  )}
                </div>
                <span className="relative font-medium tabular-nums shrink-0">
                  {item.clicks.toLocaleString()}
                </span>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [interval, setInterval] = useState("7");
  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");
  const [showLabels, setShowLabels] = useState(false);
  const intervalNum = Number(interval);

  const filters = useMemo(() => {
    const active: Partial<Record<FilterName, string>> = {};
    for (const { name } of FILTERS) {
      const value = searchParams.get(name);
      if (value) active[name] = value;
    }
    return active;
  }, [searchParams]);

  const setFilter = (name: FilterName, value?: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(name, value);
      else next.delete(name);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      FILTERS.forEach(({ name }) => next.delete(name));
      return next;
    });
  };

  // Clicking the applied value again removes the filter
  const toggleFilter = (name: FilterName) => (value: string) =>
    setFilter(name, filters[name] === value ? undefined : value);

  const activeFilters = FILTERS.filter(({ name }) => filters[name]);
  const reportsLink = `/reports?${new URLSearchParams(
    activeFilters.map(({ name }) => [name, filters[name]!]),
  ).toString()}`;

  const queryParams: AnalyticsParams = { interval: intervalNum, ...filters };

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
    [clicksData],
  );

  const totalClicks = useMemo(
    () => (clicksData || []).reduce((sum, d) => sum + Number(d.clicks), 0),
    [clicksData],
  );

  const countriesList = useMemo(
    () =>
      (countryData || []).map((d) => ({
        label: d.country || "Unknown",
        value: d.country || undefined,
        clicks: Number(d.clicks),
        icon: <CountryFlag code={d.country} />,
      })),
    [countryData],
  );

  const referersList = useMemo(
    () =>
      (refererData || []).map((d) => ({
        label: isDirect(d.referer) ? "Direct" : d.referer,
        value: d.referer || undefined,
        clicks: Number(d.clicks),
        icon: !isDirect(d.referer) ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${getHostname(d.referer)}&sz=16`}
            alt=""
            className="h-4 w-4 rounded-sm"
          />
        ) : (
          <Globe className="h-4 w-4 text-muted-foreground" />
        ),
      })),
    [refererData],
  );

  const topList = useMemo(
    () =>
      (topData || []).map((d) => {
        let domain = d.url;
        try {
          domain = new URL(d.url).pathname;
        } catch {}
        return {
          label: domain,
          value: domain.replace(/^\//, "") || undefined,
          clicks: Number(d.clicks),
          icon: (
            <img
              src={`https://www.google.com/s2/favicons?domain=${getHostname(d.url)}&sz=16`}
              alt=""
              className="h-4 w-4 rounded-sm"
            />
          ),
        };
      }),
    [topData],
  );

  const browserList = useMemo(
    () =>
      (browserData || []).map((d) => ({
        label: d.browser || "Unknown",
        value: d.browser || undefined,
        clicks: Number(d.clicks),
        icon: (
          <img
            src={`https://app.shortener.dev/assets/icon/browsers/${d.browser}.png`}
            alt={d.browser}
            className="h-4 w-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ),
      })),
    [browserData],
  );

  const osList = useMemo(
    () =>
      (osData || []).map((d) => ({
        label: d.os || "Unknown",
        value: d.os || undefined,
        clicks: Number(d.clicks),
        icon: (
          <img
            src={`https://app.shortener.dev/assets/icon/os/${d.os}.png`}
            alt={d.os}
            className="h-4 w-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ),
      })),
    [osData],
  );

  const deviceList = useMemo(
    () =>
      (deviceData || []).map((d) => ({
        label: d.device || "Unknown",
        value: d.device || undefined,
        clicks: Number(d.clicks),
        icon: (
          <img
            src={`https://app.shortener.dev/assets/icon/types/${d.device}.png`}
            alt={d.device}
            className="h-4 w-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ),
      })),
    [deviceData],
  );

  const axisProps = {
    className: "text-xs",
    tick: { fill: AXIS_COLOR },
    stroke: GRID_COLOR,
  };

  const labels = showLabels && (
    <LabelList
      dataKey="clicks"
      position="top"
      className="fill-foreground text-xs"
    />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your link performance</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<RouterLink to={reportsLink} />}
          >
            <TableProperties className="mr-1.5 h-3.5 w-3.5" /> View clicks
          </Button>
          <Select
            items={INTERVALS.map((i) => ({
              value: i.value,
              label: `Last ${i.label}`,
            }))}
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
      </div>

      {/* Active drill-down filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map(({ name, label }) => (
            <Badge
              key={name}
              variant="outline"
              className="h-7 gap-1 border-chart-1/40 bg-chart-1/10 pl-2.5 pr-1 text-chart-4 dark:text-chart-3"
            >
              <span className="text-muted-foreground">{label}:</span>
              {name === "key"
                ? `/${filters[name]}`
                : name === "referer" && isDirect(filters[name])
                  ? "Direct"
                  : filters[name]}
              <button
                type="button"
                aria-label={`Remove ${label} filter`}
                onClick={() => setFilter(name)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-chart-1/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Clicks"
          value={totalClicks.toLocaleString()}
          loading={clicksLoading}
        />
        <StatCard
          label="Countries"
          value={countryData?.length || 0}
          loading={countryLoading}
        />
        <StatCard
          label="Top Links"
          value={topData?.length || 0}
          loading={topLoading}
        />
        <StatCard
          label="Referers"
          value={refererData?.length || 0}
          loading={refererLoading}
        />
      </div>

      {/* Clicks Over Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Clicks Over Time
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="show-labels"
                checked={showLabels}
                onCheckedChange={setShowLabels}
              />
              <Label
                htmlFor="show-labels"
                className="text-xs text-muted-foreground"
              >
                Labels
              </Label>
            </div>
            <ToggleGroup
              value={[chartType]}
              onValueChange={(v) =>
                v[0] && setChartType(v[0] as typeof chartType)
              }
              size="sm"
            >
              <ToggleGroupItem value="area" aria-label="Area chart">
                <AreaChartIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="bar" aria-label="Bar chart">
                <BarChart3 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="line" aria-label="Line chart">
                <LineChartIcon className="h-4 w-4" />
              </ToggleGroupItem>
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
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: CHART_COLOR, fillOpacity: 0.08 }}
                  />
                  <Bar
                    dataKey="clicks"
                    fill={CHART_COLOR}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  >
                    {labels}
                  </Bar>
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke={CHART_COLOR}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLOR }}
                  >
                    {labels}
                  </Line>
                </LineChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={CHART_COLOR}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor={CHART_COLOR}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="date" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke={CHART_COLOR}
                    strokeWidth={2}
                    fill="url(#clicksFill)"
                  >
                    {labels}
                  </Area>
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Alert>
        <ListFilter />
        <AlertDescription>
          Click any link, country, referer, browser, OS or device below to
          filter the report.
        </AlertDescription>
      </Alert>

      {/* Grid: Countries, Referers, Top Links */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ListCard
          title="Countries"
          data={countriesList}
          loading={countryLoading}
          active={filters.country}
          onSelect={toggleFilter("country")}
        />
        <ListCard
          title="Referers"
          data={referersList}
          loading={refererLoading}
          active={filters.referer}
          onSelect={toggleFilter("referer")}
        />
        <ListCard
          title="Top Links"
          data={topList}
          loading={topLoading}
          active={filters.key}
          onSelect={toggleFilter("key")}
        />
      </div>

      {/* Grid: Browser, OS, Device */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ListCard
          title="Browsers"
          data={browserList}
          loading={browserLoading}
          active={filters.browser}
          onSelect={toggleFilter("browser")}
        />
        <ListCard
          title="Operating Systems"
          data={osList}
          loading={osLoading}
          active={filters.os}
          onSelect={toggleFilter("os")}
        />
        <ListCard
          title="Devices"
          data={deviceList}
          loading={deviceLoading}
          active={filters.device}
          onSelect={toggleFilter("device")}
        />
      </div>
    </div>
  );
}
