import { api } from '../../../api/api';

// Paginated veya düz array'den veriyi güvenle çıkar
const extractList = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const expenseService = {

    // Giderleri kullanıcı verileriyle zenginleştir
    enrichExpensesWithUserData: async (expenses) => {
        if (!expenses?.length) return expenses ?? [];

        const usersResponse = await api.users.getAll({ pageSize: 1000 });
        const users = extractList(usersResponse);

        return expenses.map(expense => {
            const submitterId =
                expense.createdBy?.id ??
                expense.userId ??
                expense.submitterId ??
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
    getExpensesByTeam: async (teamId, page = 1, limit = 20) => {
        if (!teamId) return { data: [], hasMore: false, totalCount: 0 };

        // Backend hazır olduğunda api.expenses.getAll({ teamId, page, pageSize: limit })
        const response = await api.expenses.getAll({ pageSize: 2000 });
        const allExpenses = extractList(response);

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
    createExpense: async (payload) => {
        const body = new FormData();
        Object.keys(payload).forEach(key => {
            if (key === 'receipt' && payload[key] instanceof File) {
                body.append('file', payload[key]);
            } else {
                body.append(key, payload[key]);
            }
        });

        // Gelecekte: return await api.fetch('EXPENSES', {}, { method: 'POST', body: payload });
        console.log("API'ye gönderilmeye hazır veri:", payload);
        return { success: true };
    },

    // Gider güncelleme (simülasyon)
    updateExpense: async (id, payload) => {
        // Gelecekte: return await api.fetch('EXPENSES', {}, { method: 'PUT', body: payload });
        console.log(`${id} ID'li kayıt güncelleniyor:`, payload);
        return { success: true };
    },

    // Takım bilgisini getir
    getTeamInfo: async (teamId) => {
        const response = await api.teams.getAll({ pageSize: 500 });
        const allTeams = extractList(response);
        return allTeams.find(t => String(t.id) === String(teamId)) ?? null;
    }
};