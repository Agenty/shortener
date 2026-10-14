import { z } from 'zod';

export class Paged {
  offset: number = 0;
  limit: number = 1000;
  search: string;

  constructor(queries: Record<string, string[]>) {
    const { offset, limit, search } = queries;
    this.offset = Number(offset) || 0;
    this.limit = Number(limit) || 1000;
    this.search = search ? decodeURIComponent(search[0]) : undefined;
  }
}

export const pagedSchema = z.object({
  offset: z.number({ coerce: true }).optional().default(0),
  limit: z.number({ coerce: true }).min(1).max(1000).optional().default(1000),
});

export class PagedAnalytics {
  project_id: number;
  url: string;
  interval: number;
}
