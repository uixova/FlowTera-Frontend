import { api } from '../api/api';

export const notificationService = {
    // Verileri ID bazlı çekiyoruz 
    getSortedNotifications: async (currentUserId) => {
        const data = await api.notifications.getAll();
        if (!data) return { requests: [], infos: [] };

        const list = data.notifications || data; 

        return {
            // İstekler takıma özel 
            requests: list.filter(item => item.type === 'request'),
            
            // Bildirimler sadece giriş yapmış kullanıcıya özel 
            infos: list.filter(item => item.type === 'info' && item.userId === currentUserId),
            
            total: list.length
        };
    },

    deleteNotification: async (id) => {
        console.log(`${id} nolu bildirim siliniyor...`);
        // return await api.delete(`/notifications/${id}`); 
        return true;
    }
};