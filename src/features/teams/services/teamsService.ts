import { api } from '../../../api/api';
import { User, Team, Plan, TeamMemberLog, LogData } from '@/types/types';

export interface EnrichedTeam extends Omit<Team, 'members'> {
    members: number;
}

export interface NormalizedMember {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
    isDeleted: boolean;
    lastLogin?: string | null;
    roleName: string;
    permissions: string[];
}

export interface TeamSettingsResult extends Team {
    adminPlanLimit: number;
    ownerPlanType: string;
    availableFeatures: string[];
    planDetails: Plan | null;
}

// Dışarıdan import edilen cache'ler için tip tanımlamaları
export const teamMembersCache = new Map<string, NormalizedMember[]>();
export const teamMembersRequestCache = new Map<string, any>();

// Rol öncelik haritası için tip güvenliği
const ROLE_PRIORITY: Record<string, number> = { "Admin": 1, "Moderator": 2, "Member": 3 };

// Paginated veya düz array'den veriyi güvenle çıkar
const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

// Cache invalidasyonu - clearMemberCache ile dışarıdan tetiklenebilir.
export const clearMemberCache = (teamId: string | number): void => {
    if (!teamId) return;
    const key = String(teamId);
    teamMembersCache.delete(key);
    teamMembersRequestCache.delete(key);
};

export const teamsService = {

    // Tüm takımları getirme - kullanıcıya göre filtreleyerek
    async getTeams(currentUser: User): Promise<EnrichedTeam[]> {
        if (!currentUser?.teams?.length) return [];

        // Büyük veri setlerinde tek sayfaya sığmayabileceğinden pageSize'ı
        // yüksek tutuyoruz; backend gelince sunucu taraflı filtre eklenecek.
        const response = await api.teams.getAll({ pageSize: 500 });
        const allTeams = extractList<Team>(response);

        const userTeamIds = new Set(currentUser.teams.map((id) => String(id)));

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
                    : ((team as any).membersCount ?? 0)
            }));
    },

    // Takım üyelerini getirme
    async getTeamMembers(teamId: string | number): Promise<NormalizedMember[]> {
        if (!teamId) return [];

        const [teamsResponse, usersResponse] = await Promise.all([
            api.teams.getAll({ pageSize: 500 }),
            api.users.getAll({ pageSize: 1000 })
        ]);

        const allTeams = extractList<Team>(teamsResponse);
        const allUsers = extractList<User>(usersResponse);

        const teamData = allTeams.find(t => String(t.id) === String(teamId));
        const teamMembersRaw = Array.isArray(teamData?.members) ? teamData.members : [];

        // Lookup için Map — büyük user listelerinde find() döngüsünden çok daha hızlı
        const userMap = new Map<string, User>(allUsers.map(u => [String(u.id), u]));

        const normalized: NormalizedMember[] = teamMembersRaw.map((tm: any) => {
            const isDeleted   = Boolean(tm?.isDeleted);
            const fullUserData = userMap.get(String(tm.id));
            const specificTeamRole = fullUserData?.role?.find(
                (r) => String(r.teamId) === String(teamId)
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
    async getUserLogs(userId: string | number, teamId: string | number): Promise<TeamMemberLog[]> {
        if (!userId || !teamId) return [];

        const logsResponse = await api.logs.getAll({ pageSize: 2000 });
        const rawList = extractList<LogData>(logsResponse);

        // JSON yapısına göre TeamMemberLogs konteynerini bul
        const teamMemberLogContainer = rawList.find(item => item.TeamMemberLogs);
        const allLogs = teamMemberLogContainer?.TeamMemberLogs ?? [];

        return allLogs
            .filter((log) => {
                const logUserId = log?.createdBy?.id ?? (log as any).userId;
                return (
                    String(logUserId) === String(userId) &&
                    String(log.teamId) === String(teamId)
                );
            })
            .map((log) => ({
                ...log,
                details: log.details ?? (log as any).action ?? ''
            }))
            .sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time}`).getTime();
                const dateB = new Date(`${b.date} ${b.time}`).getTime();
                return dateB - dateA;
            });
    },

    // Takım ayarlarını getirme
    async getTeamSettings(teamId: string | number): Promise<TeamSettingsResult | null> {
        if (!teamId) return null;

        const [teamsResponse, usersResponse, plansResponse] = await Promise.all([
            api.teams.getAll({ pageSize: 500 }),
            api.users.getAll({ pageSize: 1000 }),
            api.plans.getAll()
        ]);

        const allTeams = extractList<Team>(teamsResponse);
        const allUsers = extractList<User>(usersResponse);
        // Plans paginated değil; düz array ya da obje olabilir
        const allPlans = Array.isArray(plansResponse) ? plansResponse : extractList<Plan>(plansResponse);

        const team = allTeams.find(t => String(t.id) === String(teamId));
        if (!team) return null;

        // 1. Takımın içine gömülü planId'yi alıyoruz
        const teamPlanContext = team.settings?.planContext || {};
        const teamPlanId      = teamPlanContext.planId;

        // 2. Bu ID ile plan.json içinden ilgili planı buluyoruz
        const linkedPlan = allPlans.find(p => String(p.id) === String(teamPlanId));

        // 3. Owner (Kurucu) verisini hala çekiyoruz ama sadece "Upgrade" kontrolü için
        const ownerUser = allUsers.find(u => String(u.id) === String(team.ownerId));

        const baseFeatures: string[] = linkedPlan?.feature_keys || [];
        const baseMaxLimit = linkedPlan?.Promise?.TeamMemberLimit
            ? parseInt(linkedPlan.Promise.TeamMemberLimit, 10)
            : (teamPlanContext.maxMembersAllowed || 5);

        const ownerFeatures: string[] = ownerUser?.subscription?.feature_keys || [];
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
    async updateUserRole(userId: string | number, teamId: string | number, newRoleName: string): Promise<{ success: boolean; message: string }> {
        console.log(`[API UPDATE] User: ${userId}, Team: ${teamId}, New Role: ${newRoleName}`);
        return { success: true, message: "Role updated successfully" };
    },

    // Takım ayarlarını güncelleme (simülasyon)
    async updateTeamSettings(teamId: string | number, updatePayload: Partial<Team['settings']>): Promise<{ success: boolean; message: string }> {
        console.log(`[API UPDATE] Team: ${teamId} için ayarlar güncellendi.`, updatePayload);
        return { success: true, message: "Ayarlar başarıyla güncellendi." };
    },

    // Gerçek API'de DELETE /teams/:id olacak; şimdilik simülasyon.
    async deleteTeam(teamId: string | number): Promise<{ success: boolean; message: string }> {
        console.log(`[API DELETE] Team: ${teamId} silme isteği gönderildi.`);
        // Cache'i temizle — silinen takımın verisi önbellekte kalmasın
        clearMemberCache(teamId);
        return { success: true, message: "Takım silme işlemi başlatıldı." };
    },

    // Üye çıkarma simülasyonu; backend gelince api.fetch('TEAMS', ..., { method: 'DELETE' }) olacak.
    async removeMember(teamId: string | number, userId: string | number): Promise<{ success: boolean }> {
        console.log(`[API DELETE] Team: ${teamId}, User: ${userId} çıkarıldı.`);
        // Cache'i invalidate et — üye listesi güncel kalsın
        clearMemberCache(teamId);
        return { success: true };
    },

    // Basit takım listesini getirme
    async getSimpleTeams(): Promise<Team[]> {
        const response = await api.teams.getAll({ pageSize: 500 });
        const teams = extractList<Team>(response);
        return [...teams].sort((a, b) => a.name.localeCompare(b.name));
    }
};