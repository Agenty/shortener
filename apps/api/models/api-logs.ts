export interface ApiLogs {
    /** project identifier (ex: agenty.com, dayschedule.com etc) */
    project: string;

    /** request metadata */
    url: string;
    method: string;
    ip?: string;
    source?: string;

    /** geo */
    country?: string;
    city?: string;

    /** auth */
    account_id?: number;
    user_id?: number;
    user?: string;

    /** request / response */
    request?: string | null;
    response?: string | null;
    error?: string | null;

    /** system */
    status: number;
    duration: number;
    level: 'info' | 'warn' | 'error';
    logs?: string;
    id?: string;
    timestamp?: Date | string;
}