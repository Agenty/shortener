import { HonoRequest } from "hono";
import { env } from "cloudflare:workers";
import { ApiLogs } from "../models/api-logs";
import { AuthUser } from "../models/auth-user";

const API_URL = env.API_URL?.replace('https://', '');

export function createApiLog(
    env: CloudflareBindings,
    req: HonoRequest,
): ApiLogs {
    const { cf, method } = req.raw;

    return {
        project: API_URL,
        url: req.path,
        method,
        ip: req.header('cf-connecting-ip'),
        source: req.header('user-agent'),
        country: cf?.country as string,
        city: cf?.city as string,
        status: 200,
        duration: 0,
        level: 'info',
        id: crypto.randomUUID(),
    };
}

export const insertLogs = (env: CloudflareBindings, logs: ApiLogs) => {
    if (!env.API_LOGS) return;

    logs.id = logs.id || crypto.randomUUID();

    try {
        env.API_LOGS.writeDataPoint({
            blobs: [
                logs.project || API_URL,
                logs.url,
                logs.level,
                logs.method,
                logs.ip,
                logs.source,
                logs.country,
                logs.city,
                logs.user,
                logs.request,
                logs.error,
                typeof logs.response === 'string'
                    ? logs.response.substring(0, 1024)
                    : undefined,
                logs.logs,
            ],
            doubles: [
                Number(logs.account_id ?? 0),
                Number(logs.user_id ?? 0),
                Number(logs.status ?? 0),
                Number(logs.duration ?? 0),
            ],
            indexes: [logs.id],
        });
    } catch (err) {
        console.error('API Logs Error:', err);
    }

};

const queryLogs = async (env: CloudflareBindings, sqlQuery: string) => {
    const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.CF_API_KEY}`,
        },
        body: sqlQuery,
    });

    if (!res.ok) {
        const error = await res.text()
        console.error("Error analytics_engine/sql:", error);
        return [];
    }
    const json: any = await res.json();
    return json.data;
};

const escapeSql = (value: string | number) => {
    if (typeof value === "number") return value;
    return `'${String(value).replace(/'/g, "''").trim()}'`; // escape single quotes
};

const filterMap: Record<string, string> = {
    account_id: "double1",
    user_id: "double2",
    status: "double3",
    level: "blob3",
    project: "blob1",
    url: "blob2",
    ip: "blob5",
    method: "blob4",
    country: "blob7",
    error: "blob11",
};

export const getLogs = async (
    env: CloudflareBindings,
    authUser: AuthUser,
    filter: Record<string, string>
) => {
    const baseQuery = `
SELECT 
  timestamp,
  blob1 as project,
  blob2 as url,
  blob3 as level,
  blob4 as method,
  blob5 as ip,
  blob6 as source,
  blob7 as country,
  blob8 as city,
  blob9 as user,
  blob10 as request,
  blob11 as error,
  blob12 as response,
  blob13 as logs,
  double1 as account_id,
  double2 as user_id,
  double3 as status,
  double4 as duration
FROM API_LOGS
`;
    const whereClauses: string[] = [
        `blob1 = '${API_URL}'`
    ];

    // Enforce account_id filter unless admin override
    const isAdminSearch =
        authUser?.level && filter?.admin === "1";

    if (!isAdminSearch) {
        whereClauses.push(`double1 = ${authUser.account_id}`);
    }

    // Dynamic filters (inline-safe)
    for (const [key, value] of Object.entries(filter)) {
        if (!value || !filterMap[key]) continue;
        whereClauses.push(`${filterMap[key]} = ${escapeSql(value)}`);
    }

    // Dynamic interval
    const days = Number(filter.days) || 7;
    const safeDays = Math.min(Math.max(days, 1), 90);
    whereClauses.push(`timestamp > NOW() - INTERVAL '${safeDays}' DAY`);

    // Pagination
    const offset = Number(filter.offset) || 0;
    const limit = Number(filter.limit) || 20;

    const safeOffset = Math.max(offset, 0);
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const finalQuery = `
${baseQuery.trim()}
WHERE ${whereClauses.join(" AND ")}
ORDER BY timestamp DESC
LIMIT ${safeLimit} OFFSET ${safeOffset}
`;

    const logs = await queryLogs(env, finalQuery);

    const total = logs.length >= safeLimit ? 1000 : logs.length;
    return {
        offset: safeOffset,
        limit: safeLimit,
        returned: logs.length,
        total: total,
        result: logs.map((x: any) => ({ ...x, timestamp: new Date(x.timestamp).toISOString() }))
    }

};