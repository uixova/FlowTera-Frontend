import { api } from '../../../api/api';

const randomDelay = (min = 300, max = 1000) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const expenseService = {
    // Yardımcı fonksiyon: Giderleri kullanıcı verileriyle birleştirir
    enrichExpensesWithUserData: async (expenses) => {
        const users = await api.users.getAll();
        if (!users || !expenses) return expenses;

        return expenses.map(expense => {
            const createdBy = expense.createdBy;
            const submitterId =
                createdBy?.id ??
                expense.userId ??
                expense.submitterId ??
                null;

            const createdByName = createdBy?.name;
            const userDetail = submitterId
                ? users.find(u => String(u.id) === String(submitterId))
                : null;

            const isDeleted = Boolean(userDetail?.isDeleted);
            
            return {
                ...expense,
                // createdBy varsa onu kullan, yoksa id üzerinden user.json'dan ararız.
                user: isDeleted
                    ? "DeletedUser"
                    : (createdByName || expense.user || userDetail?.name || "Unknown"),
                userAvatar: isDeleted ? null : (userDetail?.avatar || null),
                userRole: isDeleted ? 'free' : (userDetail?.subscription?.plan || 'free')
            };
        });
    },

    // Tüm giderleri getirme fonksiyonu
    getAllExpenses: async () => {
        try {
            await randomDelay(400, 1200);
            const rawExpenses = await api.expenses.getAll();
            if (!rawExpenses) return [];

            // Veriyi kullanıcı bilgileriyle zenginleştirip döndür
            return await expenseService.enrichExpensesWithUserData(rawExpenses);
        } catch (error) {
            console.error("Service Error: GetExpenses failed", error);
            throw error;
        }
    },

    // Takım bazında giderleri getirme fonksiyonu
    getExpensesByTeam: async (teamId, page = 1, limit = 20) => {
        try {
            await randomDelay(400, 800);
            if (!teamId) return { data: [], hasMore: false, totalCount: 0 };

            const allExpenses = await api.expenses.getAll();
            if (!allExpenses) return { data: [], hasMore: false, totalCount: 0 };

            // Takım Filtrelemesi
            const filtered = allExpenses.filter(exp => 
                String(exp.teamId).trim() === String(teamId).trim()
            );

            // Sayfalama Hesaplaması
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = filtered.slice(startIndex, endIndex);

            // Kontrol Mekanizması
            const hasMore = filtered.length > endIndex;

            // Veriyi Zenginleştir
            const enrichedData = await expenseService.enrichExpensesWithUserData(paginatedData);

            // Hook'un beklediği standart nesneyi dönüyoruz
            return {
                data: enrichedData,
                hasMore: hasMore,
                totalCount: filtered.length
            };
        } catch (error) {
            console.error("Service Error", error);
            throw error;
        }
    },

    // Yeni gider oluşturma fonksiyonu (Simülasyon)
    createExpense: async (expenseData) => {
        await randomDelay(600, 1500); 
        return { success: true, data: expenseData };
    },

    // Takım bazında giderleri getirme fonksiyonu (Simülasyon)
    getTeamInfo: async (teamId) => {
        await randomDelay(100, 300);
        const allTeams = await api.teams.getAll();
        return allTeams?.find(t => String(t.id) === String(teamId));
    }
};