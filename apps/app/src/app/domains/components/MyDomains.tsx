import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Globe,
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
      toast.success('Domain deleted');
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const domains = data?.result || [];

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 p-4">
              <Skeleton className="h-5 w-5 rounded" />
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
    <div className="grid gap-3">
      {domains.map((d) => (
        <Card key={d.domain_id}>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <Globe className="h-5 w-5 shrink-0 text-muted-foreground" />
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
            <div className="flex items-center gap-2">
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
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
            <AlertDialogTitle>Delete Domain</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleting?.domain}"? New short
              links to this domain can't be created until it's added and
              verified again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && deleteMutation.mutate(deleting)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
