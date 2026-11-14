import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Project } from "@/types/project";

/** Every project in the account, plans allow at most a few dozen */
export function useProjects(enabled = true) {
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list({ limit: 100 }),
    enabled,
    staleTime: 60 * 1000,
  });

  const projects = useMemo(() => data?.result ?? [], [data]);
  const byId = useMemo(
    () => new Map<number, Project>(projects.map((p) => [p.project_id, p])),
    [projects]
  );

  return { projects, byId, isLoading };
}
