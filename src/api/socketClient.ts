import { io, Socket } from 'socket.io-client';

// ─── Tipler ──────────────────────────────────────────────────────────────────

type EventCallback<T = unknown> = (payload: T) => void;
type Unsubscribe = () => void;

// Backend'den gelen tüm event isimleri — typo önlemek için sabit
export const SOCKET_EVENTS = {
    // Bağlantı
    CONNECT:              'connect',
    DISCONNECT:           'disconnect',
    CONNECT_ERROR:        'connect_error',

    // Bildirimler
    NOTIFICATION_NEW:     'notification:new',
    NOTIFICATION_DELETE:  'notification:delete',
    NOTIFICATION_CLEAR:   'notification:clear_infos',

    // Talepler
    REQUEST_NEW:          'request:new',
    REQUEST_UPDATE:       'request:update',
    REQUEST_RESPOND:      'request:respond',
    REQUEST_LEAVE:        'request:leave',

    // Takım
    TEAM_MEMBER_JOINED:   'team:member_joined',
    TEAM_MEMBER_LEFT:     'team:member_left',
    TEAM_SETTINGS_UPDATED:'team:settings_updated',

    // Presence (online/offline)
    PRESENCE_UPDATE:      'presence:update',
} as const;

export type SocketEventKey = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

// Config

const WS_URL          = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
const MAX_RECONNECT   = 5;
const RECONNECT_DELAY = 2000;

// Singleton Socket

let _socket: Socket | null = null;

// Aktif oda takibi — reconnect'te yeniden join için
const _activeRooms = new Set<string>();

// Bağlantı Yönetimi

/**
 * Socket.IO bağlantısı kurar.
 * JWT token ile kimlik doğrulama — backend socket.auth.ts middleware'i bunu okur.
 */
const connect = (token: string, userId: string): Socket => {
    if (_socket?.connected) return _socket;

    _socket = io(WS_URL, {
        auth:              { token },           // node-core-service/src/web_sockets/socket.auth.ts okur
        query:             { userId },
        transports:        ['websocket'],       // polling fallback olmadan saf WS
        reconnection:      true,
        reconnectionAttempts: MAX_RECONNECT,
        reconnectionDelay: RECONNECT_DELAY,
        reconnectionDelayMax: RECONNECT_DELAY * 4,
        withCredentials:   true,
    });

    _socket.on(SOCKET_EVENTS.CONNECT, () => {
        console.log('[Socket] Bağlandı:', _socket?.id);

        // Reconnect sonrası önceki odalara yeniden katıl
        _activeRooms.forEach(room => _socket?.emit('room:join', { room }));
    });

    _socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
        console.warn('[Socket] Bağlantı kesildi:', reason);
    });

    _socket.on(SOCKET_EVENTS.CONNECT_ERROR, (err) => {
        console.error('[Socket] Bağlantı hatası:', err.message);
    });

    return _socket;
};

/**
 * Bağlantıyı kasıtlı olarak kapatır.
 * AuthContext.tsx → logout() içinde çağrılmalı.
 */
const disconnect = (): void => {
    if (_socket) {
        _socket.disconnect();
        _socket = null;
        _activeRooms.clear();
        console.log('[Socket] Bağlantı kapatıldı');
    }
};

// Oda Yönetimi 

/**
 * Belirtilen odaya katılır.
 * Backend: node-core-service/src/web_sockets/socket.rooms.ts
 *
 * Kullanım:
 *   joinRoom(`user:${userId}`)       → kişisel bildirimler
 *   joinRoom(`team:${teamId}`)       → takım geneli eventler
 *   joinRoom(`team:${teamId}:admin`) → sadece admin eventleri
 */
const joinRoom = (room: string): void => {
    _activeRooms.add(room);
    _socket?.emit('room:join', { room });
};

/**
 * Odadan ayrılır.
 * TeamContext.tsx → clearTeam() veya takım değişiminde çağrılmalı.
 */
const leaveRoom = (room: string): void => {
    _activeRooms.delete(room);
    _socket?.emit('room:leave', { room });
};

// Event Dinleyiciler

/**
 * Belirli bir event'e abone olur.
 * Dönen fonksiyonu useEffect cleanup'ında çağır.
 *
 * Kullanım:
 *   const unsub = socketClient.on('notification:new', (data) => { ... });
 *   return () => unsub();
 */
const on = <T = unknown>(event: string, callback: EventCallback<T>): Unsubscribe => {
    _socket?.on(event, callback as EventCallback);
    return () => _socket?.off(event, callback as EventCallback);
};

/**
 * Event'i yalnızca bir kez dinler, tetiklendikten sonra otomatik temizlenir.
 */
const once = <T = unknown>(event: string, callback: EventCallback<T>): void => {
    _socket?.once(event, callback as EventCallback);
};

// Mesaj Gönderme

/**
 * Sunucuya event gönderir.
 * Bağlantı yoksa false döner — çağıran taraf bunu handle etmeli.
 */
const emit = <T = unknown>(event: string, payload?: T): boolean => {
    if (!_socket?.connected) {
        console.warn('[Socket] Gönderilemedi: bağlantı yok —', event);
        return false;
    }
    _socket.emit(event, payload);
    return true;
};

/**
 * Sunucuya event gönderir ve ACK bekler (Promise tabanlı).
 * Backend handler'ı callback ile yanıt döndürmeli.
 */
const emitWithAck = <TPayload = unknown, TResponse = unknown>(
    event: string,
    payload?: TPayload,
    timeoutMs = 5000
): Promise<TResponse> => {
    return new Promise((resolve, reject) => {
        if (!_socket?.connected) {
            reject(new Error('Socket bağlantısı yok'));
            return;
        }

        const timer = setTimeout(() => reject(new Error(`ACK timeout: ${event}`)), timeoutMs);

        _socket.emit(event, payload, (response: TResponse) => {
            clearTimeout(timer);
            resolve(response);
        });
    });
};

// Durum Sorguları

const isConnected  = (): boolean => _socket?.connected ?? false;
const getSocketId  = (): string | undefined => _socket?.id;
const getSocket    = (): Socket | null => _socket;

// Public API

export const socketClient = {
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    on,
    once,
    emit,
    emitWithAck,
    isConnected,
    getSocketId,
    getSocket,
    EVENTS: SOCKET_EVENTS,
};
