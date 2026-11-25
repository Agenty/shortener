import { useState } from 'react';
import { Trash2, Loader2, KeyRound } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { CreateApiKeyDialog } from './components/CreateApiKeyDialog';
import { formatDistanceToNow } from 'date-fns';

export default function ApiKeys() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['apikeys'],
    queryFn: () => api.apikeys.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.apikeys.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apikeys'] });
      toast.success('API key deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const keys = data?.result || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic access
          </p>
        </div>
        <CreateApiKeyDialog />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </CardContent>
            </Card>
          ))
        ) : keys.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No API keys yet"
            description="Create a key to shorten links and read analytics from your own apps and scripts."
            action={<CreateApiKeyDialog />}
            docs="api-keys"
          />
        ) : (
          keys.map((apiKey) => (
            <Card key={apiKey.key_id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{apiKey.name}</p>
                    <Badge
                      variant={apiKey.is_enabled ? 'default' : 'secondary'}
                    >
                      {apiKey.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created{' '}
                    {formatDistanceToNow(new Date(apiKey.created_at), {
                      addSuffix: true,
                    })}
                    {apiKey.updated_at &&
                      ` · Updated ${formatDistanceToNow(new Date(apiKey.updated_at), { addSuffix: true })}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        />
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{apiKey.name}"? This
                          action cannot be undone and any integrations using
                          this key will stop working.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(apiKey.key_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
