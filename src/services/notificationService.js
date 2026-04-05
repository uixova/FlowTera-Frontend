import { api } from '../api/api';

export const notificationService = {
    getSortedNotifications: async (currentUserId) => {
        const data = await api.notifications.getAll();
        if (!data) return { requests: [], infos: [] };

        const list = data.notifications || data; 

        return {
            // Tipi 'invite' olan ve bu kullanıcıya (userId) gelmiş davetler
            requests: list.filter(item => item.type === 'invite' && item.userId === currentUserId),
            
            // Tipi 'info' olan ve sadece giriş yapan kullanıcıya ait bildirimler
            infos: list.filter(item => item.type === 'info' && item.userId === currentUserId),
            
            total: list.length
        };
    },

    // Bildirimi silmek için
    deleteNotification: async (id) => {
        console.log(`${id} nolu bildirim siliniyor...`);
        // return await api.delete(`/notifications/${id}`); 
        return true;
    },

    // Takım davetine cevap vermek için (Onay/Red)
    respondToRequest: async (id, action, teamId) => {
        // teamId burada aksiyon sonrası kullanıcıyı takıma eklemek için kullanılacak
        console.log(`${id} nolu bildirim üzerinden ${teamId} takımına işlem: ${action}`);
        // return await api.post(`/notifications/${id}/respond`, { action, teamId });
        return true;
    }
};