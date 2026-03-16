import allExpensesData from '../data/expenses.json';

// Gerçekçi yükleme hissi için rastgele gecikme
const randomDelay = (min = 300, max = 1000) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const expenseService = {
    // 1. Tüm Harcamaları Getir
    getAllExpenses: async () => {
        try {
            await randomDelay(400, 1200); // Harcamalar listesi genelde kalabalıktır
            return allExpensesData;
        } catch (error) {
            console.error("Service Error: GetExpenses failed", error);
            throw error;
        }
    },

    // 2. Yeni Harcama Oluştur
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

    // 3. Harcama Sil (Lazım olabilir!)
    deleteExpense: async (id) => {
        await randomDelay(300, 700);
        return { success: true, id };
    }
};