import { api } from '../../../api/api';

const randomDelay = (min = 200, max = 800) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

const ROLE_PRIORITY = {
    "Admin": 1,
    "Moderator": 2,
    "Member": 3
};

export const teamsService = {
    // Tüm takımları getirme fonksiyonu
    getTeams: async () => {
        await randomDelay(400, 1000);
        const teams = await api.teams.getAll() || [];
        const allUsers = await api.users.getAll() || [];

        return teams.map(team => ({
            ...team,
            // ID'leri string yaparak karşılaştırıyoruz
            members: allUsers.filter(u => 
                u.teams.some(tId => String(tId) === String(team.id))
            ).length
        }));
    },

    // Takım üyelerini getirme fonksiyonu
    getTeamMembers: async (teamId) => {
        if (!teamId) return [];
        await randomDelay(300, 600);
        const allUsers = await api.users.getAll() || [];

        const members = allUsers
            .filter(user => user.teams.includes(teamId))
            .map(user => {
                const specificRole = user.role.find(r => String(r.teamId) === String(teamId));
                return {
                    ...user,
                    roleName: specificRole?.roleName || "Member",
                    permissions: specificRole?.permissions || []
                };
            });

        //  SIRALAMA MANTIĞI 
        // Admin en başa, sonra Moderator, sonra Member gelir
        return members.sort((a, b) => {
            return (ROLE_PRIORITY[a.roleName] || 99) - (ROLE_PRIORITY[b.roleName] || 99);
        });
    },

    // Takım bilgilerini getirme fonksiyonu (Simülasyon)
    getUserLogs: async (userId, teamId) => {
        await randomDelay(400, 800); 
        const response = await api.logs.getAll() || [];
    
        // JSON içindeki TeamMemberLogs dizisini bulup çıkarıyoruz
        const teamMemberLogContainer = response.find(item => item.TeamMemberLogs);
        const allLogs = teamMemberLogContainer ? teamMemberLogContainer.TeamMemberLogs : [];

        // userId ve teamId'ye göre filtreleyip, tarih ve saate göre sıralıyoruz
        return allLogs.filter(log => 
            String(log.userId) === String(userId) && 
            String(log.teamId) === String(teamId)
        ).sort((a, b) => {
            // Tarih ve saat birleştirme işlemi
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB - dateA;
        });
    },

    // Yeni üye ekleme fonksiyonu (Simülasyon)
    updateUserRole: async (userId, teamId, newRoleName) => {
        await randomDelay(500, 1000);
        // İleride burada bir PATCH isteği atılacak
        console.log(`[API UPDATE] User: ${userId}, Team: ${teamId}, New Role: ${newRoleName}`);
        return { success: true, message: "Role updated successfully" };
    },

    // Takım detaylarını getirme fonksiyonu (Simülasyon)
    getTeamSettings: async (teamId) => {
        if (!teamId) return null;
        await randomDelay(60, 140);
    
        const teams = await api.teams.getAll() || [];
        const allUsers = await api.users.getAll() || [];
    
        const team = teams.find(t => String(t.id) === String(teamId));
        if (!team) return null;

        // Admin'i bul ve plan limitini al
        const adminUser = allUsers.find(u => 
            u.role.some(r => String(r.teamId) === String(teamId) && r.roleName === 'Admin')
        );

        return {
            ...team,
            adminPlanLimit: adminUser?.subscription?.maxMembersPerTeam || 5
        };
    },

    // Basit takım listesini getirme fonksiyonu (Simülasyon)
    getSimpleTeams: async () => {
        await randomDelay(100, 300); 
        const teams = await api.teams.getAll() || [];
        // Alfabetik sıralama
        return teams.sort((a, b) => a.name.localeCompare(b.name));
    },

};