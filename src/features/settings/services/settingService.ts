import { restFetch } from '../../../api/api';
import type {
    SettingsUserResult,
    SettingsNotifications,
    SettingsUserLog,
    GetCurrentUserResult,
    GetUserNotificationsResult,
    GetUserLogsResult,
    UpdateProfilePayload,
    UpdatePasswordPayload,
} from './setting.types';

export const settingsService = {

    getCurrentUser: async (userId: string): Promise<GetCurrentUserResult> => {
        if (!userId) return null;
        try {
            const result = await restFetch<{ status: string; data: any }>(`/users/${userId}`);
            return (result as any).data as SettingsUserResult ?? null;
        } catch { return null; }
    },

    getUserNotifications: async (userId: string): Promise<GetUserNotificationsResult> => {
        if (!userId) return null;
        try {
            const result = await restFetch<{ status: string; data: any }>(`/users/${userId}`);
            const user   = (result as any).data;
            return (
                user?.settings?.notifications ??
                ({ email: false, sms: false, push: false } satisfies SettingsNotifications)
            );
        } catch { return null; }
    },

    // Returns TeamLogs for the given team mapped so Activity.jsx works (timestamp = createdAt)
    getUserLogs: async (userId: string, teamId?: string): Promise<GetUserLogsResult> => {
        if (!userId || !teamId) return [];
        try {
            const result = await restFetch<{ status: string; data: any[] }>(
                `/logs`, { params: { teamId, pageSize: 50 } }
            );
            const raw       = (result as any);
            const container = Array.isArray(raw?.data) ? raw.data[0] : raw;
            const teamLogs: any[] = container?.TeamLogs ?? [];

            return teamLogs.map(log => ({
                ...log,
                timestamp: log.createdAt ?? log.timestamp,
            })) as SettingsUserLog[];
        } catch { return []; }
    },

    updateProfile: async (userId: string, payload: UpdateProfilePayload): Promise<{ success: boolean; data?: any }> => {
        try {
            const result = await restFetch<{ status: string; data: any }>(
                `/users/${userId}`, { method: 'PUT', body: payload }
            );
            return { success: true, data: (result as any).data };
        } catch { return { success: false }; }
    },

    updatePassword: async (userId: string, payload: UpdatePasswordPayload): Promise<{ success: boolean; message?: string }> => {
        try {
            await restFetch(`/users/${userId}/password`, { method: 'PATCH', body: payload });
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err?.message || 'Şifre değiştirilemedi.' };
        }
    },

    // Saves notification preferences: PATCH /users/:id/settings  { notifications: {...} }
    updateNotifications: async (userId: string, notifications: SettingsNotifications): Promise<{ success: boolean }> => {
        try {
            await restFetch(`/users/${userId}/settings`, {
                method: 'PATCH',
                body:   { notifications },
            });
            return { success: true };
        } catch { return { success: false }; }
    },

    uploadAvatar: async (userId: string, file: File): Promise<{ success: boolean; url?: string }> => {
        try {
            const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
            // Step 1: get presigned URL
            const presignRes = await fetch(`/api/v1/uploads/presigned-avatar?ext=${ext}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!presignRes.ok) throw new Error('Presigned URL alınamadı.');
            const { data } = await presignRes.json();
            // Step 2: upload directly to S3
            const uploadRes = await fetch(data.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            });
            if (!uploadRes.ok) throw new Error('S3 yükleme başarısız.');
            // Step 3: save URL to user profile
            await restFetch(`/users/${userId}`, { method: 'PUT', body: { avatar: data.fileUrl } });
            return { success: true, url: data.fileUrl };
        } catch (err: any) {
            console.error('[uploadAvatar]', err);
            return { success: false };
        }
    },

    deleteAccount: async (userId: string): Promise<{ success: boolean; message?: string }> => {
        try {
            await restFetch(`/users/${userId}`, { method: 'DELETE' });
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err?.message || 'Hesap silinemedi.' };
        }
    },
};
