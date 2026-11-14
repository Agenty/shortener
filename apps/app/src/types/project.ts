export interface Project {
  project_id: number;
  user_id: number | null;
  name: string;
  /** Hex color label, picked at random when empty */
  color: string | null;
  icon: string | null;
  total_links?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProjectPayload {
  name: string;
  color?: string | null;
  /** An update replaces the icon, so send the current one back */
  icon?: string | null;
}

export interface ProjectsResponse {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: Project[];
}
