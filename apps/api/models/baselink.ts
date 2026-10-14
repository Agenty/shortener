import { z } from '@hono/zod-openapi';

export enum LinkStatus {
  active = 'active',
  expired = 'expired',
  blocked = 'blocked',
}

export enum LinkType {
  qr = 'qr',
  link = 'link',
  page = 'page',
}

export class BaseLink {
  key?: string;
  account_id?: number;
  user_id?: number;
  project_id?: number;
  type?: LinkType;
  name?: string;
  short_url?: string = '';
  status?: LinkStatus;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export const baseLinkSchema = z.object({
  key: z.string().optional(),
  account_id: z.number().optional(),
  user_id: z.number().optional(),
  project_id: z.number().optional(),
  type: z.nativeEnum(LinkType), // Assuming LinkType is an enum
  name: z.string(),
  short_url: z.string().default(''),
  data: z.record(z.string()),
  created_at: z.union([z.string(), z.date()]).optional(),
  updated_at: z.union([z.string(), z.date()]).optional(),
});
