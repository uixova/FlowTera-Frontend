import { api, restFetch } from '../../../api/api';
import { Expense, User, Team } from '@/types/types';
import { dataEvents } from '../../../hooks/useDataRefresh';

export interface EnrichedExpense extends Expense {
    user: string;
    userAvatar: string | null;
    userRole: string;
}

export interface ExpenseFetchResult {
    data: EnrichedExpense[];
    hasMore: boolean;
    totalCount: number;
}

const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const expenseService = {

    // Expense listesini kullanıcı verisiyle zenginleştir
    async enrichExpensesWithUserData(expenses: Expense[]): Promise<EnrichedExpense[]> {
        if (!expenses?.length) return [];

        const usersResponse = await api.users.getAll({ pageSize: 1000 });
        const users         = extractList<User>(usersResponse);

        return expenses.map(expense => {
            const submitterId =
                expense.createdBy?.id ??
                (expense as any).userId ??
                (expense as any).submitterId ??
                null;

            const userDetail = users.find(u => String(u.id) === String(submitterId));
            const isDeleted  = Boolean(userDetail?.isDeleted);

            return {
                ...expense,
                user:       isDeleted ? 'DeletedUser' : (expense.createdBy?.name || userDetail?.name || 'Unknown'),
                userAvatar: isDeleted ? null           : (userDetail?.avatar ?? null),
                userRole:   isDeleted ? 'free'         : (userDetail?.subscription?.plan ?? 'free'),
            };
        });
    },

    // Takım bazında giderleri getir (backend paginate eder)
    async getExpensesByTeam(teamId: string | number, page = 1, limit = 20): Promise<ExpenseFetchResult> {
        if (!teamId) return { data: [], hasMore: false, totalCount: 0 };

        const response = await api.expenses.getAll({ teamId: String(teamId), page, pageSize: limit });
        const expenses = extractList<Expense>(response);
        const total    = (response as any)?.total ?? expenses.length;
        const enriched = await expenseService.enrichExpensesWithUserData(expenses);

        return {
            data:       enriched,
            hasMore:    (response as any)?.hasMore ?? page * limit < total,
            totalCount: total,
        };
    },

    // Yeni gider oluştur
    async createExpense(payload: Record<string, any>): Promise<{ success: boolean; data?: any }> {
        try {
            const result = await restFetch<{ status: string; data: any }>(
                `/expenses`,
                { method: 'POST', body: payload, params: { teamId: payload.teamId } }
            );
            api.expenses.invalidate();
            dataEvents.notify();
            return { success: true, data: (result as any).data };
        } catch {
            return { success: false };
        }
    },

    // Gider güncelle
    async updateExpense(id: string | number, payload: Partial<Expense>): Promise<{ success: boolean }> {
        try {
            await restFetch(`/expenses/${id}`, { method: 'PUT', body: payload });
            api.expenses.invalidate();
            dataEvents.notify();
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    // Gider durumunu güncelle (admin)
    async updateExpenseStatus(id: string | number, status: 'approved' | 'rejected', rejectionReason?: string): Promise<{ success: boolean }> {
        try {
            await restFetch(`/expenses/${id}/status`, {
                method: 'PATCH',
                body:   { status, rejectionReason: rejectionReason ?? null },
            });
            api.expenses.invalidate();
            dataEvents.notify();
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    // Takım bilgisini getir
    async getTeamInfo(teamId: string | number): Promise<Team | null> {
        const response = await api.teams.getAll({ pageSize: 500 });
        const allTeams = extractList<Team>(response);
        return allTeams.find(t => String(t.id) === String(teamId)) ?? null;
    },

    // Gider sil
    async deleteExpense(id: string | number): Promise<{ success: boolean }> {
        try {
            await restFetch(`/expenses/${id}`, { method: 'DELETE' });
            api.expenses.invalidate();
            dataEvents.notify();
            return { success: true };
        } catch {
            return { success: false };
        }
    },
};
