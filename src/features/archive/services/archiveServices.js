import { api } from '../../../api/api';

// Basit bir memory-cache nesnesi
const cache = {
    expenses: null,
    trips: null,
    lastFetched: null
};

export const archiveService = {
    getArchiveData: async (teamId, forceRefresh = false) => {
        // Eğer veri varsa ve zorunlu yenileme istenmediyse cache'den dön
        if (!forceRefresh && cache.expenses && cache.trips) {
            console.log("Archive: Veriler cache'den getirildi.");
            return { expenses: cache.expenses, trips: cache.trips };
        }

        try {
            console.log("Archive: API isteği atılıyor...");
            // Paralel isteklerle veriyi çek
            const [expenses, trips] = await Promise.all([
                api.expenses.getAll(),
                api.trips.getAll()
            ]);

            // Takıma göre filtrele
            const teamExpenses = expenses.filter(e => String(e.teamId) === String(teamId));
            const teamTrips = trips.filter(t => String(t.teamId) === String(teamId));

            // Cache'e yaz
            cache.expenses = teamExpenses;
            cache.trips = teamTrips;
            cache.lastFetched = new Date();

            return { expenses: teamExpenses, trips: teamTrips };
        } catch (error) {
            console.error("Arşiv verisi çekilirken hata:", error);
            throw error;
        }
    },

    // Yeni veri eklendiğinde cache'i temizlemek için kullanacağız
    clearCache: () => {
        cache.expenses = null;
        cache.trips = null;
        cache.lastFetched = null;
    }
};