import { api } from '../../../api/api';
import { isDemoMode } from '../../../utils/demo';
import { Expense, Trip } from '@/types/types';
import demoExpenses from '../../../data/demo-expenses.json';
import demoTrips    from '../../../data/demo-trips.json';

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

// Demo mod için yerel JSON verisi — backend çağrısı yapılmaz
const DEMO_EMPTY: PaginatedResponse<any> = {
    data: [], totalCount: 0, total: 0,
    hasMore: false, page: 1, pageSize: ARCHIVE_PAGE_SIZE, totalPages: 1,
};

export const archiveService = {

    // Arşiv verisini getirir.
    // Demo modda backend'e bağlanmaz — yerel JSON dosyaları kullanılır.
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

        // ── Demo Mod: backend çağrısı yok ──────────────────────────────────
        if (isDemoMode()) {
            const exps  = (demoExpenses as any[]).map(e => ({ ...e, _type: 'expense' }));
            const trps  = (demoTrips    as any[]).map(t => ({ ...t, _type: 'trip'    }));
            const start = (page - 1) * pageSize;
            return {
                expenses: {
                    data:       exps.slice(start, start + pageSize) as Expense[],
                    totalCount: exps.length,
                    total:      exps.length,
                    hasMore:    start + pageSize < exps.length,
                    page,
                    pageSize,
                    totalPages: Math.ceil(exps.length / pageSize),
                },
                trips: {
                    data:       trps.slice(start, start + pageSize) as Trip[],
                    totalCount: trps.length,
                    total:      trps.length,
                    hasMore:    start + pageSize < trps.length,
                    page,
                    pageSize,
                    totalPages: Math.ceil(trps.length / pageSize),
                },
            };
        }

        // ── Gerçek Mod: backend API ────────────────────────────────────────
        if (forceRefresh) api.cache.invalidate('ARCHIVE');
        const params = { page, pageSize, ...(teamId ? { teamId: String(teamId) } : {}) };
        const result = await api.archive.getAll(params, { forceRefresh });

        // Backend yanıtı: { status: 'OK', data: { expenses: {...}, trips: {...} } }
        const container = (result as any)?.data ?? (result as any);

        return {
            expenses: normalize<Expense>(container?.expenses ?? container),
            trips:    normalize<Trip>(container?.trips    ?? { data: [] }),
        };
    },

    invalidate: (): void => {
        if (isDemoMode()) return; // Demo modda cache yoktur
        api.cache.invalidate('ARCHIVE');
        api.cache.invalidate('TRIPS');
    },
};
