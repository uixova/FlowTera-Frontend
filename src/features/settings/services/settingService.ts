import { api } from '../../../api/api';
import type { PaginatedResponse, User, LogData } from '../../../types/types';
import type {
    SettingsUserResult,
    SettingsNotifications,
    SettingsUserLog,
    GetCurrentUserResult,
    GetUserNotificationsResult,
    GetUserLogsResult,
} from './setting.types';

// Paginated veya düz array'den veriyi güvenle çıkar
// api.ts'in PaginatedResponse<T> yapısına karşı defensive — her iki formata da hazır
const extractList = <T>(response: PaginatedResponse<T> | T[] | null | undefined): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray((response as PaginatedResponse<T>).data)) {
        return (response as PaginatedResponse<T>).data;
    }
    return [];
};

// User to SettingsUserResult dönüşümü
// api.types User ile setting.types SettingsUserResult arasında shape uyumlu
// cast yerine explicit map yapıyoruz — gelecekteki tip kaymasına karşı güvenli
const mapToSettingsUser = (user: User): SettingsUserResult => ({
    id:           user.id,
    name:         user.name,
    username:     user.username,
    email:        user.email,
    avatar:       user.avatar,
    phone:        user.phone,
    address:      user.address,
    age:          user.age,
    joinedDate:   user.joinedDate,
    lastLogin:    user.lastLogin,
    status:       user.status,
    isDeleted:    user.isDeleted,
    subscription: user.subscription,
    role:         user.role,
    settings:     user.settings,
    teams:        user.teams,
});

export const settingsService = {

    // Aktif kullanıcıyı getir
    getCurrentUser: async (userId: string): Promise<GetCurrentUserResult> => {
        if (!userId) return null;

        const response = await api.users.getAll({ pageSize: 1000 });
        const users    = extractList(response);
        const found    = users.find(u => String(u.id) === String(userId));

        return found ? mapToSettingsUser(found) : null;
    },

    // Bildirim ayarlarını getir
    getUserNotifications: async (userId: string): Promise<GetUserNotificationsResult> => {
        if (!userId) return null;

        const response = await api.users.getAll({ pageSize: 1000 });
        const users    = extractList(response);
        const user     = users.find(u => String(u.id) === String(userId));

        if (!user) return null;

        // settings.notifications öncelikli — kullanıcı ayarlarında yoksa default döner
        return (
            user.settings?.notifications ??
            ({ email: false, sms: false, push: false } satisfies SettingsNotifications)
        );
    },

    // Kullanıcıya özel logları getir
    getUserLogs: async (userId: string): Promise<GetUserLogsResult> => {
        if (!userId) return [];

        // api.ts'te logs.getAll PaginatedResponse<LogData> dönüyor
        // LogData içinde UserLogs dizisi konteyner objesi olarak gelebiliyor
        const response = await api.logs.getAll({ pageSize: 2000 });
        const rawList  = extractList<LogData>(response);

        const userLogContainer = rawList.find(item => item.UserLogs);
        if (!userLogContainer?.UserLogs) {
            console.error('[settingsService] Log verisi okunamadı.');
            return [];
        }

        return userLogContainer.UserLogs.filter(log => {
            // UserLog'da createdBy yoksa userId alanına düşüyoruz
            const ownerId = (log as SettingsUserLog & { createdBy?: { id: string } })
                ?.createdBy?.id ?? log?.userId ?? null;
            return String(ownerId) === String(userId);
        }) as SettingsUserLog[];
    },
};