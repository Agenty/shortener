import { MiddlewareHandler } from 'hono';
import { createApiLog, insertLogs } from '../services/logs.service';
import { ApiLogs } from '../models/api-logs';

const SKIP_ENDPOINTS = ['/logs', '/ai', '/auth', '/oauth', '/me'];

const getLogLevel = (statusCode: number): ApiLogs['level'] => {
    if (statusCode >= 200 && statusCode < 300) return 'info';
    if (statusCode >= 400 && statusCode < 500) return 'warn';
    return 'error';
};

export const logger =
    (project: string): MiddlewareHandler =>
        async (ctx, next) => {
            const start = Date.now();
            const { method } = ctx.req.raw;
            const logs = createApiLog(ctx.env, ctx.req);

            await next();

            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !SKIP_ENDPOINTS.some((x) => logs.url.includes(x))) {

                logs.status = ctx.res.status || 200;
                logs.duration = Date.now() - start;
                logs.level = getLogLevel(logs.status);

                // API routes only
                if (!logs.url.startsWith('/v1') || logs.status === 401 || logs.status === 404) return;

                const authUser = ctx.req["user"];

                if (authUser) {
                    logs.account_id = authUser.account_id;
                    logs.user_id = authUser.user_id;
                    logs.user = authUser.name;
                }

                // REQUEST
                if (['POST', 'PUT', 'PATCH'].includes(method)) {
                    try {
                        logs.request = await ctx.req.text();
                    } catch (err: any) {
                        console.log('Error reading request body', err.message);
                    }
                }

                // RESPONSE
                if (!ctx.res.ok) {
                    try {
                        logs.response = await ctx.res.clone().text();
                    } catch { }
                }

                insertLogs(ctx.env, logs);
            }
        };