import teamsData from '../data/teams.json';
import teamMembersData from '../data/teamMembers.json';
// import teamSettingsData from '../data/teamSettings.json';
import allLogsJSON from '../data/userLog.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const teamsService = {
    // 1. Tüm Takımları Getir (Selection ekranı için)
    getTeams: async () => {
        await delay(500);
        return teamsData;
    },

    // 2. Takım Üyelerini Getir
    getTeamMembers: async (teamId) => {
        if (teamId) { console.log("Team ID: ", teamId) }
        await delay(500);
        return teamMembersData; 
    },

    // 3. Kullanıcı Loglarını Getir (Log Modal için)
    getUserLogs: async (userId, teamId) => {
        await delay(400);
        return allLogsJSON.filter(log => 
            String(log.userId) === String(userId) && 
            String(log.teamId) === String(teamId)
        );
    },

    // 4. Rol Güncelleme 
    updateUserRole: async (userId, newRole) => {
        await delay(300);
        console.log(`API SUCCESS: User ${userId} is now ${newRole}`);
        return { success: true };
    }
};