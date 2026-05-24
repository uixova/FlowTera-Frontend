import { api, restFetch } from '../api/api';
import { socketClient } from '../api/socketClient';
import {
    NotificationRequest,
    NotificationInfo,
} from '../types/types';

const extractList = <T>(response: any): T[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    return [];
};

export const notificationService = {

    // ADMIN İÇİN: Talep listesi
    getTeamRequests: async (teamId: string): Promise<NotificationRequest[]> => {
        try {
            const data = await restFetch<{ status: string; data: NotificationRequest[] }>(
                `/requests`, { params: { teamId } }
            );
            return extractList<NotificationRequest>(data);
        } catch { return []; }
    },

    // KULLANICI İÇİN: Bildirim listesi
    getUserNotifications: async (_currentUserId: string): Promise<{ invites: NotificationInfo[]; infos: NotificationInfo[] }> => {
        try {
            const data = await restFetch<{ status: string; data: NotificationInfo[] }>(`/notifications`);
            const list = extractList<NotificationInfo>(data);
            return {
                invites: list.filter(n => n.type === 'invite'),
                infos:   list.filter(n => n.type === 'info'),
            };
        } catch { return { invites: [], infos: [] }; }
    },

    // Bildirim sil
    deleteNotification: async (id: string): Promise<boolean> => {
        try {
            await restFetch(`/notifications/${id}`, { method: 'DELETE' });
            api.notifications.invalidate();
            return true;
        } catch { return false; }
    },

    // Tüm info bildirimlerini sil
    clearAllInfos: async (): Promise<boolean> => {
        try {
            await restFetch(`/notifications/clear-infos`, { method: 'DELETE' });
            api.notifications.invalidate();
            return true;
        } catch { return false; }
    },

    // Talebe cevap ver (admin)
    respondToRequest: async (id: string, action: 'approved' | 'rejected', teamId: string): Promise<boolean> => {
        try {
            await restFetch(`/requests/${id}/respond`, {
                method: 'PATCH',
                body:   { action },
                params: { teamId },
            });
            api.notifications.invalidate();
            return true;
        } catch { return false; }
    },

    // Yeni talep oluştur
    createRequest: async (payload: Partial<NotificationRequest>): Promise<boolean> => {
        try {
            await restFetch(`/requests`, { method: 'POST', body: payload });
            api.notifications.invalidate();
            return true;
        } catch { return false; }
    },

    // Takımdan ayrılma talebi
    sendLeaveRequest: async (teamId: string, userId: string): Promise<boolean> => {
        return notificationService.createRequest({ teamId, userId, type: 'leave' } as any);
    },

    // Gerçek zamanlı request güncellemelerini socketClient üzerinden dinle
    onRequestUpdate: (callback: (payload: any) => void) =>
        socketClient.on('request:update', callback),

    // Gerçek zamanlı bildirim geldiğinde tetiklenir
    onNewNotification: (callback: (payload: any) => void) =>
        socketClient.on('notification:new', callback),
};
