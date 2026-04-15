import { api } from '../api/api';

export const notificationService = {
    // ADMIN İÇİN: Sadece 'requests' array'ine odaklanır
    getTeamRequests: async (teamId) => {
        const data = await api.notifications.getAll();
        if (!data || !data.requests) return [];

        // Backend artık 'requests' altında temiz veri yolluyor
        // Sadece ilgili takıma ait olanları alıyoruz
        return data.requests.filter(req => String(req.teamId) === String(teamId));
    },

    // KULLANICI İÇİN: Sadece 'notifications' array'ine odaklanır
    getUserNotifications: async (currentUserId) => {
        const data = await api.notifications.getAll();
        if (!data || !data.notifications) return { invites: [], infos: [] };

        // Sadece kullanıcıya ait olan bildirimleri filtrele
        const myNotifications = data.notifications.filter(
            item => String(item.userId) === String(currentUserId)
        );

        return {
            invites: myNotifications.filter(item => item.type === 'invite'),
            infos: myNotifications.filter(item => item.type === 'info')
        };
    },

    // Bildirimi silmek için (Backend'e ID gönderiyoruz, o notifications içinden siliyor)
    deleteNotification: async (id) => {
        console.log(`[API DELETE] Notification ID: ${id}`);
        // return await api.delete(`/notifications/${id}`); 
        return true;
    },

    // Takım davetine veya harcama talebine cevap (Requests içindeki veriyi günceller)
    respondToRequest: async (id, action, teamId) => {
        console.log(`[API POST] Request ID: ${id} | Action: ${action} | Team ID: ${teamId}`);
        // return await api.post(`/notifications/${id}/respond`, { action, teamId });
        return true;
    },

    // Takımdan ayrılma isteği (Yeni bir request objesi oluşturur)
    sendLeaveRequest: async (teamId, userId) => {
        console.log(`[API POST] Leave Request Created | User ID: ${userId} | Team ID: ${teamId}`);
        // return await api.post('/notifications/leave-request', { teamId, userId });
        return true;
    }
};