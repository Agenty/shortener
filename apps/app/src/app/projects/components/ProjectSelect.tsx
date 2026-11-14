import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/types/project";
import { ProjectDot } from "./ProjectBadge";

/** Select values are strings, this one stands for "no project" or "all projects" */
const NONE = "none";

interface ProjectSelectProps {
  projects: Project[];
  value: number | null;
  onChange: (projectId: number | null) => void;
  /** Label of the empty choice, "All projects" for a filter, "No project" when assigning */
  noneLabel: string;
  id?: string;
  className?: string;
}

export function ProjectSelect({ projects, value, onChange, noneLabel, id, className }: ProjectSelectProps) {
  const items = [
    { value: NONE, label: noneLabel },
    ...projects.map((p) => ({ value: String(p.project_id), label: p.name })),
  ];

  return (
    <Select
      items={items}
      value={value ? String(value) : NONE}
      onValueChange={(v) => onChange(v && v !== NONE ? Number(v) : null)}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{noneLabel}</SelectItem>
        {projects.length > 0 && <SelectSeparator />}
        {projects.map((p) => (
          <SelectItem key={p.project_id} value={String(p.project_id)}>
            <span className="flex min-w-0 items-center gap-2">
              <ProjectDot color={p.color} />
              <span className="truncate">{p.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
