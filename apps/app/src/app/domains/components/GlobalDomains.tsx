import { useMemo, useState } from 'react';
import { Ban, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { GlobalDomain, GlobalDomainType } from '@/types/domain';

interface GlobalDomainsProps {
  type: GlobalDomainType;
  /** Admins can block, whitelist or remove the domains */
  isAdmin?: boolean;
}

const DESCRIPTIONS: Record<GlobalDomainType, string> = {
  whitelisted:
    'Popular domains anyone can shorten links to without verification, including their subdomains.',
  blocked:
    'Short links to these domains and their subdomains are denied for every account, even when verified.',
};

export function GlobalDomains({ type, isAdmin }: GlobalDomainsProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['global-domains', type],
    // Everyone can read the whitelist, the blocked list is admin only
    queryFn: () =>
      type === 'whitelisted'
        ? api.domains.whitelisted()
        : api.admin.domains.list({ type }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['global-domains'] });

  const move = useMutation({
    mutationFn: (d: GlobalDomain) =>
      api.admin.domains.upsert({
        domain: d.domain,
        type: d.type === 'whitelisted' ? 'blocked' : 'whitelisted',
      }),
    onSuccess: (d) => {
      invalidate();
      toast.success(`${d.domain} ${d.type} for all accounts`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (d: GlobalDomain) => api.admin.domains.delete(d.domain),
    onSuccess: (res) => {
      invalidate();
      toast.success(res.message);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const domains = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = data?.result || [];
    return term ? result.filter((d) => d.domain.includes(term)) : result;
  }, [data, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{DESCRIPTIONS[type]}</p>
        <div className="relative sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search domains"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : domains.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {search ? 'No matching domains.' : `No ${type} domains yet.`}
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <Card key={d.domain} size="sm">
              <CardContent className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  {type === 'whitelisted' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <Ban className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <span className="text-sm font-medium truncate">{d.domain}</span>
                  {d.is_builtin && <Badge variant="outline">Built-in</Badge>}
                </div>
                {isAdmin && !d.is_builtin && (
                  <div className="flex items-center shrink-0">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => move.mutate(d)}
                            disabled={move.isPending}
                          />
                        }
                      >
                        {type === 'whitelisted' ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {type === 'whitelisted' ? 'Block instead' : 'Whitelist instead'}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => remove.mutate(d)}
                            disabled={remove.isPending}
                          />
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>Remove</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
