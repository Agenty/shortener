export interface AnalyticsClick {
  date: string;
  clicks: string;
}

export interface AnalyticsReferer {
  referer: string;
  clicks: string;
}

export interface AnalyticsCountry {
  country: string;
  clicks: string;
}

export interface AnalyticsTop {
  url: string;
  clicks: string;
}

export interface AnalyticsBrowser {
  browser: string;
  clicks: string;
}

export interface AnalyticsOS {
  os: string;
  clicks: string;
}

export interface AnalyticsDevice {
  device: string;
  clicks: string;
}

/** Drill-down filters on the click dimensions */
export interface ClickFilter {
  country?: string;
  city?: string;
  referer?: string;
  browser?: string;
  os?: string;
  device?: string;
}

export interface AnalyticsParams extends ClickFilter {
  interval?: number;
  key?: string;
}
