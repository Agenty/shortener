export interface GeoTarget {
  country: string;
  url: string;
}

export interface LinkFormState {
  url: string;
  key: string;
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
  project_id: string | null;
  user_id: number;
  url: string;
  short_url: string;
  status: string;
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
