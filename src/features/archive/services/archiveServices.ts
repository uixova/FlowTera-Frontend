import { api } from '../../../api/api';
import { Expense, Trip } from '@/types/types';

// API'den gelen yapıya göre arayüzü esnetiyoruz
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

// Mock modda client-side teamId filtresi
const filterByTeam = <T extends { teamId?: string | number }>(items: T[], teamId?: string | number): T[] => {
    if (!teamId) return items;
    return items.filter(item => String(item.teamId) === String(teamId));
};

export const archiveService = {

    // Ana veri çekici — expenses + trips paralel gelir
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

        const [expenseResult, tripResult] = await Promise.all([
            api.archive.getAll({ page, pageSize }, { forceRefresh }),
            api.trips.getAll(  { page, pageSize }, { forceRefresh }),
        ]);

        // Tip zorlaması 
        const expenseData = (expenseResult as any);
        const tripData = (tripResult as any);

        const expenses: PaginatedResponse<Expense> = {
            ...expenseData,
            totalCount: expenseData.totalCount ?? expenseData.total ?? 0,
            data: filterByTeam<Expense>(expenseData?.data ?? [], teamId),
        };

        const trips: PaginatedResponse<Trip> = {
            ...tripData,
            totalCount: tripData.totalCount ?? tripData.total ?? 0,
            data: filterByTeam<Trip>(tripData?.data ?? [], teamId),
        };

        return { expenses, trips };
    },

    // Sadece harcamaları getirir
    getExpenses: async ({ teamId, page = 1, pageSize = ARCHIVE_PAGE_SIZE, forceRefresh = false }: any = {}): Promise<PaginatedResponse<Expense>> => {
        const result = await api.archive.getAll({ page, pageSize }, { forceRefresh });
        const res = (result as any);
        return {
            ...res,
            totalCount: res.totalCount ?? res.total ?? 0,
            data: filterByTeam<Expense>(res?.data ?? [], teamId),
        };
    },

    // Sadece seyahatleri getirir
    getTrips: async ({ teamId, page = 1, pageSize = ARCHIVE_PAGE_SIZE, forceRefresh = false }: any = {}): Promise<PaginatedResponse<Trip>> => {
        const result = await api.trips.getAll({ page, pageSize }, { forceRefresh });
        const res = (result as any);
        return {
            ...res,
            totalCount: res.totalCount ?? res.total ?? 0,
            data: filterByTeam<Trip>(res?.data ?? [], teamId),
        };
    },

    // Cache'i temizler
    invalidate: (): void => {
        api.cache.invalidate('ARCHIVE');
        api.cache.invalidate('TRIPS');
    },
};