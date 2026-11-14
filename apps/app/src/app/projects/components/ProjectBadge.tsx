import { cn } from "cn";
import type { Project } from "@/types/project";

/** Fallback label color for projects created without one */
const DEFAULT_COLOR = "#E0F2FE";

export function ProjectDot({ color, className }: { color?: string | null; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2.5 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/20", className)}
      style={{ backgroundColor: color || DEFAULT_COLOR }}
    />
  );
}

/** Project name with its color, shown next to a link */
export function ProjectBadge({ project, className }: { project: Project; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-40 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs text-muted-foreground",
        className
      )}
      title={project.name}
    >
      <ProjectDot color={project.color} />
      <span className="truncate">{project.name}</span>
    </span>
  );
}
