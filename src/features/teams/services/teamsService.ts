import { api, restFetch } from '../../../api/api';
import { Team, Plan, TeamMemberLog } from '@/types/types';

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

export const teamMembersCache = new Map<string, NormalizedMember[]>();
export const teamMembersRequestCache = new Map<string, any>();

const ROLE_PRIORITY: Record<string, number> = { Admin: 1, Moderator: 2, Member: 3 };

const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const clearMemberCache = (teamId: string | number): void => {
    if (!teamId) return;
    const key = String(teamId);
    teamMembersCache.delete(key);
    teamMembersRequestCache.delete(key);
};

export const teamsService = {

    // Kullanıcının takımlarını getir — backend JWT'den filtreler
    async getTeams(): Promise<EnrichedTeam[]> {
        const response = await api.teams.getAll({ pageSize: 500 });
        const allTeams = extractList<Team>(response);

        return allTeams
            .filter(team => team.isDeleted !== true)
            .map(team => ({
                ...team,
                members: Array.isArray(team.members)
                    ? team.members.length
                    : ((team as any).membersCount ?? 0),
            }));
    },

    // Takım üyelerini getir
    async getTeamMembers(teamId: string | number): Promise<NormalizedMember[]> {
        if (!teamId) return [];

        const data    = await restFetch<{ status: string; data: any[] }>(`/teams/${teamId}/members`);
        const members = extractList<any>(data);

        return members
            .map((m: any) => ({
                id:          String(m.id),
                name:        m.isDeleted ? 'DeletedUser' : (m.name   || 'Unknown'),
                avatar:      m.isDeleted ? null          : (m.avatar || null),
                email:       m.isDeleted ? ''            : (m.email  || ''),
                isDeleted:   Boolean(m.isDeleted),
                lastLogin:   m.lastLogin ?? null,
                roleName:    m.roleName    || 'Member',
                permissions: m.permissions || [],
            }))
            .sort((a: NormalizedMember, b: NormalizedMember) =>
                (ROLE_PRIORITY[a.roleName] ?? 99) - (ROLE_PRIORITY[b.roleName] ?? 99)
            );
    },

    // Takıma ait logları getir, kullanıcıya göre filtrele
    async getUserLogs(userId: string | number, teamId: string | number): Promise<TeamMemberLog[]> {
        if (!userId || !teamId) return [];

        const data = await restFetch<{ status: string; data: any[] }>(
            `/logs`,
            { params: { teamId: String(teamId) } }
        );
        const logs = extractList<any>(data);

        return logs
            .filter((log: any) => {
                const logUserId = log?.createdBy?.id ?? log?.userId;
                return String(logUserId) === String(userId);
            })
            .map((log: any) => ({ ...log, details: log.details ?? log.action ?? '' }))
            .sort((a: any, b: any) => {
                const ts = (log: any) => {
                    const raw = log.createdAt ?? log.timestamp ?? (log.date ? `${log.date}${log.time ? ' ' + log.time : ''}` : null);
                    return raw ? new Date(raw).getTime() : 0;
                };
                return ts(b) - ts(a);
            });
    },

    // Takım ayarlarını getir (plan bilgisiyle zenginleştirilmiş)
    async getTeamSettings(teamId: string | number): Promise<TeamSettingsResult | null> {
        if (!teamId) return null;

        const [teamsResponse, plansResponse] = await Promise.all([
            api.teams.getAll({ pageSize: 500 }, { forceRefresh: true }),
            api.plans.getAll(),
        ]);

        const allTeams = extractList<Team>(teamsResponse);
        const allPlans = extractList<Plan>(plansResponse);

        const team = allTeams.find(t => String(t.id) === String(teamId));
        if (!team) return null;

        const teamPlanContext = team.settings?.planContext || {};
        const linkedPlan      = allPlans.find(p => String(p.id) === String(teamPlanContext.planId));

        const maxLimit = linkedPlan?.Promise
            ? parseInt((linkedPlan.Promise as any).TeamMemberLimit || '5', 10)
            : (teamPlanContext.maxMembersAllowed || 5);
        const features = linkedPlan?.feature_keys || [];

        return {
            ...team,
            adminPlanLimit:    maxLimit,
            ownerPlanType:     linkedPlan?.name || teamPlanContext.planName || 'Free',
            availableFeatures: features,
            planDetails:       linkedPlan || null,
        };
    },

    // Rol güncelle
    async updateUserRole(userId: string | number, teamId: string | number, payload: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
        try {
            await restFetch(`/teams/${teamId}/members/${userId}`, { method: 'PUT', body: payload });
            clearMemberCache(teamId);
            return { success: true, message: 'Rol güncellendi.' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Rol güncellenemedi.' };
        }
    },

    // Takım ayarlarını güncelle
    async uploadTeamImage(teamId: string | number, file: File): Promise<{ success: boolean; url?: string }> {
        try {
            const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
            const presignRes = await fetch(`/api/v1/uploads/presigned-team-image?ext=${ext}&teamId=${teamId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!presignRes.ok) throw new Error('Presigned URL alınamadı.');
            const { data } = await presignRes.json();
            const uploadRes = await fetch(data.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            });
            if (!uploadRes.ok) throw new Error('S3 yükleme başarısız.');
            // Save image URL to team
            await restFetch(`/teams/${teamId}`, { method: 'PATCH', body: { image: data.fileUrl } });
            api.cache.invalidate('TEAMS');
            return { success: true, url: data.fileUrl };
        } catch (err: any) {
            console.error('[uploadTeamImage]', err);
            return { success: false };
        }
    },

    async updateTeamSettings(teamId: string | number, updatePayload: Partial<Team['settings']>): Promise<{ success: boolean; message: string }> {
        try {
            // imageFile is a File object — strip it, handle separately
            const { imageFile, ...rest } = updatePayload as any;
            await restFetch(`/teams/${teamId}/settings`, { method: 'PATCH', body: rest });
            api.cache.invalidate('TEAMS');
            return { success: true, message: 'Ayarlar güncellendi.' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Ayarlar güncellenemedi.' };
        }
    },

    // Takım sil
    async deleteTeam(teamId: string | number): Promise<{ success: boolean; message: string }> {
        try {
            await restFetch(`/teams/${teamId}`, { method: 'DELETE' });
            clearMemberCache(teamId);
            api.cache.invalidate('TEAMS');
            return { success: true, message: 'Takım silindi.' };
        } catch (err: any) {
            return { success: false, message: err.message || 'Takım silinemedi.' };
        }
    },

    // Üye çıkar
    async removeMember(teamId: string | number, userId: string | number): Promise<{ success: boolean }> {
        try {
            await restFetch(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
            clearMemberCache(teamId);
            api.cache.invalidate('TEAMS');
            return { success: true };
        } catch {
            return { success: false };
        }
    },

    // Yeni takım oluştur
    async createTeam(payload: Record<string, unknown>): Promise<{ success: boolean; team?: Team; message?: string }> {
        try {
            const result = await restFetch<{ status: string; data: Team }>('/teams', {
                method: 'POST',
                body:   payload,
            });
            api.cache.invalidate('TEAMS');
            return { success: true, team: (result as any).data ?? (result as any) };
        } catch (err: any) {
            return { success: false, message: err.message || 'Takım oluşturulamadı.' };
        }
    },

    // Üye davet et
    async inviteMember(teamId: string | number, identifier: string, role: string, restrictions: string[]): Promise<{ success: boolean; message?: string }> {
        try {
            await restFetch(`/teams/${teamId}/members`, {
                method: 'POST',
                body:   { identifier, role, restrictions },
            });
            clearMemberCache(teamId);
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message || 'Üye davet edilemedi.' };
        }
    },

    // Sıralanmış takım listesi
    async getSimpleTeams(): Promise<Team[]> {
        const response = await api.teams.getAll({ pageSize: 500 });
        const teams    = extractList<Team>(response);
        return [...teams].sort((a, b) => a.name.localeCompare(b.name));
    },
};
