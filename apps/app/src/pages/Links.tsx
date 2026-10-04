import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Loader2,
  BarChart3,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';
import { CreateLinkDialog } from '@/components/CreateLinkDialog';
import { ApiExamplesSheet } from '@/components/ApiExamplesSheet';
import { api } from '@/lib/api';
import { useViewPreference } from '@/hooks/use-view-preference';
import type { Link } from '@/types/link';

const PER_PAGE = 25;

function getDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function LinkFavicon({ url }: { url: string }) {
  const domain = getDomain(url);
  if (!domain) return null;
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      className="h-4 w-4 rounded-sm shrink-0"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

function LinkActions({
  link,
  onCopy,
  onDelete,
}: {
  link: Link;
  onCopy: (key: string) => void;
  onDelete: (key: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onCopy(link.key)}>
          <Copy className="mr-2 h-4 w-4" /> Copy
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Open
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(link.key)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LinksGrid({
  links,
  onCopy,
  onDelete,
}: {
  links: Link[];
  onCopy: (key: string) => void;
  onDelete: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {links.map((link) => (
        <div
          key={link.key}
          className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <LinkFavicon url={link.url} />
              <span className="text-primary font-medium truncate">
                idm.in/{link.key}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => onCopy(link.key)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <LinkActions link={link} onCopy={onCopy} onDelete={onDelete} />
          </div>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground text-sm truncate block hover:text-primary hover:underline"
          >
            {link.url}
          </a>
          <div className="flex items-center justify-between">
            <RouterLink
              to={`/analytics?key=${link.key}`}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Analytics</span>
            </RouterLink>
            <div className="flex items-center gap-2">
              <Badge
                variant={link.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {link.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(link.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LinksTable({
  links,
  onCopy,
  onDelete,
}: {
  links: Link[];
  onCopy: (key: string) => void;
  onDelete: (key: string) => void;
}) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short Link</TableHead>
            <TableHead className="hidden md:table-cell">Destination</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <TableRow key={link.key}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <LinkFavicon url={link.url} />
                  <span className="text-primary">idm.in/{link.key}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onCopy(link.key)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm truncate max-w-[300px] block hover:text-primary hover:underline"
                >
                  {link.url}
                </a>
              </TableCell>
              <TableCell>
                <RouterLink
                  to={`/analytics?key=${link.key}`}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span className="text-sm">View</span>
                </RouterLink>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge
                  variant={link.status === 'active' ? 'default' : 'secondary'}
                >
                  {link.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                {new Date(link.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <LinkActions link={link} onCopy={onCopy} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Links() {
  const [search, setSearch] = useQueryState('q', { defaultValue: '' });
  const [page, setPage] = useQueryState('page', { defaultValue: '1' });
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [view, setView] = useViewPreference('links-view');
  const queryClient = useQueryClient();

  const currentPage = parseInt(page) || 1;
  const offset = (currentPage - 1) * PER_PAGE;

  const { data, isLoading, error } = useQuery({
    queryKey: ['links', search, currentPage],
    queryFn: () =>
      api.links.list({ offset, limit: PER_PAGE, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => api.links.delete(key),
    onSuccess: () => {
      toast.success('Link deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setDeleteKey(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete link');
    },
  });

  const links = data?.result ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PER_PAGE);

  const copyLink = (key: string) => {
    navigator.clipboard.writeText(`https://idm.in/${key}`);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background pb-4 pt-1 -mt-1 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Links</h1>
            <p className="text-muted-foreground">Manage your shortened links</p>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as 'list' | 'grid')}
              size="sm"
              variant="outline"
            >
              <ToggleGroupItem value="list" aria-label="List view">
                <LayoutList className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search links..."
                className="pl-9 w-[200px] sm:w-[250px]"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage('1');
                }}
              />
            </div>
            <ApiExamplesSheet />
            <CreateLinkDialog />
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48 hidden md:block" />
              <Skeleton className="h-4 w-12 ml-auto" />
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="text-center py-8 text-destructive">
          Failed to load links
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && links.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No links found
        </div>
      )}
      {!isLoading &&
        !error &&
        links.length > 0 &&
        (view === 'grid' ? (
          <LinksGrid links={links} onCopy={copyLink} onDelete={setDeleteKey} />
        ) : (
          <LinksTable links={links} onCopy={copyLink} onDelete={setDeleteKey} />
        ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(String(currentPage - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(String(currentPage + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteKey}
        onOpenChange={(open) => !open && setDeleteKey(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-medium text-foreground">
                idm.in/{deleteKey}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteKey && deleteMutation.mutate(deleteKey)}
              disabled={deleteMutation.isPending}
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
  );
}
