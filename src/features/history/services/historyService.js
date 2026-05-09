import { api } from '../../../api/api';

const toArray = (result) =>
    Array.isArray(result) ? result : (result?.data ?? []);

export const historyService = {

    // Takım bazlı geçmiş verilerini getirme
    getHistoryByTeam: async (teamId, page = 1, limit = 20) => {
        try {
            const response = await api.logs.getAll({ pageSize: 2000 });
            const rawList  = toArray(response);

            // JSON yapısından TeamLogs konteynerini ayıkla
            const container = rawList.find((item) => item.TeamLogs);
            const allLogs   = container?.TeamLogs ?? [];

            const filtered  = allLogs.filter((log) => String(log.teamId) === String(teamId));

            const start = (page - 1) * limit;
            const end   = start + limit;

            return {
                data:       filtered.slice(start, end),
                hasMore:    filtered.length > end,
                totalCount: filtered.length,
            };
        } catch (error) {
            console.error('[historyService] getHistoryByTeam:', error);
            return { data: [], hasMore: false, totalCount: 0 };
        }
    },
};