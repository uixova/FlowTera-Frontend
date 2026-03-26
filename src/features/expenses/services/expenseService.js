import { api } from '../../../services/api';

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
            // userId'ye göre kullanıcıyı bul
            const userDetail = users.find(u => u.id === expense.userId);
            
            return {
                ...expense,
                // Eğer kullanıcı bulunduysa gerçek ismini ve avatarını bas, 
                // yoksa json'daki eski değeri koru
                user: userDetail ? userDetail.name : expense.user,
                userAvatar: userDetail ? userDetail.avatar : null,
                userRole: userDetail ? userDetail.subscription?.plan : 'free'
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
    getExpensesByTeam: async (teamId) => {
        try {
            await randomDelay(400, 800);
            if (!teamId) return [];

            const allExpenses = await api.expenses.getAll();
            if (!allExpenses) return [];

            // Önce filtrele
            const filtered = allExpenses.filter(exp => 
                String(exp.teamId).trim() === String(teamId).trim()
            );

            // Sonra kullanıcı bilgileriyle eşleştir
            return await expenseService.enrichExpensesWithUserData(filtered);
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