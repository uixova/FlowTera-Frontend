const DATA_PATHS = {
    TEAMS: '/src/features/teams/data/teams.json',
    USERS: '/src/data/user.json', 
    LOGS: '/src/features/teams/data/userLog.json',
    NOTIFICATIONS: '/src/assets/data/notification.json'
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
    }
};