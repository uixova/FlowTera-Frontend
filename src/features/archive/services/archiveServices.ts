import { api } from '../../../api/api';
import { Expense, Trip } from '@/types/types';

export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    total?: number;
    hasMore: boolean;
    page: number;
    pageSize: number;
    totalPages: number;
}

const ARCHIVE_PAGE_SIZE = 50;

const normalize = <T>(res: any): PaginatedResponse<T> => ({
    data:       Array.isArray(res?.data) ? res.data : [],
    totalCount: res?.totalCount ?? res?.total ?? 0,
    total:      res?.totalCount ?? res?.total,
    hasMore:    res?.hasMore ?? false,
    page:       res?.page ?? 1,
    pageSize:   res?.pageSize ?? ARCHIVE_PAGE_SIZE,
    totalPages: res?.totalPages ?? 1,
});

export const archiveService = {

    // Backend returns both expenses and trips in a single /archive call
    getArchiveData: async ({
        teamId,
        page         = 1,
        pageSize     = ARCHIVE_PAGE_SIZE,
        forceRefresh = false,
    }: {
        teamId?: string | number;
        page?: number;
        pageSize?: number;
        forceRefresh?: boolean;
    } = {}): Promise<{ expenses: PaginatedResponse<Expense>; trips: PaginatedResponse<Trip> }> => {
        if (forceRefresh) api.cache.invalidate('ARCHIVE');

        const params = { page, pageSize, ...(teamId ? { teamId: String(teamId) } : {}) };
        const result = await api.archive.getAll(params, { forceRefresh });

        // Backend response: { status: 'OK', data: { expenses: {...}, trips: {...} } }
        const container = (result as any)?.data ?? (result as any);

        return {
            expenses: normalize<Expense>(container?.expenses ?? container),
            trips:    normalize<Trip>(container?.trips    ?? { data: [] }),
        };
    },

    invalidate: (): void => {
        api.cache.invalidate('ARCHIVE');
        api.cache.invalidate('TRIPS');
    },
};
