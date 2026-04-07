import { api } from '../api/api';

export const notificationService = {
    getSortedNotifications: async (currentUserId, teamId = null) => {
        const data = await api.notifications.getAll();
        if (!data) return { requests: [], infos: [] };

        const list = data.notifications || (Array.isArray(data) ? data : []); 

        return {
            // Kullanıcıya gelen Takım Davetleri (Invite)
            invites: list.filter(item => item.type === 'invite' && String(item.userId) === String(currentUserId)),
            
            // Adminin yönettiği takıma gelen Talepler (Request) - Harcama onayı vb.
            requests: list.filter(item => 
                item.type === 'request' && 
                (teamId ? String(item.teamId) === String(teamId) : true)
            ),
            
            // Bilgilendirme mesajları
            infos: list.filter(item => item.type === 'info' && String(item.userId) === String(currentUserId)),
            
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