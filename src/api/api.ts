import type {
    Expense,
    Trip,
    User,
    Team,
    LogData,
    Plan,
    PaginatedResponse,
} from '../types/types';
import { isDemoMode } from '../utils/demo';

// Types 

type ResourceKey = keyof typeof ENDPOINTS;

interface RequestParams {
    page?:     number;
    pageSize?: number;
    [key: string]: string | number | boolean | undefined;
}

interface RequestOptions {
    forceRefresh?: boolean;
    ttl?:          number;
    method?:       'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?:         unknown;
    noRetry?:      boolean;
}

interface CacheEntry<T> {
    data:      T;
    timestamp: number;
    ttl:       number;
}

// Config 

const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const REQUEST_TIMEOUT_MS = 12_000;
const DEFAULT_PAGE_SIZE  = 20;
const DEFAULT_TTL_MS     = 5 * 60 * 1000;
const MAX_RETRIES        = 3;
const RETRY_BASE_DELAY   = 1000;

const ENDPOINTS = {
    TEAMS:         `${API_PREFIX}/teams`,
    USERS:         `${API_PREFIX}/users`,
    NOTIFICATIONS: `${API_PREFIX}/notifications`,
    EXPENSES:      `${API_PREFIX}/expenses`,
    TRIPS:         `${API_PREFIX}/trips`,
    LOGS:          `${API_PREFIX}/logs`,
    PLANS:         `${API_PREFIX}/plans`,
    ARCHIVE:       `${API_PREFIX}/archive`,
} as const;

const resolveUrl = (key: ResourceKey, params: RequestParams = {}): string => {
    const url = new URL(ENDPOINTS[key], window.location.origin);
    const { page, pageSize, ...filters } = params;
    if (page)     url.searchParams.set('page',     String(page));
    if (pageSize) url.searchParams.set('pageSize', String(pageSize));
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
    return url.toString();
};

// Cache 

class TtlCache {
    readonly #store = new Map<string, CacheEntry<unknown>>();

    #key(resource: ResourceKey, params: RequestParams = {}): string {
        const { page, pageSize, ...filters } = params;
        const pagePart   = page     ? `:page=${page}`   : '';
        const sizePart   = pageSize ? `:ps=${pageSize}` : '';
        const filterPart = Object.keys(filters).length
            ? `:${JSON.stringify(filters)}`
            : '';
        return `${resource}${pagePart}${sizePart}${filterPart}`;
    }

    get<T>(resource: ResourceKey, params?: RequestParams): T | null {
        const entry = this.#store.get(this.#key(resource, params)) as CacheEntry<T> | undefined;
        if (!entry) return null;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.#store.delete(this.#key(resource, params));
            return null;
        }
        return entry.data;
    }

    set<T>(resource: ResourceKey, params: RequestParams | undefined, data: T, ttl = DEFAULT_TTL_MS): void {
        this.#store.set(this.#key(resource, params), { data, timestamp: Date.now(), ttl });
    }

    invalidate(resource: ResourceKey): void {
        const prefix = `${resource}`;
        for (const key of this.#store.keys()) {
            if (key.startsWith(prefix)) this.#store.delete(key);
        }
    }

    clear(): void { this.#store.clear(); }

    gc(): void {
        const now = Date.now();
        for (const [key, entry] of this.#store.entries()) {
            if (now - entry.timestamp > entry.ttl) this.#store.delete(key);
        }
    }
}

const cache    = new TtlCache();
const inflight = new Map<string, Promise<unknown>>();

setInterval(() => cache.gc(), 10 * 60 * 1000);

// Fetch 

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> => {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
};

const shouldRetry = (error: Error & { status?: number }, attempt: number): boolean => {
    if (attempt >= MAX_RETRIES) return false;
    if (error.name === 'AbortError') return false;
    if (error.status && error.status >= 400 && error.status < 500) return false;
    return true;
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAuthToken = (): string =>
    localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';

// Core Request 

const request = async <T = unknown>(
    resourceKey: ResourceKey,
    params: RequestParams = {},
    options: RequestOptions = {}
): Promise<T> => {
    const {
        forceRefresh = false,
        ttl          = DEFAULT_TTL_MS,
        method       = 'GET',
        body,
        noRetry      = false,
    } = options;

    if (isDemoMode() && method !== 'GET') {
        throw Object.assign(new Error('Demo modunda yazma işlemi engellenmiştir.'), { status: 403, code: 'DEMO_WRITE_BLOCKED' });
    }

    if (!forceRefresh && method === 'GET') {
        const cached = cache.get<T>(resourceKey, params);
        if (cached !== null) return cached;
    }

    const inflightKey = `${resourceKey}:${JSON.stringify(params)}`;
    if (method === 'GET' && inflight.has(inflightKey)) {
        return inflight.get(inflightKey) as Promise<T>;
    }

    const url   = resolveUrl(resourceKey, params);
    const token = getAuthToken();

    const fetchOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const executeRequest = async (attempt: number = 0): Promise<T> => {
        try {
            const response = await fetchWithTimeout(url, fetchOptions);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({})) as Record<string, unknown>;
                const err = Object.assign(
                    new Error((errData['message'] as string) || `HTTP ${response.status}`),
                    { status: response.status, url }
                );
                throw err;
            }

            const raw = await response.json() as T;

            if (method === 'GET') {
                cache.set<T>(resourceKey, params, raw, ttl);
            }

            return raw;
        } catch (error: unknown) {
            const err = error as Error & { status?: number };

            if (!noRetry && shouldRetry(err, attempt)) {
                const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
                console.warn(`[API] Retry [${resourceKey}] attempt ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
                await wait(delay);
                return executeRequest(attempt + 1);
            }

            if (err.name === 'AbortError') {
                console.warn(`[API] Timeout [${resourceKey}]`);
            } else if (err.status !== 404) {
                console.warn(`[API] Error [${resourceKey}] ${err.status ?? ''} — ${err.message}`);
            }
            throw err;
        }
    };

    const promise = executeRequest().finally(() => inflight.delete(inflightKey));
    if (method === 'GET') inflight.set(inflightKey, promise);
    return promise;
};

// restFetch — kimlik doğrulamalı doğrudan REST çağrısı 

export const restFetch = async <T = unknown>(
    path: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        body?:   unknown;
        params?: Record<string, string | number | boolean | undefined | null>;
    } = {}
): Promise<T> => {
    const { method = 'GET', body, params } = options;

    if (isDemoMode() && method !== 'GET') {
        throw Object.assign(new Error('Demo modunda yazma işlemi engellenmiştir.'), { status: 403, code: 'DEMO_WRITE_BLOCKED' });
    }

    const url = new URL(`${API_PREFIX}${path}`, window.location.origin);
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
        });
    }

    const token = getAuthToken();

    const response = await fetchWithTimeout(url.toString(), {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const data = await response.json() as Record<string, unknown>;
    if (!response.ok || data['status'] === 'ERROR') {
        throw new Error((data['message'] as string) || `HTTP ${response.status}`);
    }
    return data as unknown as T;
};

// Public API 

export const api = {

    fetch: <T = unknown>(key: ResourceKey, params?: RequestParams, opts?: RequestOptions) =>
        request<T>(key, params, opts),

    teams: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<Team>>('TEAMS', params, opts),

        getById: async (id: string): Promise<Team | null> => {
            const result = await request<PaginatedResponse<Team>>('TEAMS', {});
            return result?.data?.find(t => String(t.id) === String(id)) ?? null;
        },
    },

    users: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<User>>('USERS', params, opts),

        getById: async (id: string): Promise<User | null> => {
            try {
                const result = await restFetch<{ status: string; data: User }>(`/users/${id}`);
                return (result as any).data ?? null;
            } catch { return null; }
        },
    },

    expenses: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<Expense>>('EXPENSES', { pageSize: DEFAULT_PAGE_SIZE, ...params }, opts),

        refresh: (params: RequestParams = {}) =>
            request<PaginatedResponse<Expense>>('EXPENSES', { pageSize: DEFAULT_PAGE_SIZE, ...params }, { forceRefresh: true }),

        invalidate: () => cache.invalidate('EXPENSES'),
    },

    trips: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<Trip>>('TRIPS', { pageSize: DEFAULT_PAGE_SIZE, ...params }, opts),
        invalidate: () => cache.invalidate('TRIPS'),
    },

    archive: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<Expense>>('ARCHIVE', { page: 1, pageSize: 30, ...params }, {
                ttl: 10 * 60 * 1000,
                ...opts,
            }),
        invalidate: () => cache.invalidate('ARCHIVE'),
    },

    logs: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<LogData>>('LOGS', { pageSize: DEFAULT_PAGE_SIZE, ...params }, opts),
        invalidate: () => cache.invalidate('LOGS'),
    },

    notifications: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<any>('NOTIFICATIONS', params, { ttl: 60 * 1000, ...opts }),
        invalidate: () => cache.invalidate('NOTIFICATIONS'),
    },

    plans: {
        getAll: (opts: RequestOptions = {}) =>
            request<{ status: string; data: Plan[] }>('PLANS', {}, { ttl: 60 * 60 * 1000, noRetry: true, ...opts }),
    },

    cache: {
        invalidate: (key: ResourceKey | null = null) => {
            if (key) cache.invalidate(key);
            else cache.clear();
        },
        gc: () => cache.gc(),
    },
};
