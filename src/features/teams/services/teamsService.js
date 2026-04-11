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
    getTeams: async (currentUser) => {
        await randomDelay(400, 1000);
        const allTeams = await api.teams.getAll() || [];
        
        // Eğer kullanıcı verisi yoksa boş dön, varsa sadece kullanıcının takımlarını filtrele
        const filteredTeams = allTeams.filter(team => 
            currentUser?.teams?.some(tId => String(tId) === String(team.id)) && team.isDeleted !== true
        );

        // Teams.json içinde üyeler doğrudan tutuluyor; user.teams üzerinden filtrelemiyoruz.
        return filteredTeams.map(team => ({
            ...team,
            members: Array.isArray(team.members) ? team.members.length : (team.membersCount || 0)
        }));
    },

    // Takım üyelerini getirme fonksiyonu
    getTeamMembers: async (teamId) => {
        if (!teamId) return [];
        await randomDelay(300, 600);
        const allTeams = await api.teams.getAll() || [];
        const allUsers = await api.users.getAll() || [];

        const userMap = new Map(allUsers.map(u => [String(u.id), u]));

        const team = allTeams.find(t => String(t.id) === String(teamId));
        const teamMembers = Array.isArray(team?.members) ? team.members : [];

        const normalized = teamMembers.map((tm) => {
            const memberId = String(tm.id);
            const userDetail = userMap.get(memberId);
            const isDeleted = Boolean(userDetail?.isDeleted);

            const specificRole = userDetail?.role?.find(r => String(r.teamId) === String(teamId));

            return {
                id: memberId,
                name: isDeleted ? "DeletedUser" : (tm.name || userDetail?.name || "Unknown"),
                avatar: isDeleted ? null : (tm.avatar || userDetail?.avatar || null),
                email: isDeleted ? '' : (tm.email || userDetail?.email || ''),
                isDeleted,
                lastLogin: userDetail?.lastLogin || null,
                roleName: specificRole?.roleName || "Member",
                permissions: specificRole?.permissions || []
            };
        });

        // Admin en başa, sonra Moderator, sonra Member gelir
        return normalized.sort((a, b) => (ROLE_PRIORITY[a.roleName] || 99) - (ROLE_PRIORITY[b.roleName] || 99));
    },

    // Takım bilgilerini getirme fonksiyonu (Simülasyon)
    getUserLogs: async (userId, teamId) => {
        await randomDelay(400, 800); 
        const response = await api.logs.getAll() || [];
    
        // JSON içindeki TeamMemberLogs dizisini bulup çıkarıyoruz
        const teamMemberLogContainer = response.find(item => item.TeamMemberLogs);
        const allLogs = teamMemberLogContainer ? teamMemberLogContainer.TeamMemberLogs : [];

        // TeamMemberLogs içinde user eşleşmesi createdBy.id üzerinden geliyor.
        return allLogs
            .filter(log => {
                const createdById = log?.createdBy?.id || log?.userId || null;
                return String(createdById) === String(userId) && String(log.teamId) === String(teamId);
            })
            .map(log => ({
                ...log,
                // UI tarafında details aranıyor; yoksa aksiyonu fallback yapıyoruz.
                details: log.details ?? log.action ?? ''
            }))
            .sort((a, b) => {
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

    // Takım ayarları güncelleme fonksiyonu (Simülasyon)
    updateTeamSettings: async (teamId, settingsData) => {
        await randomDelay(600, 1200);
        console.log(`[API UPDATE] Team: ${teamId} settings updated:`, settingsData);
        
        // Burada gerçekte api.teams.update() gibi bir çağrı olacak
        return { success: true, message: "Ayarlar başarıyla güncellendi." };
    },

    // Basit takım listesini getirme fonksiyonu (Simülasyon)
    getSimpleTeams: async () => {
        await randomDelay(100, 300); 
        const teams = await api.teams.getAll() || [];
        // Alfabetik sıralama
        return teams.sort((a, b) => a.name.localeCompare(b.name));
    },

};