import { api } from '../api/api';

export const notificationService = {
    // Tüm bildirimleri getir ve tipine göre ayır
    getSortedNotifications: async () => {
        const data = await api.notifications.getAll();
        if (!data) return { requests: [], infos: [] };

        // notificationData.notifications yapısına göre güvenli erişim
        const list = data.notifications || data; 

        return {
            requests: list.filter(item => item.type === 'request'),
            infos: list.filter(item => item.type === 'info'),
            total: list.length
        };
    },

    // İleride silme işlemini backend'e bağladığında burayı güncellersin
    deleteNotification: async (id) => {
        console.log(`${id} nolu bildirim siliniyor...`);
        // return await api.delete(`/notifications/${id}`); 
        return true;
    }
};