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
  Link2,
  SearchX,
  QrCode,
  FolderInput,
  Check,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SHORT_DOMAIN } from '@/env';
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { DomainFavicon } from '@/components/DomainFavicon';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { CreateLinkDialog } from './components/CreateLinkDialog';
import { ApiExamplesSheet } from './components/ApiExamplesSheet';
import { QrCodeDialog } from './components/QrCodeDialog';
import { api } from '@/lib/api';
import { useViewPreference } from '@/hooks/use-view-preference';
import type { Link } from '@/types/link';
import type { Project } from '@/types/project';
import { useProjects } from '@/hooks/use-projects';
import { ProjectBadge, ProjectDot } from '@/app/projects/components/ProjectBadge';
import { ProjectSelect } from '@/app/projects/components/ProjectSelect';

const PER_PAGE = 25;

function getDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function LinkFavicon({ url }: { url: string }) {
  return <DomainFavicon domain={getDomain(url)} size="sm" />;
}

type RowActions = {
  onCopy: (key: string) => void;
  onQr: (key: string) => void;
  onDelete: (key: string) => void;
  onMove: (link: Link, projectId: number | null) => void;
  projects: Project[];
  projectsById: Map<number, Project>;
};

function LinkActions({
  link,
  onCopy,
  onQr,
  onDelete,
  onMove,
  projects,
}: { link: Link } & Omit<RowActions, 'projectsById'>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onCopy(link.key)}>
          <Copy className="mr-2 h-4 w-4" /> Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onQr(link.key)}>
          <QrCode className="mr-2 h-4 w-4" /> QR Code
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href={link.url} target="_blank" rel="noopener noreferrer" />}>
          <ExternalLink className="mr-2 h-4 w-4" /> Open
        </DropdownMenuItem>
        {projects.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderInput className="mr-2 h-4 w-4" /> Move to project
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onMove(link, null)}>
                <span className="mr-2 inline-flex w-4 justify-center">
                  {!link.project_id && <Check className="h-4 w-4" />}
                </span>
                No project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {projects.map((p) => (
                <DropdownMenuItem key={p.project_id} onClick={() => onMove(link, p.project_id)}>
                  <span className="mr-2 inline-flex w-4 justify-center">
                    {link.project_id === p.project_id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ProjectDot color={p.color} />
                    )}
                  </span>
                  <span className="truncate">{p.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
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

function LinksGrid({ links, ...actions }: { links: Link[] } & RowActions) {
  const { onCopy, onQr, projectsById } = actions;
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
                {SHORT_DOMAIN}/{link.key}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => onCopy(link.key)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                aria-label="QR code"
                onClick={() => onQr(link.key)}
              >
                <QrCode className="h-3 w-3" />
              </Button>
            </div>
            <LinkActions link={link} {...actions} />
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
            <div className="flex items-center gap-2 min-w-0">
              {link.project_id && projectsById.get(link.project_id) && (
                <ProjectBadge project={projectsById.get(link.project_id)!} />
              )}
              <Badge
                variant={link.is_enabled ? 'default' : 'secondary'}
                className="text-xs"
              >
                {link.is_enabled ? 'Enabled' : 'Disabled'}
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

function LinksTable({ links, ...actions }: { links: Link[] } & RowActions) {
  const { onCopy, onQr, projectsById } = actions;
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
                  <span className="text-primary">{SHORT_DOMAIN}/{link.key}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onCopy(link.key)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -ml-2"
                    aria-label="QR code"
                    onClick={() => onQr(link.key)}
                  >
                    <QrCode className="h-3 w-3" />
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
                {link.project_id && projectsById.get(link.project_id) && (
                  <ProjectBadge project={projectsById.get(link.project_id)!} className="mt-1" />
                )}
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
                  variant={link.is_enabled ? 'default' : 'secondary'}
                >
                  {link.is_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                {new Date(link.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <LinkActions link={link} {...actions} />
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
  const [project, setProject] = useQueryState('project');
  const projectId = Number(project) || null;
  const { projects, byId: projectsById } = useProjects();
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [qrKey, setQrKey] = useState<string | null>(null);
  const [view, setView] = useViewPreference('links-view');
  const queryClient = useQueryClient();

  const currentPage = parseInt(page) || 1;
  const offset = (currentPage - 1) * PER_PAGE;

  const { data, isLoading, error } = useQuery({
    queryKey: ['links', search, currentPage, projectId],
    queryFn: () =>
      api.links.list({
        offset,
        limit: PER_PAGE,
        search: search || undefined,
        project_id: projectId ?? undefined,
      }),
  });

  // An update replaces every setting, so the full link goes back with the new project
  const moveMutation = useMutation({
    mutationFn: ({ link, projectId }: { link: Link; projectId: number | null }) =>
      api.links.update(link.key, { ...link, project_id: projectId }),
    onSuccess: (_, { link, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      const name = projectId ? projectsById.get(projectId)?.name : null;
      toast.success(name ? `Moved ${link.key} to ${name}` : `Removed ${link.key} from its project`);
    },
    onError: (error: Error) => toast.error(error.message || 'Failed to move link'),
  });
  const moveLink = (link: Link, projectId: number | null) => {
    if (link.project_id !== projectId) moveMutation.mutate({ link, projectId });
  };
  const rowActions = {
    onCopy: (key: string) => copyLink(key),
    onQr: setQrKey,
    onDelete: setDeleteKey,
    onMove: moveLink,
    projects,
    projectsById,
  };

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
    navigator.clipboard.writeText(`https://${SHORT_DOMAIN}/${key}`);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background pb-4 pt-1 -mt-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Links</h1>
            <p className="text-muted-foreground">Manage your shortened links</p>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup
              value={[view]}
              onValueChange={(v) => v[0] && setView(v[0] as 'list' | 'grid')}
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
            {projects.length > 0 && (
              <ProjectSelect
                projects={projects}
                value={projectId}
                onChange={(id) => {
                  setProject(id ? String(id) : null);
                  setPage('1');
                }}
                noneLabel="All projects"
                className="w-[160px]"
              />
            )}
            <ApiExamplesSheet />
            <CreateLinkDialog projectId={projectId} />
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
        search ? (
          <EmptyState
            icon={SearchX}
            title="No matching links"
            description={`Nothing matches "${search}". Try a different keyword or clear the search.`}
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch(null);
                  setPage('1');
                }}
              >
                Clear search
              </Button>
            }
          />
        ) : projectId ? (
          <EmptyState
            icon={Link2}
            title={`No links in ${projectsById.get(projectId)?.name ?? 'this project'}`}
            description="Create a link in this project, or move existing links here from their ... menu."
            action={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setProject(null)}>
                  Show all links
                </Button>
                <CreateLinkDialog projectId={projectId} />
              </div>
            }
          />
        ) : (
          <EmptyState
            icon={Link2}
            title="No links yet"
            description="Create your first short link to share it anywhere and track every click."
            action={<CreateLinkDialog />}
            docs="create-short-link"
          />
        )
      )}
      {!isLoading &&
        !error &&
        links.length > 0 &&
        (view === 'grid' ? (
          <LinksGrid links={links} {...rowActions} />
        ) : (
          <LinksTable links={links} {...rowActions} />
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

      <QrCodeDialog linkKey={qrKey} onOpenChange={(open) => !open && setQrKey(null)} />

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
                {SHORT_DOMAIN}/{deleteKey}
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
