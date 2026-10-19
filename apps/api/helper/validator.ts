import { z } from '@hono/zod-openapi';
import { validator } from 'hono/validator';
import { HTTPException } from 'hono/http-exception';
import { formatZodError } from './utility';

/** JSON body validator for plain Hono routes, rejects with a 400 HTTPException */
export const jsonValidator = <T extends z.ZodTypeAny>(schema: T) =>
  validator('json', (value) => {
    const parsed = schema.safeParse(value);
    if (parsed.success === false) {
      throw new HTTPException(400, { message: formatZodError(parsed.error) });
    }
    return parsed.data as z.output<T>;
  });
