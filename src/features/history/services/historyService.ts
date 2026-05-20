import { api } from '../../../api/api';
import { LogData } from '@/types/types';

// Servisin geriye döneceği sayfalama yapısı için tip tanımı
export interface HistoryResponse {
    data: any[]; // TeamLogs içerisindeki log objelerinin tipi (örn: TeamLog[] veya any[])
    hasMore: boolean;
    totalCount: number;
}

const toArray = <T>(result: any): T[] =>
    Array.isArray(result) ? result : (result?.data ?? []);

export const historyService = {

    // Takım bazlı geçmiş verilerini getirme
    async getHistoryByTeam(
        teamId: string | number, 
        page: number = 1, 
        limit: number = 20
    ): Promise<HistoryResponse> {
        try {
            const response = await api.logs.getAll({ pageSize: 2000 });
            const rawList  = toArray<LogData>(response);

            // JSON yapısından TeamLogs konteynerini ayıkla
            const container = rawList.find((item: any) => item.TeamLogs);
            const allLogs: any[] = container?.TeamLogs ?? [];

            const filtered  = allLogs.filter((log: any) => String(log.teamId) === String(teamId));

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