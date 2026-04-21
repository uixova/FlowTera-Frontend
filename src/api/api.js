const DATA_PATHS = {
    TEAMS: '/data/teams.json',
    USERS: '/data/user.json', 
    NOTIFICATIONS: '/data/notification.json',
    EXPENSES: '/data/expenses.json',
    TRIPS: '/data/trips.json',
    LOGS: '/data/logs.json',
    PLANS: '/data/plan.json'
};

export const api = {
    get: async (path) => {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Veri çekilemedi: ${path}`);
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return null;
        }
    },

    teams: {
        getAll: () => api.get(DATA_PATHS.TEAMS),
    },

    users: {
        getAll: () => api.get(DATA_PATHS.USERS),
    },

    logs: {
        getAll: () => api.get(DATA_PATHS.LOGS),
    },

    notifications: {
        getAll: () => api.get(DATA_PATHS.NOTIFICATIONS),
    },

    expenses: {
        getAll: () => api.get(DATA_PATHS.EXPENSES),
    },

    trips: {
        getAll: () => api.get(DATA_PATHS.TRIPS),
    },
     
    plans: {
        getAll: () => api.get(DATA_PATHS.PLANS),
    }
};