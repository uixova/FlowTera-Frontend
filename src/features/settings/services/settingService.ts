import { restFetch } from '../../../api/api';
import type {
    SettingsUserResult,
    SettingsNotifications,
    SettingsUserLog,
    GetCurrentUserResult,
    GetUserNotificationsResult,
    GetUserLogsResult,
} from './setting.types';

export const settingsService = {

    // Aktif kullanıcıyı direkt endpoint'ten getir
    getCurrentUser: async (userId: string): Promise<GetCurrentUserResult> => {
        if (!userId) return null;
        try {
            const result = await restFetch<{ status: string; data: any }>(`/users/${userId}`);
            return (result as any).data as SettingsUserResult ?? null;
        } catch { return null; }
    },

    // Kullanıcı bildirim ayarlarını getir
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

    // Kullanıcıya ait logları getir (tüm takımlardan)
    getUserLogs: async (userId: string, teamId?: string): Promise<GetUserLogsResult> => {
        if (!userId) return [];
        if (!teamId) return [];
        try {
            const result = await restFetch<{ status: string; data: any[] }>(
                `/logs`, { params: { teamId } }
            );
            const logs = Array.isArray((result as any).data) ? (result as any).data : [];
            return logs.filter((log: any) => {
                const ownerId = log?.createdBy?.id ?? log?.userId;
                return String(ownerId) === String(userId);
            }) as SettingsUserLog[];
        } catch { return []; }
    },
};
