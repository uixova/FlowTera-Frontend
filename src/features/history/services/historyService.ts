import { api } from '../../../api/api';
import { isDemoMode } from '../../../utils/demo';
import demoLogsStatic from '../../../data/demo-logs.json';

export interface HistoryResponse {
    data: any[];
    hasMore: boolean;
    totalCount: number;
}

export const historyService = {

    async getHistoryByTeam(
        teamId: string | number,
        page: number = 1,
        limit: number = 20
    ): Promise<HistoryResponse> {
        if (isDemoMode()) {
            const start  = (page - 1) * limit;
            const sliced = demoLogsStatic.slice(start, start + limit);
            return {
                data:       sliced,
                hasMore:    start + limit < demoLogsStatic.length,
                totalCount: demoLogsStatic.length,
            };
        }

        try {
            const response = await api.logs.getAll({ teamId: String(teamId), page, pageSize: limit });

            // Backend wraps logs in: { data: [{ TeamLogs, UserLogs, TeamMemberLogs }] }
            const raw       = (response as any);
            const container = raw?.data?.[0] ?? raw?.data?.find?.((i: any) => i?.TeamLogs) ?? raw;
            const logs: any[] = container?.TeamLogs ?? [];

            // Add `date` alias so useFilter date range (startDate/endDate) works with createdAt
            const mapped = logs.map(log => ({ ...log, date: log.createdAt }));

            return {
                data:       mapped,
                hasMore:    mapped.length >= limit,
                totalCount: (page - 1) * limit + mapped.length,
            };
        } catch (err) {
            console.error('[historyService] getHistoryByTeam:', err);
            return { data: [], hasMore: false, totalCount: 0 };
        }
    },
};
