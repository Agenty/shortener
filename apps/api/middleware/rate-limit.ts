import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

const RATE_LIMIT_CONTEXT_KEY = "rate_limit_passed";

type RateLimitMiddlewareOptions = {
    getRateLimitKey: (c: Context) => string;
};

const PUBLIC_RATE_LIMIT_PATHS = ["/auth", "/oauth", "/public", "/mcp", "/ai"];

export const rateLimit = ({ getRateLimitKey }: RateLimitMiddlewareOptions) => {
    return createMiddleware(async (c, next) => {
        const { path } = c.req;
        const key = getRateLimitKey(c);

        if (key) {
            const limiter = PUBLIC_RATE_LIMIT_PATHS.some((p) => path.includes(p)) ? c.env.PUBLIC_RATE_LIMITER : c.env.PRO_RATE_LIMITER;

            const { success } = await limiter.limit({ key });

            // Store the result in context for downstream access
            c.set(RATE_LIMIT_CONTEXT_KEY, success);

            if (!success) {
                throw new HTTPException(429, {
                    message: `Too many requests`,
                });
            }
        } else {
            console.warn("Empty rate limit key: bypassing rate limits");
        }

        await next();
    });
};

/**
 * Returns whether the current request passed the rate limit check.
 */
export const isRateLimitOk = (c: Context): boolean => {
    return c.get(RATE_LIMIT_CONTEXT_KEY) ?? false;
};