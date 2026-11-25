import type { ClickFilter } from "./analytics";

export interface ClickReport {
  timestamp: string;
  url: string;
  country: string;
  city: string;
  region: string;
  referer: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  /** Hidden by the plan, identifying fields are masked */
  locked?: boolean;
}

export interface ReportsParams extends ClickFilter {
  offset?: number;
  limit?: number;
  key?: string;
}

export interface ReportsResponse {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: ClickReport[];
}
