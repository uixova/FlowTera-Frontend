import { api } from '../api/api';

export const notificationService = {
    // ADMIN İÇİN: Takıma gelen harcama/seyahat talepleri
    getTeamRequests: async (teamId) => {
        const data = await api.notifications.getAll();
        if (!data) return [];
        const list = data.notifications || (Array.isArray(data) ? data : []);

        // Sadece 'request' tipinde ve bu takıma ait olanları tekilleştirerek getir
        return Array.from(
            new Map(
                list
                    .filter(item => item.type === 'request' && String(item.teamId) === String(teamId))
                    .map(item => [item.id, item])
            ).values()
        );
    },

    // KULLANICI İÇİN: Şahsi davetler ve bilgilendirmeler
    getUserNotifications: async (currentUserId) => {
        const data = await api.notifications.getAll();
        if (!data) return { invites: [], infos: [] };
        const list = data.notifications || (Array.isArray(data) ? data : []);

        // Kullanıcıya ait bildirimleri ID'ye göre tekilleştir
        const uniqueList = Array.from(
            new Map(list.map(item => [item.id, item])).values()
        );

        // Şahsi bildirimleri ayıkla
        const myData = uniqueList.filter(item => String(item.userId) === String(currentUserId));

        return {
            invites: myData.filter(item => item.type === 'invite'),
            infos: myData.filter(item => item.type === 'info')
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
        console.log(`${id} nolu bildirim üzerinden ${teamId} takımına işlem: ${action}`);
        // return await api.post(`/notifications/${id}/respond`, { action, teamId });
        return true;
    }
};