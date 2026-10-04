export interface Profile {
  name: string;
  email: string;
}

export interface Account {
  billing_name: string | null;
  billing_address: string | null;
  tax_name: string | null;
  tax_number: string | null;
}

export interface ApiKey {
  key_id: number;
  name: string;
  is_enabled: boolean | number;
  created_at: string;
  updated_at: string | null;
}

export interface ApiKeysResponse {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: ApiKey[];
}
