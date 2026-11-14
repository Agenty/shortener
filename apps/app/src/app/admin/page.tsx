import { useEffect, useState } from "react";
import { Navigate, Link as RouterLink } from "react-router";
import { useQueryState } from "nuqs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle2,
  ExternalLink,
  Flame,
  Link2,
  Loader2,
  Lock,
  Search,
  SearchX,
  ShieldAlert,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { DomainFavicon } from "@/components/DomainFavicon";
import { api } from "@/lib/api";
import { SHORT_DOMAIN } from "@/env";
import { useAuthUser } from "@/hooks/use-auth-user";
import type { AdminUser } from "@/types/admin";

const date = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : "–");

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

/** `srt1.link/abc`, `https://srt1.link/abc?x=1` or `abc` to `abc` */
const toKey = (input: string) => input.trim().split("?")[0].replace(/\/+$/, "").split("/").pop() ?? "";

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Disables or enables any link for every visitor, used on reported links */
function useLinkStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      api.admin.setLinkEnabled(key, enabled),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Enabled" : "Disabled"}</Badge>;
}

function LinkLookup({ initialKey }: { initialKey: string }) {
  const [input, setInput] = useState(initialKey);
  const [key, setKey] = useState(initialKey);
  const status = useLinkStatus();

  useEffect(() => {
    setInput(initialKey);
    setKey(initialKey);
  }, [initialKey]);

  const { data: link, isFetching, error } = useQuery({
    queryKey: ["admin", "link", key],
    queryFn: () => api.admin.link(key),
    enabled: !!key,
    retry: false,
  });

  return (
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setKey(toKey(input).toLowerCase());
        }}
      >
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={`${SHORT_DOMAIN}/spring-sale or spring-sale`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={!input.trim()}>
          {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Look up
        </Button>
      </form>

      {!key ? (
        <p className="text-sm text-muted-foreground">
          Paste a reported short link to see where it goes and who created it, then disable it.
        </p>
      ) : error ? (
        <EmptyState icon={SearchX} title="Link not found" description={(error as Error).message} />
      ) : link ? (
        <Card className="rounded-xl">
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {SHORT_DOMAIN}/{link.key}
              </span>
              <StatusBadge enabled={!!link.is_enabled} />
              {link.has_password && (
                <Badge variant="outline">
                  <Lock className="mr-1 h-3 w-3" /> Password
                </Badge>
              )}
            </div>

            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="text-muted-foreground">Destination</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <DomainFavicon domain={hostOf(link.url)} size="sm" />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="truncate hover:underline"
                >
                  {link.url}
                </a>
              </dd>
              <dt className="text-muted-foreground">Created by</dt>
              <dd>
                {link.owner_name || "Unknown"}
                {link.owner_email && <span className="text-muted-foreground"> · {link.owner_email}</span>}
              </dd>
              <dt className="text-muted-foreground">Account</dt>
              <dd>
                <RouterLink to={`/admin?tab=users&account=${link.account_id}`} className="underline">
                  #{link.account_id}, all links
                </RouterLink>
              </dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{date(link.created_at)}</dd>
            </dl>

            <div className="flex flex-wrap gap-2">
              {link.is_enabled ? (
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={status.isPending}
                  onClick={() => status.mutate({ key: link.key, enabled: false })}
                >
                  <Ban className="mr-2 h-4 w-4" /> Disable link
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={status.isPending}
                  onClick={() => status.mutate({ key: link.key, enabled: true })}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Enable link
                </Button>
              )}
              <Button
                variant="outline"
                nativeButton={false}
                render={<RouterLink to={`/domains?tab=blocked`} />}
              >
                <ShieldAlert className="mr-2 h-4 w-4" /> Block a domain
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Disabling applies to every visitor at once. Visitors see "This link is not available".
            </p>
          </CardContent>
        </Card>
      ) : (
        <Skeleton className="h-56 rounded-xl" />
      )}
    </div>
  );
}

function AccountLinks({ accountId, onInspect }: { accountId: number; onInspect: (key: string) => void }) {
  const status = useLinkStatus();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "account-links", accountId],
    queryFn: () => api.admin.accountLinks(accountId, { limit: 100 }),
  });

  if (isLoading) return <Skeleton className="h-40 rounded-xl" />;
  if (!data?.length) {
    return <EmptyState icon={Link2} title="No links" description={`Account #${accountId} has no short links.`} />;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short link</TableHead>
            <TableHead className="hidden md:table-cell">Destination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((link) => (
            <TableRow key={link.key}>
              <TableCell>
                <button className="font-medium hover:underline" onClick={() => onInspect(link.key)}>
                  {link.key}
                </button>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="block max-w-[320px] truncate text-sm text-muted-foreground">{link.url}</span>
              </TableCell>
              <TableCell>
                <StatusBadge enabled={!!link.is_enabled} />
              </TableCell>
              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                {date(link.created_at)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={status.isPending}
                  onClick={() => status.mutate({ key: link.key, enabled: !link.is_enabled })}
                >
                  {link.is_enabled ? "Disable" : "Enable"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UsersTab({
  accountId,
  onAccount,
  onInspect,
}: {
  accountId: number | null;
  onAccount: (id: number | null) => void;
  onInspect: (key: string) => void;
}) {
  const [search, setSearch] = useState("");
  const term = useDebounced(search.trim());
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", term],
    queryFn: () => api.admin.users({ limit: 100, search: term || undefined }),
  });
  const users: AdminUser[] = data?.result ?? [];

  if (accountId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">Links of account #{accountId}</h2>
          <Button variant="outline" size="sm" onClick={() => onAccount(null)}>
            Back to users
          </Button>
        </div>
        <AccountLinks accountId={accountId} onInspect={onInspect} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-60 rounded-xl" />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description={term ? `Nothing matches "${term}".` : undefined} />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Last login</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    #{u.account_id}
                    <div className="text-xs text-muted-foreground">{u.role}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={u.status === "active" ? "outline" : "secondary"}>{u.status}</Badge>
                      {!u.is_verified && <Badge variant="secondary">Unverified</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {date(u.last_login_at)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {date(u.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onAccount(u.account_id)}>
                      Links
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {users.length >= 100 && (
        <p className="text-xs text-muted-foreground">Showing the newest 100. Search to find others.</p>
      )}
    </div>
  );
}

function TopLinksTab({ onInspect }: { onInspect: (key: string) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "top-links"],
    queryFn: () => api.admin.topLinks(50),
  });
  const rows = data?.result ?? [];

  if (isLoading) return <Skeleton className="h-60 rounded-xl" />;
  if (!rows.length) {
    return <EmptyState icon={Flame} title="No clicks in the last 24 hours" />;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Most clicked links on the service in the last 24 hours. A sudden spike on a new link is worth a look.
      </p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short link</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const key = toKey(row.url);
              return (
                <TableRow key={row.url}>
                  <TableCell className="font-medium">
                    {SHORT_DOMAIN}/{key}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{Number(row.clicks).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onInspect(key)}>
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function Admin() {
  const { isAdmin, isLoading } = useAuthUser();
  const [tab, setTab] = useQueryState("tab", { defaultValue: "lookup" });
  const [key, setKey] = useQueryState("key", { defaultValue: "" });
  const [account, setAccount] = useQueryState("account");

  if (isLoading) return <Skeleton className="h-60 rounded-xl" />;
  // The API refuses admin calls without a level too, this only hides the page
  if (!isAdmin) return <Navigate to="/links" replace />;

  const inspect = (linkKey: string) => {
    setKey(linkKey);
    setTab("lookup");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground">Review reported links, users and traffic across the service</p>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<a href="https://shortener.dev/report" target="_blank" rel="noopener noreferrer" />}
        >
          Report form <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value)}>
        <TabsList>
          <TabsTrigger value="lookup">Link lookup</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="top">Top links</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
        </TabsList>
        <TabsContent value="lookup" className="pt-2">
          <LinkLookup initialKey={key} />
        </TabsContent>
        <TabsContent value="users" className="pt-2">
          <UsersTab
            accountId={Number(account) || null}
            onAccount={(id) => setAccount(id ? String(id) : null)}
            onInspect={inspect}
          />
        </TabsContent>
        <TabsContent value="top" className="pt-2">
          <TopLinksTab onInspect={inspect} />
        </TabsContent>
        <TabsContent value="domains" className="pt-2">
          <Card className="rounded-xl">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">
                Whitelisted and blocked domains apply to every account. Manage them on the Domains page, where
                staff see the Blocked tab and can whitelist, block or remove domains.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" nativeButton={false} render={<RouterLink to="/domains?tab=whitelisted" />}>
                  Whitelisted domains
                </Button>
                <Button variant="outline" nativeButton={false} render={<RouterLink to="/domains?tab=blocked" />}>
                  Blocked domains
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
