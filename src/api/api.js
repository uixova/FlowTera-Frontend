const BASE_URL   = import.meta.env.VITE_API_BASE_URL || '/data';
const API_PREFIX = import.meta.env.VITE_API_PREFIX   || '/api/v1'; // backend gelince bu devreye girer
const IS_MOCK    = import.meta.env.VITE_USE_MOCK !== 'false'; // .env den kontrol

const REQUEST_TIMEOUT_MS  = 12_000;
const DEFAULT_PAGE_SIZE   = 20;
const DEFAULT_TTL_MS      = 5 * 60 * 1000;   // 5 dakika

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
};

const resolveUrl = (key, params = {}) => {
  const endpoint = ENDPOINTS[key];
  if (!endpoint) throw new Error(`[API] Unknown resource key: "${key}"`);

  if (IS_MOCK) return endpoint.mock;

  // REST modunda query string oluştur
  const url    = new URL(endpoint.rest, window.location.origin);
  const { page, pageSize, ...filters } = params;
  if (page)     url.searchParams.set('page',     page);
  if (pageSize) url.searchParams.set('pageSize', pageSize);
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  return url.toString();
};

// TTL Cache
class TtlCache {
  #store = new Map();

  _key(resource, params = {}) {
    const { page, pageSize, ...filters } = params;
    const pagePart   = page     ? `:page=${page}`         : '';
    const sizePart   = pageSize ? `:ps=${pageSize}`       : '';
    const filterPart = Object.keys(filters).length
      ? `:${JSON.stringify(filters)}`
      : '';
    return `${resource}${pagePart}${sizePart}${filterPart}`;
  }

  get(resource, params) {
    const entry = this.#store.get(this._key(resource, params));
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.#store.delete(this._key(resource, params));
      return null;
    }
    return entry.data;
  }

  set(resource, params, data, ttl = DEFAULT_TTL_MS) {
    this.#store.set(this._key(resource, params), {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  invalidate(resource) {
    // Bir kaynağa ait tüm sayfa cache'lerini temizle
    const prefix = `${resource}`;
    for (const key of this.#store.keys()) {
      if (key.startsWith(prefix)) this.#store.delete(key);
    }
  }

  clear() { this.#store.clear(); }

  /** Süresi geçmiş tüm girişleri toplu temizle (GC) */
  gc() {
    const now = Date.now();
    for (const [key, entry] of this.#store.entries()) {
      if (now - entry.timestamp > entry.ttl) this.#store.delete(key);
    }
  }
}

const cache = new TtlCache();
const inflight = new Map(); // aynı isteğin çift gitmesini engeller

// Periyodik GC - her 10 dakikada bir
setInterval(() => cache.gc(), 10 * 60 * 1000);

// Temel Fetch
const fetchWithTimeout = (url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

// Sayfalama Yardımcısı (Mock + REST) 
/**
 * Mock modda backend sayfalamayı taklit eder.
 * REST modda backend zaten { data, total, page, pageSize } döner.
 */
const paginateMock = (rawData, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const array = Array.isArray(rawData) ? rawData : Object.values(rawData);
  const total = array.length;
  const start = (page - 1) * pageSize;
  return {
    data:       array.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasMore:    start + pageSize < total,
  };
};

// Merkezi İstek Yapısı
/**
 * @param {string}  resourceKey   - ENDPOINTS anahtarı
 * @param {object}  params        - { page, pageSize, ...filters }
 * @param {object}  options
 * @param {boolean} options.forceRefresh  - Cache'i yoksay
 * @param {number}  options.ttl           - Bu istek için özel TTL (ms)
 * @param {boolean} options.paginated     - Sayfalı yanıt bekleniyor mu?
 */
const request = async (resourceKey, params = {}, options = {}) => {
  const {
    forceRefresh = false,
    ttl          = DEFAULT_TTL_MS,
    paginated    = false,
    method       = 'GET',
    body,
  } = options;

  // 1. Cache kontrolü 
  if (!forceRefresh && method === 'GET') {
    const cached = cache.get(resourceKey, params);
    if (cached !== null) return cached;
  }

  // 2. Inflight dedup
  const inflightKey = `${resourceKey}:${JSON.stringify(params)}`;
  if (method === 'GET' && inflight.has(inflightKey)) {
    return inflight.get(inflightKey);
  }

  // 3. URL oluştur
  const url = resolveUrl(resourceKey, params);

  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Backend gelince Authorization `Bearer ${getToken()}`
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const promise = fetchWithTimeout(url, fetchOptions)
    .then(async (response) => {
      if (!response.ok) {
        const err = new Error(`HTTP ${response.status}`);
        err.status = response.status;
        err.url    = url;
        throw err;
      }

      const raw = await response.json();

      // 4. Yanıtı normalize et
      let result;
      if (paginated) {
        result = IS_MOCK ? paginateMock(raw, params.page, params.pageSize) : raw;
      } else {
        result = raw;
      }

      // 5. Cache'e yaz
      if (method === 'GET') {
        cache.set(resourceKey, params, result, ttl);
      }

      return result;
    })
    .catch((error) => {
      if (error.name === 'AbortError') {
        console.error(`[API] Timeout [${resourceKey}]`);
      } else {
        console.error(`[API] Error [${resourceKey}] ${error.status || ''} — ${error.message}`);
      }
      throw error; // servise fırlat, UI handle etsin
    })
    .finally(() => {
      inflight.delete(inflightKey);
    });

  if (method === 'GET') inflight.set(inflightKey, promise);
  return promise;
};

// Public API 
export const api = {

  // Genel kaynak çekici (gerekirse doğrudan kullanılabilir)
  fetch: (key, params, opts) => request(key, params, opts),

  // TEAMS
  teams: {
    /** Sayfalı liste */
    getAll: (params = {}, opts = {}) =>
      request('TEAMS', params, { paginated: true, ...opts }),

    /** Tek takım — REST'te /teams/:id, mock'ta liste içinden filtreler */
    getById: async (id, opts = {}) => {
      const result = await request('TEAMS', {}, opts);
      const list   = IS_MOCK ? (Array.isArray(result) ? result : result.data) : result;
      return list?.find((t) => String(t.id) === String(id)) ?? null;
    },
  },

  // USERS
  users: {
    getAll:  (params = {}, opts = {}) => request('USERS', params, { paginated: true, ...opts }),
    getById: async (id, opts = {}) => {
      const result = await request('USERS', {}, opts);
      const list   = IS_MOCK ? (Array.isArray(result) ? result : result.data) : result;
      return list?.find((u) => String(u.id) === String(id)) ?? null;
    },
  },

  // EXPENSES
  expenses: {
    /**
     * @param {{ page?, pageSize?, ...filters }} params
     * @example api.expenses.getAll({ page: 1, pageSize: 20, status: 'approved' })
     */
    getAll: (params = {}, opts = {}) =>
      request('EXPENSES', { pageSize: DEFAULT_PAGE_SIZE, ...params }, {
        paginated: true,
        ...opts,
      }),

    // Belirli bir sayfayı önbelleğe almadan çek 
    refresh: (params = {}) =>
      request('EXPENSES', { pageSize: DEFAULT_PAGE_SIZE, ...params }, {
        paginated:    true,
        forceRefresh: true,
      }),

    // Cache'i temizler 
    invalidate: () => cache.invalidate('EXPENSES'),
  },

  // TRIPS
  trips: {
    getAll:     (params = {}, opts = {}) =>
      request('TRIPS', { pageSize: DEFAULT_PAGE_SIZE, ...params }, { paginated: true, ...opts }),
    invalidate: () => cache.invalidate('TRIPS'),
  },

  //  ARCHIVE
  //  Kullanıcı arşive girdiğinde tetiklenir (lazy).
  //  Expenses'e geçince aynı cache kullanılır, TTL içindeyse refetch yok.
  archive: {
    getAll: (params = {}, opts = {}) =>
      request('ARCHIVE', { page: 1, pageSize: 30, ...params }, {
        paginated: true,
        ttl:       10 * 60 * 1000,   // Arşiv için 10 dk TTL
        ...opts,
      }),
    invalidate: () => cache.invalidate('ARCHIVE'),
  },

  // LOGS
  logs: {
    getAll:     (params = {}, opts = {}) =>
      request('LOGS', { pageSize: DEFAULT_PAGE_SIZE, ...params }, { paginated: true, ...opts }),
    invalidate: () => cache.invalidate('LOGS'),
  },

  // NOTIFICATIONS
  // Kısa TTL
  notifications: {
    getAll: (params = {}, opts = {}) =>
      request('NOTIFICATIONS', params, {
        paginated: false,
        ttl:       60 * 1000,  // 1 dakika
        ...opts,
      }),
    invalidate: () => cache.invalidate('NOTIFICATIONS'),
  },

  // PLANS  (Statik veri — çok uzun TTL)
  plans: {
    getAll: (opts = {}) =>
      request('PLANS', {}, {
        ttl: 60 * 60 * 1000,// 1 saat
        ...opts,
      }),
  },

  // Cache Yönetimi
  cache: {
    /**
     * Belirli bir kaynağın tüm cache sayfalarını temizle.
     * @param {keyof typeof ENDPOINTS | null} key  null ise hepsini temizle
     */
    invalidate: (key = null) => {
      if (key) cache.invalidate(key);
      else cache.clear();
    },

    // Manuel GC tetikleyici 
    gc: () => cache.gc(),
  },
};