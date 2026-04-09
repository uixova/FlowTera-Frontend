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
            const submitterId = expense.createdBy?.id ?? expense.userId ?? expense.submitterId ?? null;
            const userDetail = users.find(u => String(u.id) === String(submitterId));
            const isDeleted = Boolean(userDetail?.isDeleted);
            
            return {
                ...expense,
                user: isDeleted ? "DeletedUser" : (expense.createdBy?.name || userDetail?.name || "Unknown"),
                userAvatar: isDeleted ? null : (userDetail?.avatar || null),
                userRole: isDeleted ? 'free' : (userDetail?.subscription?.plan || 'free')
            };
        });
    },

    // Takım bazında giderleri getirme fonksiyonu
    getExpensesByTeam: async (teamId, page = 1, limit = 20) => {
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

        // Veriyi Zenginleştir
        const enrichedData = await expenseService.enrichExpensesWithUserData(paginatedData);

        return {
            data: enrichedData,
            hasMore: filtered.length > endIndex,
            totalCount: filtered.length
        };
    },

    // Yeni gider oluşturma fonksiyonu
    createExpense: async (payload) => {
        await randomDelay(500, 1000);

        // Backend dosya bekliyorsa FormData hazır
        const body = new FormData();
        Object.keys(payload).forEach(key => {
            if (key === 'receipt' && payload[key] instanceof File) {
                body.append('file', payload[key]);
            } else {
                body.append(key, payload[key]);
            }
        });

        // Gerçek API Call - backend endpoint hazır olduğunda burayı aç
        // return await api.expenses.create(body); 
        
        console.log("API'ye gönderilmeye hazır veri:", payload);
        return { success: true };
    },

    // Gider Güncelleme
    updateExpense: async (id, payload) => {
        await randomDelay(400, 800);
        
        // Gerçek API Call
        // return await api.expenses.update(id, payload);
        
        console.log(`${id} ID'li kayıt güncelleniyor:`, payload);
        return { success: true };
    },

    // Takım bilgisini getir
    getTeamInfo: async (teamId) => {
        await randomDelay(100, 300);
        const allTeams = await api.teams.getAll();
        return allTeams?.find(t => String(t.id) === String(teamId));
    }
};