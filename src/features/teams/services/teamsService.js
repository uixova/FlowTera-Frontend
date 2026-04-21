import { api } from '../../../api/api';

const randomDelay = (min = 200, max = 500) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

const ROLE_PRIORITY = {
    "Admin": 1,
    "Moderator": 2,
    "Member": 3
};

export const teamMembersCache = new Map();
export const teamMembersRequestCache = new Map();

export const teamsService = {
    // Tüm takımları getirme (Kullanıcıya göre filtreleyerek)
    getTeams: async (currentUser) => {
        if (!currentUser || !currentUser.teams) return [];
        await randomDelay(300, 500);

        // OPTİMİZASYON: Tüm takımları çekmek yerine kullanıcının sahip olduğu ID'lerle işlem yapıyoruz
        const allTeams = await api.teams.getAll() || [];
        
        // Kullanıcının içindeki takımları filtrele
        return allTeams
            .filter(team => 
                team.isDeleted !== true && 
                currentUser.teams?.some(tId => String(tId) === String(team.id))
            )
            .map(team => ({
                ...team,
                members: Array.isArray(team.members) ? team.members.length : (team.membersCount || 0)
            }));
    },

    // Takım üyelerini getirme
    getTeamMembers: async (teamId) => {
        if (!teamId) return [];
        await randomDelay(200, 400);
    
        // OPTİMİZASYON: Paralel çekim ve Map kullanımı ile döngü performansını artırdık
        const [allTeams, allUsers] = await Promise.all([
            api.teams.getAll() || [],
            api.users.getAll() || []
        ]);
    
        const teamData = allTeams.find(t => String(t.id) === String(teamId));
        const teamMembersRaw = Array.isArray(teamData?.members) ? teamData.members : [];

        // Performans için userMap oluşturuyoruz: Tek tek find yapmak yerine ID ile direkt erişim
        const userMap = new Map(allUsers.map(u => [String(u.id), u]));

        const normalized = teamMembersRaw.map((tm) => {
            const isDeleted = Boolean(tm?.isDeleted);
            
            // Map üzerinden O(1) hızında veriyi alıyoruz
            const fullUserData = userMap.get(String(tm.id));
            const specificTeamRole = fullUserData?.role?.find(r => String(r.teamId) === String(teamId));

            return {
                id: String(tm.id),
                name: isDeleted ? "DeletedUser" : (tm.name || fullUserData?.name || "Unknown"),
                avatar: isDeleted ? null : (tm.avatar || fullUserData?.avatar || null),
                email: isDeleted ? '' : (tm.email || fullUserData?.email || ''),
                isDeleted,
                lastLogin: tm?.lastLogin || fullUserData?.lastLogin || null,
                roleName: specificTeamRole?.roleName || tm?.roleName || "Member",
                permissions: specificTeamRole?.permissions || tm?.permissions || []
            };
        });

        return normalized.sort((a, b) => (ROLE_PRIORITY[a.roleName] || 99) - (ROLE_PRIORITY[b.roleName] || 99));
    },

    // Kullanıcı Loglarını getirme
    getUserLogs: async (userId, teamId) => {
        if (!userId || !teamId) return [];
        await randomDelay(400, 800); 

        const logsResponse = await api.logs.getAll() || [];
        // JSON yapına göre TeamMemberLogs dizisini bul
        const teamMemberLogContainer = logsResponse.find(item => item.TeamMemberLogs);
        const allLogs = teamMemberLogContainer ? teamMemberLogContainer.TeamMemberLogs : [];

        return allLogs
            .filter(log => {
                const logUserId = log?.createdBy?.id || log?.userId;
                return String(logUserId) === String(userId) && String(log.teamId) === String(teamId);
            })
            .map(log => ({
                ...log,
                details: log.details ?? log.action ?? ''
            }))
            .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));
    },

    // Takım ayarlarını getirme
    getTeamSettings: async (teamId) => {
        if (!teamId) return null;
        await randomDelay(100, 200);

        // Paralel fetch: Takımlar, Kullanıcılar ve Planlar 
        const [allTeams, allUsers, allPlans] = await Promise.all([
            api.teams.getAll() || [],
            api.users.getAll() || [],
            api.plans.getAll() || [] 
        ]);

        const team = allTeams.find(t => String(t.id) === String(teamId));
        if (!team) return null;

        // 1. Takımın içine gömülü planId'yi alıyoruz
        const teamPlanContext = team.settings?.planContext || {};
        const teamPlanId = teamPlanContext.planId;
    
        // 2. Bu ID ile plan.json içinden ilgili planı buluyoruz
        const linkedPlan = allPlans.find(p => String(p.id) === String(teamPlanId));

        // 3. Owner (Kurucu) verisini hala çekiyoruz ama sadece "Upgrade" kontrolü için
        const ownerUser = allUsers.find(u => String(u.id) === String(team.ownerId));

        // MANTIK: 
        // Öncelik: plan.json'daki feature_keys (Id eşleşirse)
        // Yedek: Takım verisindeki statik özellikler (plan.json bulunamazsa)
        // Upgrade: Eğer owner hala varsa ve paketi takımdan daha üstünse özellikleri birleştirir.
    
        let baseFeatures = linkedPlan?.feature_keys || [];
        let baseMaxLimit = linkedPlan?.Promise?.TeamMemberLimit 
            ? parseInt(linkedPlan.Promise.TeamMemberLimit) 
            : (teamPlanContext.maxMembersAllowed || 5);

        // Owner hala sistemdeyse ve aboneliği takımdaki plandan yüksekse limitleri güncelle
        const ownerFeatures = ownerUser?.subscription?.feature_keys || [];
        const ownerMaxLimit = ownerUser?.subscription?.maxMembersPerTeam || 0;

        // Set kullanarak duplicate (çakışan) yetenekleri temizliyoruz
        const finalFeatures = Array.from(new Set([
            ...baseFeatures,
            ...ownerFeatures
        ]));

        const finalMaxLimit = Math.max(baseMaxLimit, ownerMaxLimit);

        return {
            ...team,
            adminPlanLimit: finalMaxLimit,
            ownerPlanType: linkedPlan?.name || teamPlanContext.planName || 'Free',
            // Frontend tarafında hasFeature('ocr_scan') gibi kontrol etmek için
            availableFeatures: finalFeatures, 
            // İhtiyaç duyulursa planın tam objesi
            planDetails: linkedPlan || null 
        };
    },

    // Rol Güncelleme (Simülasyon)
    updateUserRole: async (userId, teamId, newRoleName) => {
        await randomDelay(500, 1000);
        console.log(`[API UPDATE] User: ${userId}, Team: ${teamId}, New Role: ${newRoleName}`);
        return { success: true, message: "Role updated successfully" };
    },

    // Takım ayarlarını güncelleme (Simülasyon)
    updateTeamSettings: async (teamId, updatePayload) => {
        await randomDelay(600, 1200);
        
        /* BACKEND SİMÜLASYONU: 
            Burada gerçek bir API olsaydı, gönderilen updatePayload içindeki 'memberLimit' 
            değeri, getTeamSettings'den dönen 'adminPlanLimit' değerinden büyükse 
            hata döndürecekti.
        */
        
        console.log(`[API UPDATE] Team: ${teamId} için ayarlar güncellendi.`, updatePayload);
        return { success: true, message: "Ayarlar başarıyla güncellendi." };
    },

    // Basit takım listesini getirme
    getSimpleTeams: async () => {
        await randomDelay(100, 300); 
        const teams = await api.teams.getAll() || [];
        return [...teams].sort((a, b) => a.name.localeCompare(b.name));
    }
};