import { api } from '../../../api/api';

const randomDelay = (min = 200, max = 500) => {
    const ms = Math.floor(Math.random() * (max - min + 1) + min);
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Dışarıdan import edilen cache'ler 
export const teamMembersCache = new Map();
export const teamMembersRequestCache = new Map();

const ROLE_PRIORITY = { "Admin": 1, "Moderator": 2, "Member": 3 };

// Paginated veya düz array'den veriyi güvenle çıkar
const extractList = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

// Cache invalidasyonu - clearMemberCache ile dışarıdan tetiklenebilir.
export const clearMemberCache = (teamId) => {
    if (!teamId) return;
    const key = String(teamId);
    teamMembersCache.delete(key);
    teamMembersRequestCache.delete(key);
};

export const teamsService = {

    // Tüm takımları getirme - kullanıcıya göre filtreleyerek
    getTeams: async (currentUser) => {
        if (!currentUser?.teams?.length) return [];
        await randomDelay(300, 500);

        // Büyük veri setlerinde tek sayfaya sığmayabileceğinden pageSize'ı
        // yüksek tutuyoruz; backend gelince sunucu taraflı filtre eklenecek.
        const response = await api.teams.getAll({ pageSize: 500 });
        const allTeams = extractList(response);

        const userTeamIds = new Set(currentUser.teams.map(id => String(id)));

        return allTeams
            .filter(team =>
                team.isDeleted !== true &&
                userTeamIds.has(String(team.id))
            )
            .map(team => ({
                ...team,
                // Her iki formata karşı defensive
                members: Array.isArray(team.members)
                    ? team.members.length
                    : (team.membersCount ?? 0)
            }));
    },

    // Takım üyelerini getirme
    getTeamMembers: async (teamId) => {
        if (!teamId) return [];
        await randomDelay(200, 400);

        const [teamsResponse, usersResponse] = await Promise.all([
            api.teams.getAll({ pageSize: 500 }),
            api.users.getAll({ pageSize: 1000 })
        ]);

        const allTeams = extractList(teamsResponse);
        const allUsers = extractList(usersResponse);

        const teamData = allTeams.find(t => String(t.id) === String(teamId));
        const teamMembersRaw = Array.isArray(teamData?.members) ? teamData.members : [];

        // Lookup için Map — büyük user listelerinde find() döngüsünden çok daha hızlı
        const userMap = new Map(allUsers.map(u => [String(u.id), u]));

        const normalized = teamMembersRaw.map((tm) => {
            const isDeleted   = Boolean(tm?.isDeleted);
            const fullUserData = userMap.get(String(tm.id));
            const specificTeamRole = fullUserData?.role?.find(
                r => String(r.teamId) === String(teamId)
            );

            return {
                id:          String(tm.id),
                name:        isDeleted ? "DeletedUser" : (tm.name        || fullUserData?.name        || "Unknown"),
                avatar:      isDeleted ? null          : (tm.avatar      || fullUserData?.avatar      || null),
                email:       isDeleted ? ''            : (tm.email       || fullUserData?.email       || ''),
                isDeleted,
                lastLogin:   tm?.lastLogin   ?? fullUserData?.lastLogin   ?? null,
                roleName:    specificTeamRole?.roleName    || tm?.roleName    || "Member",
                permissions: specificTeamRole?.permissions || tm?.permissions || []
            };
        });

        return normalized.sort(
            (a, b) => (ROLE_PRIORITY[a.roleName] ?? 99) - (ROLE_PRIORITY[b.roleName] ?? 99)
        );
    },

    // Kullanıcı loglarını getirme
    getUserLogs: async (userId, teamId) => {
        if (!userId || !teamId) return [];
        await randomDelay(400, 800);

        const logsResponse = await api.logs.getAll({ pageSize: 2000 });
        const rawList = extractList(logsResponse);

        // JSON yapısına göre TeamMemberLogs konteynerini bul
        const teamMemberLogContainer = rawList.find(item => item.TeamMemberLogs);
        const allLogs = teamMemberLogContainer ? teamMemberLogContainer.TeamMemberLogs : [];

        return allLogs
            .filter(log => {
                const logUserId = log?.createdBy?.id ?? log?.userId;
                return (
                    String(logUserId) === String(userId) &&
                    String(log.teamId) === String(teamId)
                );
            })
            .map(log => ({
                ...log,
                details: log.details ?? log.action ?? ''
            }))
            .sort((a, b) =>
                new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)
            );
    },

    // Takım ayarlarını getirme
    getTeamSettings: async (teamId) => {
        if (!teamId) return null;
        await randomDelay(100, 200);

        const [teamsResponse, usersResponse, plansResponse] = await Promise.all([
            api.teams.getAll({ pageSize: 500 }),
            api.users.getAll({ pageSize: 1000 }),
            api.plans.getAll()
        ]);

        const allTeams = extractList(teamsResponse);
        const allUsers = extractList(usersResponse);
        // Plans paginated değil; düz array ya da obje olabilir
        const allPlans = Array.isArray(plansResponse) ? plansResponse : extractList(plansResponse);

        const team = allTeams.find(t => String(t.id) === String(teamId));
        if (!team) return null;

        // 1. Takımın içine gömülü planId'yi alıyoruz
        const teamPlanContext = team.settings?.planContext || {};
        const teamPlanId      = teamPlanContext.planId;

        // 2. Bu ID ile plan.json içinden ilgili planı buluyoruz
        const linkedPlan = allPlans.find(p => String(p.id) === String(teamPlanId));

        // 3. Owner (Kurucu) verisini hala çekiyoruz ama sadece "Upgrade" kontrolü için
        const ownerUser = allUsers.find(u => String(u.id) === String(team.ownerId));

        const baseFeatures = linkedPlan?.feature_keys || [];
        const baseMaxLimit = linkedPlan?.Promise?.TeamMemberLimit
            ? parseInt(linkedPlan.Promise.TeamMemberLimit, 10)
            : (teamPlanContext.maxMembersAllowed || 5);

        const ownerFeatures = ownerUser?.subscription?.feature_keys || [];
        const ownerMaxLimit = ownerUser?.subscription?.maxMembersPerTeam || 0;

        // Set kullanarak duplicate feature key'leri temizle
        const finalFeatures = Array.from(new Set([...baseFeatures, ...ownerFeatures]));
        const finalMaxLimit = Math.max(baseMaxLimit, ownerMaxLimit);

        return {
            ...team,
            adminPlanLimit: finalMaxLimit,
            ownerPlanType:  linkedPlan?.name || teamPlanContext.planName || 'Free',
            availableFeatures: finalFeatures,
            planDetails: linkedPlan || null
        };
    },

    // Rol güncelleme (simülasyon)
    updateUserRole: async (userId, teamId, newRoleName) => {
        await randomDelay(500, 1000);
        console.log(`[API UPDATE] User: ${userId}, Team: ${teamId}, New Role: ${newRoleName}`);
        return { success: true, message: "Role updated successfully" };
    },

    // Takım ayarlarını güncelleme (simülasyon)
    updateTeamSettings: async (teamId, updatePayload) => {
        await randomDelay(600, 1200);
        console.log(`[API UPDATE] Team: ${teamId} için ayarlar güncellendi.`, updatePayload);
        return { success: true, message: "Ayarlar başarıyla güncellendi." };
    },

    // Gerçek API'de DELETE /teams/:id olacak; şimdilik simülasyon.
    deleteTeam: async (teamId) => {
        await randomDelay(800, 1500);
        console.log(`[API DELETE] Team: ${teamId} silme isteği gönderildi.`);
        // Cache'i temizle — silinen takımın verisi önbellekte kalmasın
        clearMemberCache(teamId);
        return { success: true, message: "Takım silme işlemi başlatıldı." };
    },

    // Üye çıkarma simülasyonu; backend gelince api.fetch('TEAMS', ..., { method: 'DELETE' }) olacak.
    removeMember: async (teamId, userId) => {
        await randomDelay(400, 800);
        console.log(`[API DELETE] Team: ${teamId}, User: ${userId} çıkarıldı.`);
        // Cache'i invalidate et — üye listesi güncel kalsın
        clearMemberCache(teamId);
        return { success: true };
    },

    // Basit takım listesini getirme
    getSimpleTeams: async () => {
        await randomDelay(100, 300);
        const response = await api.teams.getAll({ pageSize: 500 });
        const teams = extractList(response);
        return [...teams].sort((a, b) => a.name.localeCompare(b.name));
    }
};