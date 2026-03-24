import { api } from '../../../services/api'; 

export const historyService = {
    // Takım bazlı logları getirme fonksiyonu
    getHistoryByTeam: async (teamId) => {
        try {
            //  Tüm takımları getir
            const allTeams = await api.teams.getAll();
            
            if (!allTeams || !teamId) return [];

            //  LocalStorage'dan gelen ID ile eşleşen takımı bul
            const currentTeam = allTeams.find(t => String(t.id) === String(teamId));

            //  Takımı bulduysak içindeki history'yi, bulamadıysak boş array dön
            console.log(`${teamId} için loglar çekildi.`);
            return currentTeam ? (currentTeam.history || []) : [];
            
        } catch (error) {
            console.error("History çekilirken hata oluştu:", error);
            return [];
        }
    }
};