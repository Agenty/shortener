import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { Project } from "@/types/project";

/** Same palette the API picks a random color from, see getRandomColor in apps/api */
const COLORS = [
  "#ffe4e6",
  "#fce7f3",
  "#ede9fe",
  "#e0f2fe",
  "#ccfbf1",
  "#dcfce7",
  "#ecfccb",
  "#fef3c7",
  "#ffedd5",
  "#f1f5f9",
];

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Project to rename, a new project when empty */
  project?: Project | null;
  onSaved?: (project: Project) => void;
}

export function ProjectDialog({ open, onOpenChange, project, onSaved }: ProjectDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(project?.name ?? "");
      setColor(project?.color ?? null);
    }
  }, [open, project]);

  const save = useMutation({
    mutationFn: () => {
      const data = { name: name.trim(), color, icon: project?.icon ?? null };
      return project ? api.projects.update(project.project_id, data) : api.projects.create(data);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(project ? "Project updated" : `${saved.name} created`);
      onSaved?.(saved);
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) save.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
            <DialogDescription>
              Group short links by campaign, client or brand, and see their clicks together.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              placeholder="Spring launch"
              maxLength={64}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full ring-1 ring-black/10 transition-shadow dark:ring-white/20",
                    color === c && "ring-2 ring-foreground dark:ring-foreground"
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="size-3.5 text-black/70" />}
                </button>
              ))}
            </div>
            {!project && !color && (
              <p className="text-xs text-muted-foreground">Leave it empty to pick one at random.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {project ? "Save" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
