import { api } from '../../../api/api';

const randomDelay = (min = 200, max = 800) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

const extractList = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const historyService = {

    // Takım bazlı geçmiş verilerini getirme
    getHistoryByTeam: async (teamId, page = 1, limit = 20) => {
        try {
            await randomDelay(400, 1000);

            const response = await api.logs.getAll({ pageSize: 2000 });
            const rawList = extractList(response);

            // JSON yapısından TeamLogs konteynerini ayıkla
            const teamLogContainer = rawList.find(item => item.TeamLogs);
            const allLogs = teamLogContainer ? teamLogContainer.TeamLogs : [];

            const filteredLogs = allLogs.filter(
                log => String(log.teamId) === String(teamId)
            );

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = filteredLogs.slice(startIndex, endIndex);

            return {
                data: paginatedData,
                hasMore: filteredLogs.length > endIndex,
                totalCount: filteredLogs.length
            };
        } catch (error) {
            console.error("History fetching error:", error);
            return { data: [], hasMore: false, totalCount: 0 };
        }
    }
};