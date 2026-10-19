import { z } from '@hono/zod-openapi';

export const tableSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    total: z.number().int().openapi({
      example: 1,
      description: 'Total number of records available',
    }),
    limit: z.number().int().openapi({ example: 25 }),
    offset: z.number().int().openapi({ example: 0 }),
    returned: z.number().int().openapi({
      example: 1,
      description: 'Number of records in this response',
    }),
    result: z.array(item),
  });

export type TableResult<T = any> = {
  total: number;
  limit: number;
  offset: number;
  returned: number;
  result: T[];
};

export const toTableResult = <T>(
  result: T[] = [],
  offset = 0,
  limit = 25,
  total = 0
): TableResult<T> => ({
  total: total || result.length,
  limit,
  offset,
  returned: result.length,
  result,
});
