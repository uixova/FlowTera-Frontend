import allExpensesData from '../data/expenses.json';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const expenseService = {
    // Tüm harcamaları getir
    getAllExpenses: async () => {
        try {
            // const response = await fetch('/api/expenses'); return response.json();
            await delay(500); 
            return allExpensesData;
        } catch (error) {
            console.error("Service Error: GetExpenses failed", error);
            throw error;
        }
    },

    createExpense: async (expenseData) => {
        await delay(500);
        console.log("API'ye gönderilen veri:", expenseData);
        return { success: true, data: expenseData };
    }
};