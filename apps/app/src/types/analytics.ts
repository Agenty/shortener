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
