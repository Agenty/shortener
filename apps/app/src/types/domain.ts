export type GlobalDomainType = 'whitelisted' | 'blocked';

export interface Domain {
  domain_id: number;
  user_id: number | null;
  domain: string;
  is_default: boolean | number;
  is_verified: boolean | number;
  created_at: string;
  updated_at: string | null;
}

/** Whitelisted or blocked for every account, managed by admin */
export interface GlobalDomain {
  domain: string;
  type: GlobalDomainType;
  created_at?: string | null;
  /** Whitelisted in code, can't be removed */
  is_builtin?: boolean;
}

export interface DomainsResponse {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: Domain[];
}

export interface GlobalDomainsResponse {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: GlobalDomain[];
}
