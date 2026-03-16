import teamsData from '../data/teams.json';
import teamMembersData from '../data/teamMembers.json';
import allLogsJSON from '../data/userLog.json';

// Simulate API delay with a random timeout between min and max milliseconds (200-800ms arasında)
const randomDelay = (min = 200, max = 800) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const teamsService = {
    // 1. Tüm Takımları Getir
    getTeams: async () => {
        await randomDelay(400, 1200); 
        return teamsData;
    },

    // 2. Takım Üyelerini Getir
    getTeamMembers: async (teamId) => {
    console.log("Servise gelen ID:", teamId); // Debug 1
    console.log("Tüm Üyeler Datası:", teamMembersData); // Debug 2

    if (!teamId) {
        console.warn("Hata: teamId gelmedi!");
        return [];
    }

    await randomDelay(300, 800);

    // Her iki tarafı da String'e çevirip öyle karşılaştırıyoruz
    const filtered = teamMembersData.filter(m => String(m.teamId) === String(teamId));
    
    console.log("Filtrelenmiş Sonuç:", filtered); // Debug 3
    return filtered;
},

    // 3. Kullanıcı Loglarını Getir
    getUserLogs: async (userId, teamId) => {
        await randomDelay(500, 1500); 
        return allLogsJSON.filter(log => 
            String(log.userId) === String(userId) && 
            String(log.teamId) === String(teamId)
        );
    },

    // 4. Rol Güncelleme 
    updateUserRole: async (userId, newRole) => {
        await randomDelay(200, 500);
        console.log(`API SUCCESS: User ${userId} is now ${newRole}`);
        return { success: true };
    }
}; 