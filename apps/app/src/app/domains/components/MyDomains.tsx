import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Star,
  Trash2,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Domain } from '@/types/domain';
import { DomainFavicon } from '@/components/DomainFavicon';

interface MyDomainsProps {
  onVerify: (domain: Domain) => void;
}

export function MyDomains({ onVerify }: MyDomainsProps) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<Domain | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => api.domains.list({ limit: 100 }),
  });

  const setDefault = useMutation({
    mutationFn: (domain: Domain) =>
      api.domains.update(domain.domain_id, { is_default: !domain.is_default }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['domains'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (domain: Domain) => api.domains.delete(domain.domain_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain removed');
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const domains = data?.result || [];

  if (isLoading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="gap-0 rounded-xl py-0 shadow-xs">
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No domains yet. Add a domain you own to shorten links pointing to it.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {domains.map((d) => (
        <Card key={d.domain_id} className="gap-0 rounded-xl py-0 shadow-xs">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <DomainFavicon domain={d.domain} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{d.domain}</p>
                  {!!d.is_default && <Badge variant="outline">Default</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Added {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {d.is_verified ? (
                <Badge>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                </Badge>
              ) : (
                <>
                  <Badge variant="secondary">
                    <AlertCircle className="mr-1 h-3 w-3" /> Pending
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => onVerify(d)}>
                    Verify
                  </Button>
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setDefault.mutate(d)}>
                    <Star className="mr-2 h-4 w-4" />
                    {d.is_default ? 'Unset default' : 'Set as default'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setDeleting(d)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deleting?.domain}"? New short
              links to this domain can't be created until it's added and
              verified again. Removed domains still count towards your plan's
              domain limit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMutation.mutate(deleting)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
