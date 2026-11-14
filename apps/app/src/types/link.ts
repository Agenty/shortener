export interface GeoTarget {
  country: string;
  url: string;
}

export interface LinkFormState {
  url: string;
  key: string;
  /** Empty string for no project */
  project_id: string;
  expire_at: string;
  password: string;
  title: string;
  description: string;
  image: string;
  ios: string;
  android: string;
  params: Record<string, string>;
  geo: GeoTarget[];
}

export const initialLinkForm: LinkFormState = {
  url: "",
  key: "",
  project_id: "",
  expire_at: "",
  password: "",
  title: "",
  description: "",
  image: "",
  ios: "",
  android: "",
  params: { ref: "", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" },
  geo: [],
};

export interface LinkCreatePayload {
  url: string;
  project_id?: number | null;
  key?: string;
  expire_at?: string;
  password?: string;
  title?: string;
  description?: string;
  image?: string;
  ios?: string;
  android?: string;
  params?: Record<string, string>;
  geo?: GeoTarget[];
}

export interface Link {
  key: string;
  project_id: number | null;
  user_id: number;
  url: string;
  short_url: string;
  is_enabled: boolean;
  /** Unsafe destination or blocked domain, the link stops redirecting */
  blocked_at?: string | null;
  blocked_reason?: string | null;
  created_at: string;
  params: Record<string, string>;
  geo: GeoTarget[];
  expire_at?: string;
  password?: string;
  title?: string;
  description?: string;
  image?: string;
  ios?: string;
  android?: string;
}

export interface LinksResponse {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: Link[];
}

export interface UrlMeta {
  title: string;
  description: string;
  image: string;
  domain: string;
}
