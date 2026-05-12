import type {
    Expense,
    Trip,
    User,
    Team,
    NotificationData,
    LogData,
    Plan,
    PaginatedResponse,
} from '../types/api.types';

// İçsel Tipler #######################################################################################

type ResourceKey = keyof typeof ENDPOINTS;

interface RequestParams {
    page?:     number;
    pageSize?: number;
    [key: string]: string | number | boolean | undefined;
}

interface RequestOptions {
    forceRefresh?: boolean;
    ttl?:          number;
    paginated?:    boolean;
    method?:       'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?:         unknown;
}

interface CacheEntry<T> {
    data:      T;
    timestamp: number;
    ttl:       number;
}

// Env & Config #######################################################################################

const BASE_URL   = import.meta.env.VITE_API_BASE_URL || '/data';
const API_PREFIX = import.meta.env.VITE_API_PREFIX   || '/api/v1'; // backend gelince bu devreye girer
const IS_MOCK    = import.meta.env.VITE_USE_MOCK !== 'false'; // .env den kontrol

const REQUEST_TIMEOUT_MS = 12_000;
const DEFAULT_PAGE_SIZE  = 20;
const DEFAULT_TTL_MS     = 5 * 60 * 1000; // 5 dakika

// Endpoint Tanımları
// Mock - REST dönüşümü tek yerden yönetilir; backend gelince sadece IS_MOCK değişir.
const ENDPOINTS = {
    TEAMS:         { mock: `${BASE_URL}/teams.json`,        rest: `${API_PREFIX}/teams`         },
    USERS:         { mock: `${BASE_URL}/user.json`,         rest: `${API_PREFIX}/users`         },
    NOTIFICATIONS: { mock: `${BASE_URL}/notification.json`, rest: `${API_PREFIX}/notifications` },
    EXPENSES:      { mock: `${BASE_URL}/expenses.json`,     rest: `${API_PREFIX}/expenses`      },
    TRIPS:         { mock: `${BASE_URL}/trips.json`,        rest: `${API_PREFIX}/trips`         },
    LOGS:          { mock: `${BASE_URL}/logs.json`,         rest: `${API_PREFIX}/logs`          },
    PLANS:         { mock: `${BASE_URL}/plan.json`,         rest: `${API_PREFIX}/plans`         },
    ARCHIVE:       { mock: `${BASE_URL}/expenses.json`,     rest: `${API_PREFIX}/archive`       },
} as const;

const resolveUrl = (key: ResourceKey, params: RequestParams = {}): string => {
    const endpoint = ENDPOINTS[key];

    if (IS_MOCK) return endpoint.mock;

    // REST modunda query string oluştur
    const url = new URL(endpoint.rest, window.location.origin);
    const { page, pageSize, ...filters } = params;
    if (page)     url.searchParams.set('page',     String(page));
    if (pageSize) url.searchParams.set('pageSize', String(pageSize));
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
    return url.toString();
};

// TTL Cache #######################################################################################

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
        // Bir kaynağa ait tüm sayfa cache'lerini temizle
        const prefix = `${resource}`;
        for (const key of this.#store.keys()) {
            if (key.startsWith(prefix)) this.#store.delete(key);
        }
    }

    clear(): void { this.#store.clear(); }

    // Süresi geçmiş tüm girişleri toplu temizle (GC)
    gc(): void {
        const now = Date.now();
        for (const [key, entry] of this.#store.entries()) {
            if (now - entry.timestamp > entry.ttl) this.#store.delete(key);
        }
    }
}

const cache    = new TtlCache();
const inflight = new Map<string, Promise<unknown>>(); // aynı isteğin çift gitmesini engeller

// Periyodik GC - her 10 dakikada bir
setInterval(() => cache.gc(), 10 * 60 * 1000);

// Temel Fetch #######################################################################################

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> => {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
};

// Sayfalama Yardımcısı (Mock + REST)
// Mock modda backend sayfalamayı taklit eder.
// REST modda backend zaten { data, total, page, pageSize } döner.
const paginateMock = <T>(rawData: T | T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): PaginatedResponse<T> => {
    const array: T[] = Array.isArray(rawData) ? rawData : Object.values(rawData as object);
    const total      = array.length;
    const start      = (page - 1) * pageSize;
    return {
        data:       array.slice(start, start + pageSize),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasMore:    start + pageSize < total,
    };
};

// Merkezi İstek Yapısı #######################################################################################

const request = async <T = unknown>(
    resourceKey: ResourceKey,
    params: RequestParams = {},
    options: RequestOptions = {}
): Promise<T> => {
    const {
        forceRefresh = false,
        ttl          = DEFAULT_TTL_MS,
        paginated    = false,
        method       = 'GET',
        body,
    } = options;

    // Cache kontrolü
    if (!forceRefresh && method === 'GET') {
        const cached = cache.get<T>(resourceKey, params);
        if (cached !== null) return cached;
    }

    // Inflight dedup
    const inflightKey = `${resourceKey}:${JSON.stringify(params)}`;
    if (method === 'GET' && inflight.has(inflightKey)) {
        return inflight.get(inflightKey) as Promise<T>;
    }

    const url = resolveUrl(resourceKey, params);

    const fetchOptions: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const promise = fetchWithTimeout(url, fetchOptions)
        .then(async (response) => {
            if (!response.ok) {
                const err = Object.assign(new Error(`HTTP ${response.status}`), {
                    status: response.status,
                    url,
                });
                throw err;
            }

            const raw: unknown = await response.json();

            // Yanıtı normalize et
            const result: T = paginated
                ? (IS_MOCK ? paginateMock(raw as T | T[], params.page, params.pageSize) : raw) as T
                : raw as T;

            // Cache'e yaz
            if (method === 'GET') {
                cache.set<T>(resourceKey, params, result, ttl);
            }

            return result;
        })
        .catch((error: Error & { status?: number }) => {
            if (error.name === 'AbortError') {
                console.error(`[API] Timeout [${resourceKey}]`);
            } else {
                console.error(`[API] Error [${resourceKey}] ${error.status ?? ''} — ${error.message}`);
            }
            throw error; // servise fırlat, UI handle etsin
        })
        .finally(() => {
            inflight.delete(inflightKey);
        });

    if (method === 'GET') inflight.set(inflightKey, promise);
    return promise;
};

// Public API #######################################################################################

export const api = {

    // Genel kaynak çekici (gerekirse doğrudan kullanılabilir)
    fetch: <T = unknown>(key: ResourceKey, params?: RequestParams, opts?: RequestOptions) =>
        request<T>(key, params, opts),

    // TEAMS
    teams: {
        // Sayfalı liste
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<Team>>('TEAMS', params, { paginated: true, ...opts }),

        // Tek takım — REST'te /teams/:id, mock'ta liste içinden filtreler
        getById: async (id: string, opts: RequestOptions = {}): Promise<Team | null> => {
            const result = await request<PaginatedResponse<Team> | Team[]>('TEAMS', {}, opts);
            const list   = IS_MOCK
                ? (Array.isArray(result) ? result : (result as PaginatedResponse<Team>).data)
                : result as Team[];
            return list?.find(t => String(t.id) === String(id)) ?? null;
        },
    },

    // USERS
    users: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<User>>('USERS', params, { paginated: true, ...opts }),

        getById: async (id: string, opts: RequestOptions = {}): Promise<User | null> => {
            const result = await request<PaginatedResponse<User> | User[]>('USERS', {}, opts);
            const list   = IS_MOCK
                ? (Array.isArray(result) ? result : (result as PaginatedResponse<User>).data)
                : result as User[];
            return list?.find(u => String(u.id) === String(id)) ?? null;
        },
    },

    // EXPENSES
    expenses: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<Expense>>('EXPENSES', { pageSize: DEFAULT_PAGE_SIZE, ...params }, {
                paginated: true,
                ...opts,
            }),

        // Belirli bir sayfayı önbelleğe almadan çek
        refresh: (params: RequestParams = {}) =>
            request<PaginatedResponse<Expense>>('EXPENSES', { pageSize: DEFAULT_PAGE_SIZE, ...params }, {
                paginated:    true,
                forceRefresh: true,
            }),

        // Cache'i temizler
        invalidate: () => cache.invalidate('EXPENSES'),
    },

    // TRIPS
    trips: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<Trip>>('TRIPS', { pageSize: DEFAULT_PAGE_SIZE, ...params }, {
                paginated: true,
                ...opts,
            }),
        invalidate: () => cache.invalidate('TRIPS'),
    },

    // ARCHIVE
    // Kullanıcı arşive girdiğinde tetiklenir.
    // Expenses'e geçince aynı cache kullanılır, TTL içindeyse refetch yok.
    archive: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<Expense>>('ARCHIVE', { page: 1, pageSize: 30, ...params }, {
                paginated: true,
                ttl:       10 * 60 * 1000, // Arşiv için 10 dk TTL
                ...opts,
            }),
        invalidate: () => cache.invalidate('ARCHIVE'),
    },

    // LOGS
    logs: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<PaginatedResponse<LogData>>('LOGS', { pageSize: DEFAULT_PAGE_SIZE, ...params }, {
                paginated: true,
                ...opts,
            }),
        invalidate: () => cache.invalidate('LOGS'),
    },

    // NOTIFICATIONS
    // Kısa TTL
    notifications: {
        getAll: (params: RequestParams = {}, opts: RequestOptions = {}) =>
            request<NotificationData>('NOTIFICATIONS', params, {
                paginated: false,
                ttl:       60 * 1000, // 1 dakika
                ...opts,
            }),
        invalidate: () => cache.invalidate('NOTIFICATIONS'),
    },

    // PLANS (Statik veri — çok uzun TTL)
    plans: {
        getAll: (opts: RequestOptions = {}) =>
            request<Plan[]>('PLANS', {}, {
                ttl: 60 * 60 * 1000, // 1 saat
                ...opts,
            }),
    },

    // Cache Yönetimi
    cache: {
        // Belirli bir kaynağın tüm cache sayfalarını temizle.
        // key null ise hepsini temizle
        invalidate: (key: ResourceKey | null = null) => {
            if (key) cache.invalidate(key);
            else cache.clear();
        },

        // Manuel GC tetikleyici
        gc: () => cache.gc(),
    },
};