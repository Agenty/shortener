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
}

export interface ReportsResponse {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: ClickReport[];
}
