import { api } from '../api/api';

// WebSocket bağlantı durumları
const WS_STATE = {
    CONNECTING: 0,
    OPEN:       1,
    CLOSING:    2,
    CLOSED:     3,
};

// Aktif WS bağlantısı ve listener kayıtları
let socket       = null;
let reconnectTimer = null;
let reconnectCount = 0;
const MAX_RECONNECT  = 5;
const RECONNECT_BASE = 2000;

const listeners = new Map();

// WebSocket URL — env'den çekilir, yoksa fallback
const getWsUrl = (teamId, userId) => {
    const base = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    return `${base}/ws?teamId=${teamId}&userId=${userId}`;
};

// Listener kaydı — component unmount'ta temizlenmesi için unsubscribe döner
const subscribe = (event, callback) => {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(callback);

    return () => {
        listeners.get(event)?.delete(callback);
    };
};

// Kayıtlı tüm listener'ları tetikle
const emit = (event, payload) => {
    listeners.get(event)?.forEach(cb => cb(payload));
};

// Bağlantıyı kur
const connect = (teamId, userId) => {
    if (socket && socket.readyState === WS_STATE.OPEN) return;

    socket = new WebSocket(getWsUrl(teamId, userId));

    socket.onopen = () => {
        console.log('[WS] Bağlantı kuruldu');
        reconnectCount = 0;
        clearTimeout(reconnectTimer);
        emit('connection', { status: 'connected' });
    };

    socket.onmessage = (event) => {
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

    socket.onclose = (event) => {
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
const disconnect = () => {
    clearTimeout(reconnectTimer);
    reconnectCount = MAX_RECONNECT;
    if (socket) {
        socket.close(1000, 'Kullanıcı oturumu kapattı');
        socket = null;
    }
    listeners.clear();
};

// Socket üzerinden mesaj gönder
const send = (type, payload) => {
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
            infos:   myNotifications.filter(item => item.type === 'info'),
        };
    },

    // Bildirimi silmek için (Backend'e ID gönderiyoruz, o notifications içinden siliyor)
    deleteNotification: async (id) => {
        // Önce WS ile anlık bildir, ardından REST ile kayıt sil
        send('notification:delete', { id });
        // return await api.delete(`/notifications/${id}`);
        return true;
    },

    // Kullanıcının tüm bilgilendirme bildirimlerini siler
    clearAllInfos: async (currentUserId) => {
        send('notification:clear_infos', { userId: currentUserId });
        /** Backend endpoint
         * return await api.notifications.clearInfos(currentUserId);
         * veya
         * return await api.delete(`/notifications/clear-infos/${currentUserId}`);
         */
        return true;
    },

    // Takım davetine veya harcama talebine cevap (Requests içindeki veriyi günceller)
    respondToRequest: async (id, action, teamId) => {
        // WS üzerinden anlık yayın — diğer admin ekranları otomatik güncellenir
        const sent = send('request:respond', { id, action, teamId });

        if (!sent) {
            // WS yoksa REST'e düş
            // return await api.post(`/notifications/${id}/respond`, { action, teamId });
        }
        return true;
    },

    // Takımdan ayrılma isteği (Yeni bir request objesi oluşturur)
    sendLeaveRequest: async (teamId, userId) => {
        send('request:leave', { teamId, userId });
        // return await api.post('/notifications/leave-request', { teamId, userId });
        return true;
    },

    createRequest: async (payload) => {
    const send = send('request:new', payload);

    // REST API üzerinden DB'ye kaydet 
        try {
            // const response = await api.post('notifications/ requests', payload);
            // return response;
            console.log("[WS] Yeni talep yayını yapıldı:",  payload);
            return true;
        } catch (error) {
            console.error("Talep kaydedilirken hata:", error);
            return false;
        }
    },

    // Gerçek zamanlı talep güncellemelerini dinle
    // Kullanım: const unsub = notificationService.onRequestUpdate(cb); → cleanup: unsub()
    onRequestUpdate: (callback) => subscribe('request:update', callback),

    // Gerçek zamanlı yeni bildirim geldiğinde tetiklenir
    onNewNotification: (callback) => subscribe('notification:new', callback),

    // WS bağlantı durumu değişimlerini dinle
    onConnectionChange: (callback) => subscribe('connection', callback),
};