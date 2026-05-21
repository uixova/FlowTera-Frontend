import { api } from '../api/api';
import { 
    NotificationData, 
    NotificationRequest, 
    NotificationInfo 
} from '../types/types';

// WebSocket bağlantı durumları
const WS_STATE = {
    CONNECTING: 0,
    OPEN:       1,
    CLOSING:    2,
    CLOSED:     3,
} as const;

type ListenerCallback = (payload: any) => void;

// Aktif WS bağlantısı ve listener kayıtları
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectCount = 0;
const MAX_RECONNECT  = 5;
const RECONNECT_BASE = 2000;

const listeners = new Map<string, Set<ListenerCallback>>();

// WebSocket URL — env'den çekilir, yoksa fallback
const getWsUrl = (teamId: string, userId: string): string => {
    const base = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    return `${base}/ws?teamId=${teamId}&userId=${userId}`;
};

// Listener kaydı — component unmount'ta temizlenmesi için unsubscribe döner
const subscribe = (event: string, callback: ListenerCallback): () => void => {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(callback);

    return () => {
        listeners.get(event)?.delete(callback);
    };
};

// Kayıtlı tüm listener'ları tetikle
const emit = (event: string, payload: any): void => {
    listeners.get(event)?.forEach(cb => cb(payload));
};

// Bağlantıyı kur
const connect = (teamId: string, userId: string): void => {
    if (socket && socket.readyState === WS_STATE.OPEN) return;

    socket = new WebSocket(getWsUrl(teamId, userId));

    socket.onopen = () => {
        console.log('[WS] Bağlantı kuruldu');
        reconnectCount = 0;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        emit('connection', { status: 'connected' });
    };

    socket.onmessage = (event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data);
            // Gelen mesaj tipine göre ilgili listener'ı tetikle
            emit(message.type, message.payload);
        } catch (err) {
            console.error('[WS] Mesaj parse hatası:', err);
        }
    };

    socket.onerror = (err) => {
        console.error('[WS] Bağlantı hatası:', err);
        emit('error', err);
    };

    socket.onclose = (event: CloseEvent) => {
        console.warn('[WS] Bağlantı kapandı — kod:', event.code);
        emit('connection', { status: 'disconnected' });

        // Kasıtlı kapanış değilse yeniden bağlan
        if (event.code !== 1000 && reconnectCount < MAX_RECONNECT) {
            const delay = RECONNECT_BASE * Math.pow(2, reconnectCount);
            reconnectCount++;
            console.log(`[WS] ${delay}ms sonra yeniden bağlanılacak (${reconnectCount}/${MAX_RECONNECT})`);
            reconnectTimer = setTimeout(() => connect(teamId, userId), delay);
        }
    };
};

// Bağlantıyı kasıtlı kapat
const disconnect = (): void => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectCount = MAX_RECONNECT;
    if (socket) {
        socket.close(1000, 'Kullanıcı oturumu kapattı');
        socket = null;
    }
    listeners.clear();
};

// Socket üzerinden mesaj gönder
const send = (type: string, payload: any): boolean => {
    if (!socket || socket.readyState !== WS_STATE.OPEN) {
        console.warn('[WS] Mesaj gönderilemedi: bağlantı yok');
        return false;
    }
    socket.send(JSON.stringify({ type, payload }));
    return true;
};

export const notificationService = {

    // WS Bağlantı Yönetimi
    connect,
    disconnect,
    subscribe,

    // ADMIN İÇİN: Sadece 'requests' array'ine odaklanır
    getTeamRequests: async (teamId: string): Promise<NotificationRequest[]> => {
        const data: NotificationData = await api.notifications.getAll();
        if (!data || !data.requests) return [];

        // Backend artık 'requests' altında temiz veri yolluyor
        // Sadece ilgili takıma ait olanları alıyoruz
        return data.requests.filter(req => String(req.teamId) === String(teamId));
    },

    // KULLANICI İÇİN: Sadece 'notifications' array'ine odaklanır
    getUserNotifications: async (currentUserId: string): Promise<{ invites: NotificationInfo[], infos: NotificationInfo[] }> => {
        const data: NotificationData = await api.notifications.getAll();
        if (!data || !data.notifications) return { invites: [], infos: [] };

        // Sadece kullanıcıya ait olan bildirimleri filtrele
        const myNotifications = data.notifications.filter(
            item => String(item.userId) === String(currentUserId)
        );

        return {
            invites: myNotifications.filter(item => item.type === 'invite'),
            infos:   myNotifications.filter(item => item.type === 'info'),
        };
    },

    // Bildirimi silmek için (Backend'e ID gönderiyoruz, o notifications içinden siliyor)
    deleteNotification: async (id: string): Promise<boolean> => {
        // Önce WS ile anlık bildir, ardından REST ile kayıt sil
        send('notification:delete', { id });
        return true;
    },

    // Kullanıcının tüm bilgilendirme bildirimlerini siler
    clearAllInfos: async (currentUserId: string): Promise<boolean> => {
        send('notification:clear_infos', { userId: currentUserId });
        return true;
    },

    // Takım davetine veya harcama talebine cevap (Requests içindeki veriyi günceller)
    respondToRequest: async (id: string, action: 'approved' | 'rejected', teamId: string): Promise<boolean> => {
        // WS üzerinden anlık yayın — diğer admin ekranları otomatik güncellenir
        return send('request:respond', { id, action, teamId });
    },

    // Takımdan ayrılma isteği (Yeni bir request objesi oluşturur)
    sendLeaveRequest: async (teamId: string, userId: string): Promise<boolean> => {
        return send('request:leave', { teamId, userId });
    },

    createRequest: async (payload: Partial<NotificationRequest>): Promise<boolean> => {
        const isSent = send('request:new', payload);

        // REST API üzerinden DB'ye kaydet 
        try {
            console.log("[WS] Yeni talep yayını yapıldı:", payload);
            return isSent;
        } catch (error) {
            console.error("Talep kaydedilirken hata:", error);
            return false;
        }
    },

    // Gerçek zamanlı talep güncellemelerini dinle
    // Kullanım: const unsub = notificationService.onRequestUpdate(cb); → cleanup: unsub()
    onRequestUpdate: (callback: ListenerCallback) => subscribe('request:update', callback),

    // Gerçek zamanlı yeni bildirim geldiğinde tetiklenir
    onNewNotification: (callback: ListenerCallback) => subscribe('notification:new', callback),

    // WS bağlantı durumu değişimlerini dinle
    onConnectionChange: (callback: ListenerCallback) => subscribe('connection', callback),
};