import { api } from '../../../api/api';

export const settingsService = {
    // Aktif kullanıcıyı getir
    getCurrentUser: async (userId = "u2") => {
        const users = await api.users.getAll();
        if (!users) return null;
        return users.find(user => user.id === userId) || null;
    },

    // Bildirim ayarlarını getir
    getUserNotifications: async (userId = "u2") => {
        const users = await api.users.getAll();
        if (!users) return null;
        const user = users.find(u => u.id === userId);
        
        if (!user) return null;
        // Kullanıcının settings içinde notifications objesi varsa onu döndür, yoksa genel notifications objesini döndür
        return user.settings?.notifications || user.notifications || { email: false, sms: false, push: false };
    },

    // Kullanıcıya özel logları getir
    getUserLogs: async (userId = "u2") => {
        const logsData = await api.logs.getAll(); 
        if (!logsData || !logsData[0]?.UserLogs) {
            console.error("Log verisi okunamadı.");
            return [];
        }
        return logsData[0].UserLogs.filter(log => {
            const ownerId = log?.createdBy?.id ?? log?.userId ?? null;
            return String(ownerId) === String(userId);
        });
    }
};