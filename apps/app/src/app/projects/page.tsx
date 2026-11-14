import { useState } from "react";
import { Link as RouterLink } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  FolderKanban,
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/lib/api";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useProjects } from "@/hooks/use-projects";
import type { Project } from "@/types/project";
import { ProjectDialog } from "./components/ProjectDialog";
import { ProjectDot } from "./components/ProjectBadge";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export default function Projects() {
  const queryClient = useQueryClient();
  const { user } = useAuthUser();
  const { projects, isLoading } = useProjects();
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const limit = user?.projects_limit ?? 0;
  const atLimit = projects.length >= limit;
  const noPlan = !!user && limit === 0;

  const remove = useMutation({
    mutationFn: (project: Project) => api.projects.delete(project.project_id),
    onSuccess: (_, project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success(`${project.name} deleted`);
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const newButton = (
    <Button onClick={() => setCreating(true)} disabled={!user || atLimit}>
      <Plus className="mr-2 h-4 w-4" /> New project
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Group links by campaign, client or brand
            {limit > 0 && ` · ${projects.length} of ${limit} used`}
          </p>
        </div>
        {!noPlan && newButton}
      </div>

      {noPlan ? (
        <EmptyState
          icon={FolderKanban}
          title="Projects are on paid plans"
          description="Group short links by campaign, client or brand, and filter links and click analytics by project. Starter includes 3 projects, Pro 5 and Business 10."
          action={<Button nativeButton={false} render={<RouterLink to="/billings" />}>Upgrade plan</Button>}
          docs="projects"
        />
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project, then pick it in the link builder to keep a campaign's links together."
          action={newButton}
          docs="projects"
        />
      ) : (
        <>
          {atLimit && (
            <p className="text-sm text-muted-foreground">
              You're using all {limit} projects on your plan.{" "}
              <RouterLink to="/billings" className="font-medium text-foreground underline">
                Upgrade
              </RouterLink>{" "}
              for more.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.project_id} className="gap-0 rounded-xl py-0 shadow-xs">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ProjectDot color={project.color} className="size-3.5" />
                      <span className="truncate font-medium">{project.name}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="-mt-1 -mr-2 h-8 w-8" />}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Project actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(project)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleting(project)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plural(project.total_links ?? 0, "link")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<RouterLink to={`/links?project=${project.project_id}`} />}
                    >
                      <Link2 className="mr-1.5 h-3.5 w-3.5" /> Links
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<RouterLink to={`/analytics?project=${project.project_id}`} />}
                    >
                      <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <ProjectDialog open={creating} onOpenChange={setCreating} />
      <ProjectDialog
        open={!!editing}
        project={editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (deleting.total_links ?? 0) > 0 ? (
                <>
                  This also deletes the{" "}
                  <span className="font-medium text-foreground">
                    {plural(deleting.total_links ?? 0, "short link")}
                  </span>{" "}
                  in it. They stop redirecting, and anyone who clicks them, or scans their QR
                  codes, won't reach your pages. This can't be undone.
                </>
              ) : (
                "The project is empty. This can't be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting)}
            >
              {remove.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete project{(deleting?.total_links ?? 0) > 0 && " and links"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
