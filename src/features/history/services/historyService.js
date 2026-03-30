import { api } from '../../../services/api';

// Yapay gecikme fonksiyonu (200-800ms arasında rastgele)
const randomDelay = (min = 200, max = 800) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const historyService = {
    // Takım bazlı geçmiş verilerini getirme
    getHistoryByTeam: async (teamId, page = 1, limit = 20) => {
        try {
            // Takım değiştiğinde Loader'ın ekranda kalması için yapay gecikme
            await randomDelay(400, 1000);

            // Veri çekme işlemi
            const response = await api.logs.getAll() || [];
            
            // JSON yapısından TeamLogs dizisini ayıkla
            const teamLogContainer = response.find(item => item.TeamLogs);
            const allLogs = teamLogContainer ? teamLogContainer.TeamLogs : [];

            // teamId'ye göre filtrele 
            const filteredLogs = allLogs.filter(log => 
                String(log.teamId) === String(teamId)
            );

            // Sayfalama (Pagination) hesaplamaları
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = filteredLogs.slice(startIndex, endIndex);
            
            // Daha fazla veri olup olmadığını kontrol et
            const hasMore = filteredLogs.length > endIndex;

            return {
                data: paginatedData,
                hasMore: hasMore,
                totalCount: filteredLogs.length
            };
        } catch (error) {
            console.error("History fetching error:", error);
            return { data: [], hasMore: false, totalCount: 0 };
        }
    }
};