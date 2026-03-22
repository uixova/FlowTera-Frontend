import { api } from '../../../services/api';

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

    // 3. Kullanıcı Loglarını Getir (userLog.json üzerinden)
    getUserLogs: async (userId, teamId) => {
        await randomDelay(400, 800); 
        const allLogs = await api.logs.getAll() || [];
        
        // Hem kullanıcıya hem de o takıma ait olan aksiyonları süzüyoruz
        return allLogs.filter(log => 
            String(log.userId) === String(userId) && 
            String(log.teamId) === String(teamId)
        ).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)); // En yeni log en üstte
    },

    // 4. Rol Güncelleme (Gerçekçi Simülasyon)
    updateUserRole: async (userId, teamId, newRoleName) => {
        await randomDelay(500, 1000);
        // İleride burada bir PATCH isteği atılacak
        console.log(`[API UPDATE] User: ${userId}, Team: ${teamId}, New Role: ${newRoleName}`);
        return { success: true, message: "Role updated successfully" };
    }
};