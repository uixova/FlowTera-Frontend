import allExpensesData from '../data/expenses.json';
import allTeamsData from '../../teams/data/teams.json';

// Gerçekçi yükleme hissi için rastgele gecikme
const randomDelay = (min = 300, max = 1000) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const expenseService = {
    // Tüm Harcamaları Getir
    getAllExpenses: async () => {
        try {
            await randomDelay(400, 1200); // Harcamalar listesi genelde kalabalıktır
            return allExpensesData;
        } catch (error) {
            console.error("Service Error: GetExpenses failed", error);
            throw error;
        }
    },

    // Sadece seçili takımın harcamalarını getir
    getExpensesByTeam: async (teamId) => {
    try {
        await randomDelay(400, 800);
        if (!teamId) return [];

        // Hem gelen teamId'yi hem de verideki teamId'yi String'e çevirip öyle karşılaştır
        const filtered = allExpensesData.filter(exp => 
            String(exp.teamId).trim() === String(teamId).trim()
        );

        console.log("Filtrelenmiş Veri Sayısı:", filtered.length);
        return filtered;
    } catch (error) {
        console.error("Service Error", error);
        throw error;
    }
    },

    // Yeni Harcama Oluştur
    createExpense: async (expenseData) => {
        try {
            await randomDelay(600, 1500); 
            console.log("API Simulation: Data saved", expenseData);
            return { success: true, data: expenseData };
        } catch (error) {
            console.error("Service Error: CreateExpense failed", error);
            throw error;
        }
    },

    // Harcama Sil (Lazım olabilir!)
    deleteExpense: async (id) => {
        await randomDelay(300, 700);
        return { success: true, id };
    },

    getTeamInfo: async (teamId) => {
        await randomDelay(100, 300); // Daha hızlı gelsin
        return allTeamsData.find(t => String(t.id) === String(teamId));
    }
};