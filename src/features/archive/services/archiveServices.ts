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
    totalCount: res?.total ?? res?.totalCount ?? 0,
    total:      res?.total,
    hasMore:    res?.hasMore ?? false,
    page:       res?.page ?? 1,
    pageSize:   res?.pageSize ?? ARCHIVE_PAGE_SIZE,
    totalPages: res?.totalPages ?? 1,
});

export const archiveService = {

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
        if (forceRefresh) {
            api.cache.invalidate('ARCHIVE');
            api.cache.invalidate('TRIPS');
        }

        const params = { page, pageSize, ...(teamId ? { teamId: String(teamId) } : {}) };

        const [expenseResult, tripResult] = await Promise.all([
            api.archive.getAll(params, { forceRefresh }),
            api.trips.getAll(params,   { forceRefresh }),
        ]);

        return {
            expenses: normalize<Expense>(expenseResult),
            trips:    normalize<Trip>(tripResult),
        };
    },

    getExpenses: async ({ teamId, page = 1, pageSize = ARCHIVE_PAGE_SIZE, forceRefresh = false }: any = {}): Promise<PaginatedResponse<Expense>> => {
        const params = { page, pageSize, ...(teamId ? { teamId: String(teamId) } : {}) };
        const result = await api.archive.getAll(params, { forceRefresh });
        return normalize<Expense>(result);
    },

    getTrips: async ({ teamId, page = 1, pageSize = ARCHIVE_PAGE_SIZE, forceRefresh = false }: any = {}): Promise<PaginatedResponse<Trip>> => {
        const params = { page, pageSize, ...(teamId ? { teamId: String(teamId) } : {}) };
        const result = await api.trips.getAll(params, { forceRefresh });
        return normalize<Trip>(result);
    },

    invalidate: (): void => {
        api.cache.invalidate('ARCHIVE');
        api.cache.invalidate('TRIPS');
    },
};
