type EventCallback<T = unknown> = (payload: T) => void;
type Unsubscribe = () => void;

// Server → Client ve Client → Server event isimleri — socket.events.ts ile birebir eşleşir
export const SOCKET_EVENTS = {
    // Server → Client
    CONNECTION:               'connection',
    ERROR:                    'error',
    NOTIFICATION_NEW:         'notification:new',
    NOTIFICATION_DELETED:     'notification:deleted',
    NOTIFICATION_CLEARED:     'notification:cleared',
    REQUEST_UPDATE:           'request:update',
    REQUEST_SENT:             'request:sent',
    PRESENCE_ONLINE:          'presence:online',
    PRESENCE_OFFLINE:         'presence:offline',

    // Client → Server
    NOTIFICATION_DELETE:      'notification:delete',
    NOTIFICATION_CLEAR_INFOS: 'notification:clear_infos',
    REQUEST_NEW:              'request:new',
    REQUEST_RESPOND:          'request:respond',
    REQUEST_LEAVE:            'request:leave',
    PRESENCE_PING:            'presence:ping',
} as const;

export type SocketEventKey = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

const WS_BASE       = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
const MAX_RECONNECT = 5;
const BASE_DELAY_MS = 2000;

let _ws:               WebSocket | null = null;
let _reconnectTimer:   ReturnType<typeof setTimeout> | null = null;
let _reconnectCount    = 0;
let _intentionalClose  = false;
let _generation        = 0; // Increments on each intentional reconnect — old onclose handlers use stale gen → skip

// Kimlik bilgileri — reconnect için saklanır
let _token:  string = '';
let _userId: string = '';
let _teamId: string = '';
let _role:   string = 'Member';

const _listeners = new Map<string, Set<EventCallback>>();

// Bağlantı URL'sini oluşturur — http(s) → ws(s) dönüşümü dahil
const _buildUrl = (): string => {
    const base = WS_BASE.replace(/^http/, 'ws').replace(/\/$/, '');
    const url  = new URL(`${base}/ws`);
    url.searchParams.set('token',  _token);
    url.searchParams.set('userId', _userId);
    url.searchParams.set('teamId', _teamId);
    url.searchParams.set('role',   _role);
    return url.toString();
};

const _dispatch = (type: string, payload: unknown): void => {
    _listeners.get(type)?.forEach(cb => {
        try { cb(payload); } catch (e) { console.error('[Socket] Handler hatası:', e); }
    });
};

const _scheduleReconnect = (): void => {
    if (_reconnectCount >= MAX_RECONNECT) {
        console.error(`[Socket] Maksimum yeniden bağlanma (${MAX_RECONNECT}) aşıldı`);
        return;
    }
    const delay = BASE_DELAY_MS * Math.pow(2, _reconnectCount);
    _reconnectCount++;
    _reconnectTimer = setTimeout(_openSocket, delay);
};

const _openSocket = (): void => {
    if (!_token || !_userId || !_teamId) {
        console.warn('[Socket] Bağlantı için token, userId ve teamId gerekli');
        return;
    }

    const myGen = _generation; // Capture current generation — stale onclose handlers ignored

    _ws = new WebSocket(_buildUrl());

    _ws.onopen = () => {
        if (myGen !== _generation) return; // Superseded by newer connection
        _reconnectCount = 0;
        console.info('[Socket] Bağlantı kuruldu — userId:', _userId, 'teamId:', _teamId);
    };

    _ws.onmessage = (event: MessageEvent) => {
        try {
            const { type, payload } = JSON.parse(event.data as string) as { type: string; payload: unknown };
            _dispatch(type, payload);
        } catch {
            console.warn('[Socket] Geçersiz mesaj formatı');
        }
    };

    _ws.onclose = (event: CloseEvent) => {
        // Ignore if this is a stale connection (superseded by a newer one)
        if (myGen !== _generation) return;
        console.warn('[Socket] Bağlantı kesildi —', event.code);
        // 1008 = auth hatası (geçersiz/eksik token/teamId) — yeniden bağlanma
        if (_intentionalClose || event.code === 1008) return;
        _scheduleReconnect();
    };

    _ws.onerror = () => {
        if (myGen !== _generation) return;
        console.error('[Socket] WebSocket bağlantı hatası');
    };
};

// Kimlik bilgilerini saklar — teamId henüz yoksa bağlantıyı erteler
const setCredentials = (token: string, userId: string): void => {
    _token  = token;
    _userId = userId;
};

// Token + userId + teamId ile tam bağlantı kur
// Aynı teamId ile zaten bağlıysa işlem yapmaz; teamId değişmişse yeniden bağlanır
const connect = (token: string, userId: string, teamId: string, role = 'Member'): void => {
    if (
        _ws &&
        (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING) &&
        _teamId === teamId && _token === token && _role === role
    ) return;

    _intentionalClose = true;
    _generation++;                                           // Invalidate any pending onclose/onerror from old socket
    if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; }
    _ws?.close(1000, 'Yeniden bağlanılıyor');
    _intentionalClose = false;

    _reconnectCount = 0;
    _token  = token;
    _userId = userId;
    _teamId = teamId;
    _role   = role;
    _openSocket();
};

// Takım değişiminde kullanılır — token/userId localStorage'dan okunur
const connectWithTeam = (teamId: string, role = 'Member'): void => {
    if (!_token || !_userId) return;
    connect(_token, _userId, teamId, role);
};

// Bağlantıyı kasıtlı olarak kapatır — logout'ta çağrılmalı
const disconnect = (): void => {
    _intentionalClose = true;
    _generation++;                                           // Invalidate pending handlers
    if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; }
    _ws?.close(1000, 'Kullanıcı çıkışı');
    _ws             = null;
    _reconnectCount = 0;
    _token          = '';
    _userId         = '';
    _teamId         = '';
    _role           = 'Member';
    _listeners.clear();
    _intentionalClose = false;
};

// Sunucuya mesaj gönderir
const emit = <T = unknown>(event: string, payload?: T): boolean => {
    if (_ws?.readyState !== WebSocket.OPEN) {
        console.warn('[Socket] Gönderilemedi: bağlantı yok —', event);
        return false;
    }
    _ws.send(JSON.stringify({ type: event, payload }));
    return true;
};

// Event dinleyici ekler — dönen fonksiyon aboneliği iptal eder
const on = <T = unknown>(event: string, callback: EventCallback<T>): Unsubscribe => {
    if (!_listeners.has(event)) _listeners.set(event, new Set());
    _listeners.get(event)!.add(callback as EventCallback);
    return () => _listeners.get(event)?.delete(callback as EventCallback);
};

// Event dinleyici — sadece bir kez tetiklenir
const once = <T = unknown>(event: string, callback: EventCallback<T>): void => {
    const wrapped: EventCallback = (payload) => {
        (callback as EventCallback)(payload);
        _listeners.get(event)?.delete(wrapped);
    };
    if (!_listeners.has(event)) _listeners.set(event, new Set());
    _listeners.get(event)!.add(wrapped);
};

const isConnected = (): boolean => _ws?.readyState === WebSocket.OPEN;
const getSocket   = (): WebSocket | null => _ws;

export const socketClient = {
    connect,
    connectWithTeam,
    setCredentials,
    disconnect,
    on,
    once,
    emit,
    isConnected,
    getSocket,
    EVENTS: SOCKET_EVENTS,
};
