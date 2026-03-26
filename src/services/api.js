const DATA_PATHS = {
    TEAMS: '/src/features/teams/data/teams.json',
    USERS: '/src/data/user.json', 
    LOGS: '/src/features/teams/data/userLog.json',
    NOTIFICATIONS: '/src/assets/data/notification.json',
    EXPENSES: '/src/features/expenses/data/expenses.json',
    TRIPS: '/src/features/trips/data/trips.json'
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
    }
};