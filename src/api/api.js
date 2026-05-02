// .env'den gelen yollar
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/data';

const DATA_PATHS = {
    TEAMS: `${BASE_URL}/teams.json`,
    USERS: `${BASE_URL}/user.json`,
    NOTIFICATIONS: `${BASE_URL}/notification.json`,
    EXPENSES: `${BASE_URL}/expenses.json`,
    TRIPS: `${BASE_URL}/trips.json`,
    LOGS: `${BASE_URL}/logs.json`,
    PLANS: `${BASE_URL}/plan.json`
};

// Bellek içi Cache 
const apiCache = new Map();

export const api = {
    // Merkezi veri çekme motoru
    fetchResource: async (resourceKey, forceRefresh = false) => {
        const path = DATA_PATHS[resourceKey];
        
        // Eğer veri cache'de varsa ve yenileme istenmiyorsa direkt cache'den dön
        if (!forceRefresh && apiCache.has(resourceKey)) {
            return apiCache.get(resourceKey);
        }

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Veri çekilemedi: ${path}`);
            const data = await response.json();
            
            // Veriyi belleğe al (Uygulama kapanana kadar burada durur)
            apiCache.set(resourceKey, data);
            return data;
        } catch (error) {
            console.error(`API Error [${resourceKey}]:`, error);
            return null;
        }
    },

    // Takımlar
    teams: {
        // Kullanıcının olduğu takımları çekmek için filtreleme yeteneği
        getAll: (force) => api.fetchResource('TEAMS', force),
    },

    // Kullanıcılar
    users: {
        getAll: (force) => api.fetchResource('USERS', force),
    },

    // Loglar (Dediğin gibi 100-200 limitli başlangıç)
    logs: {
        getAll: async (force) => {
            const data = await api.fetchResource('LOGS', force);
            // Log yapısı TeamLogs içinde olduğu için oraya erişiyoruz
            return data;
        }
    },

    // Harcamalar
    expenses: {
        getAll: (force) => api.fetchResource('EXPENSES', force),
    },

    // Seyahatler
    trips: {
        getAll: (force) => api.fetchResource('TRIPS', force),
    },

    // Planlar (Sabit veri)
    plans: {
        getAll: (force) => api.fetchResource('PLANS', force),
    },

    // Bildirimler
    notifications: {
        getAll: (force) => api.fetchResource('NOTIFICATIONS', force),
    },

    // Cache temizleme (Yeni veri eklendiğinde çağrılır)
    clearCache: (key) => {
        if (key) apiCache.delete(key);
        else apiCache.clear();
    }
};