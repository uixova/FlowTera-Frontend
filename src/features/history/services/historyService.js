import { api } from '../../../services/api'; 

export const historyService = {
    getHistoryByTeam: async (teamId, page = 1, limit = 20) => {
        try {
            const allTeams = await api.teams.getAll();
            if (!allTeams || !teamId) return { data: [], hasMore: false };

            const currentTeam = allTeams.find(t => String(t.id) === String(teamId));
            const allLogs = currentTeam ? (currentTeam.history || []) : [];

            // Sayfalama (Pagination)
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = allLogs.slice(startIndex, endIndex);
            
            const hasMore = allLogs.length > endIndex;

            return {
                data: paginatedData,
                hasMore: hasMore,
                totalCount: allLogs.length
            };
            
        } catch (error) {
            console.error("History çekilirken hata oluştu:", error);
            return { data: [], hasMore: false };
        }
    }
};