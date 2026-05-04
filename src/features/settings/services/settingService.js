import { api } from '../../../api/api';

// Paginated veya düz array'den veriyi güvenle çıkar
const extractList = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const settingsService = {

    // Aktif kullanıcıyı getir 
    getCurrentUser: async (userId) => {
        if (!userId) return null;
        const response = await api.users.getAll({ pageSize: 1000 });
        const users = extractList(response);
        return users.find(user => String(user.id) === String(userId)) ?? null;
    },

    // Bildirim ayarlarını getir 
    getUserNotifications: async (userId) => {
        if (!userId) return null;
        const response = await api.users.getAll({ pageSize: 1000 });
        const users = extractList(response);
        const user = users.find(u => String(u.id) === String(userId));
        if (!user) return null;
        return user.settings?.notifications
            || user.notifications
            || { email: false, sms: false, push: false };
    },

    // Kullanıcıya özel logları getir
    getUserLogs: async (userId) => {
        if (!userId) return [];
        const response = await api.logs.getAll({ pageSize: 2000 });
        const rawList = extractList(response);

        const userLogContainer = rawList.find(item => item.UserLogs);
        if (!userLogContainer) {
            console.error("Log verisi okunamadı.");
            return [];
        }

        return userLogContainer.UserLogs.filter(log => {
            const ownerId = log?.createdBy?.id ?? log?.userId ?? null;
            return String(ownerId) === String(userId);
        });
    }
};