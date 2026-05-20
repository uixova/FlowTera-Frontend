import { api } from '../../../api/api';
import { Expense, User, Team } from '@/types/types';
import { dataEvents } from '../../../hooks/useDataRefresh';

// UI katmanında zenginleştirilmiş gider yapısı
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

// Paginated veya düz array'den veriyi güvenle çıkar
const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const expenseService = {

    // Giderleri kullanıcı verileriyle zenginleştir
    async enrichExpensesWithUserData(expenses: Expense[]): Promise<EnrichedExpense[]> {
        if (!expenses?.length) return [];

        const usersResponse = await api.users.getAll({ pageSize: 1000 });
        const users = extractList<User>(usersResponse);

        return expenses.map(expense => {
            const submitterId =
                expense.createdBy?.id ??
                (expense as any).userId ??
                (expense as any).submitterId ??
                null;

            const userDetail = users.find(u => String(u.id) === String(submitterId));
            const isDeleted = Boolean(userDetail?.isDeleted);

            return {
                ...expense,
                user: isDeleted
                    ? "DeletedUser"
                    : (expense.createdBy?.name || userDetail?.name || "Unknown"),
                userAvatar: isDeleted ? null : (userDetail?.avatar ?? null),
                userRole: isDeleted ? 'free' : (userDetail?.subscription?.plan ?? 'free')
            };
        });
    },

    // Takım bazında giderleri getir
    async getExpensesByTeam(teamId: string | number, page: number = 1, limit: number = 20): Promise<ExpenseFetchResult> {
        if (!teamId) return { data: [], hasMore: false, totalCount: 0 };

        const response = await api.expenses.getAll({ pageSize: 2000 });
        const allExpenses = extractList<Expense>(response);

        if (!allExpenses.length) return { data: [], hasMore: false, totalCount: 0 };

        const filtered = allExpenses.filter(
            exp => String(exp.teamId).trim() === String(teamId).trim()
        );

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filtered.slice(startIndex, endIndex);

        const enrichedData = await expenseService.enrichExpensesWithUserData(paginatedData);

        return {
            data: enrichedData,
            hasMore: filtered.length > endIndex,
            totalCount: filtered.length
        };
    },

    // Yeni gider oluşturma
    async createExpense(payload: Record<string, any>): Promise<{ success: boolean }> {
        const body = new FormData();
        Object.keys(payload).forEach(key => {
            if (key === 'receipt' && payload[key] instanceof File) {
                body.append('file', payload[key]);
            } else {
                body.append(key, payload[key]);
            }
        });

        console.log("API'ye gönderilmeye hazır veri:", payload);
        dataEvents.notify();
        return { success: true };
    },

    // Gider güncelleme (simülasyon)
    async updateExpense(id: string | number, payload: Partial<Expense>): Promise<{ success: boolean }> {
        console.log(`${id} ID'li kayıt güncelleniyor:`, payload);
        return { success: true };
    },

    // Takım bilgisini getir
    async getTeamInfo(teamId: string | number): Promise<Team | null> {
        const response = await api.teams.getAll({ pageSize: 500 });
        const allTeams = extractList<Team>(response);
        return allTeams.find(t => String(t.id) === String(teamId)) ?? null;
    },

    // Gider silme
    async deleteExpense(id: string | number): Promise<{ success: boolean }> {
        console.log(`${id} ID'li gider siliniyor.`);
        return { success: true };
    }
};