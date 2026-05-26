import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api, restFetch } from '../api/api';
import { authService, VERIFIED_SIGNUP_KEY } from '../features/auth/services/authService';
import { socketClient } from '../api/socketClient';
import { isDemoUser } from '../utils/demo';
import demoUserStatic from '../data/demo-user.json';
import demoTeamsStatic from '../data/demo-teams.json';

interface AuthContextType {
    currentUser: any | null;
    currentUserId: string | null;
    teams: any[];
    loading: boolean;
    isAuthenticated: boolean;
    login: (nextId: any, rememberMe?: boolean) => void;
    loginWithCredentials: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean }>;
    logout: () => void;
    roleNameForTeam: (teamId: any, type?: 'role' | 'plan') => string | null;
    isAdmin: (teamId: any) => boolean;
    authStep: string;
    setAuthStep: React.Dispatch<React.SetStateAction<string>>;
    authError: string | null;
    setAuthError: React.Dispatch<React.SetStateAction<string | null>>;
    pendingUser: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_ID_KEY = 'auth_user_id';
const AUTH_TOKEN_KEY   = 'auth_token'; // Backend gelince JWT buradan okunur

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
        return sessionStorage.getItem(AUTH_USER_ID_KEY) || localStorage.getItem(AUTH_USER_ID_KEY) || null;
    });
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [authStep, setAuthStep] = useState<string>('credentials');
    const [authError, setAuthError] = useState<string | null>(null);
    const [pendingUser, setPendingUser] = useState<any | null>(null);

    const isLoggingOut = useRef<boolean>(false);

    const logout = useCallback(() => {
        isLoggingOut.current = true;

        // WS bağlantısını kapat
        socketClient.disconnect();

        localStorage.removeItem(AUTH_USER_ID_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_USER_ID_KEY);
        sessionStorage.removeItem('is_demo');
        localStorage.removeItem('tm_selected_id');
        sessionStorage.removeItem('tm_selected_id');
        setCurrentUserId(null);
        setCurrentUser(null);
        setTeams([]);
        setAuthStep('credentials');
        setLoading(false);
        isLoggingOut.current = false;
    }, []);

    const fetchUser = useCallback(async (userId: string | null) => {
        if (!userId) {
            setLoading(false);
            return;
        }

        if (isLoggingOut.current) return;

        // Demo mode — skip backend entirely, use local JSON
        // Both conditions must be true to prevent stale is_demo from affecting real users
        if (sessionStorage.getItem('is_demo') === 'true' && userId === 'demo-user-001') {
            setCurrentUser(demoUserStatic);
            setTeams(demoTeamsStatic as any[]);
            setLoading(false);
            return;
        }

        // Clear any stale demo flag for non-demo users
        sessionStorage.removeItem('is_demo');

        setLoading(true);
        try {
            // REST: kullanıcıyı direkt ID ile çek, takımları ayrı endpoint'ten al
            const [userResult, teamsResult] = await Promise.all([
                restFetch<{ status: string; data: any }>(`/users/${userId}`),
                api.teams.getAll({ pageSize: 500 }),
            ]);

            const user       = (userResult as any).data ?? userResult;
            const teamsArray = Array.isArray(teamsResult) ? teamsResult : ((teamsResult as any)?.data ?? []);

            if (user) {
                setCurrentUser(user);
                setTeams(teamsArray);

                // Safety: ensure is_demo matches actual user identity
                if (!isDemoUser(user.email)) sessionStorage.removeItem('is_demo');

                const token      = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY) || '';
                const storedTeam = localStorage.getItem('tm_selected_id') || '';
                socketClient.setCredentials(token, userId);
                if (storedTeam) socketClient.connect(token, userId, storedTeam);
            } else {
                const rawSessionUser = sessionStorage.getItem(VERIFIED_SIGNUP_KEY);
                if (rawSessionUser) {
                    try {
                        const sessionUser = JSON.parse(rawSessionUser);
                        if (String(sessionUser?.id) === String(userId)) {
                            setCurrentUser(sessionUser);
                            setLoading(false);
                            return;
                        }
                    } catch {
                        // Bozuk JSON — yoksay
                    }
                }
                logout();
                return;
            }
        } catch (error) {
            console.error('[AuthContext] fetchUser hatası:', error instanceof Error ? error.message : String(error));
            setCurrentUser(null);
            setTeams([]);
            localStorage.removeItem(AUTH_USER_ID_KEY);
            sessionStorage.removeItem(AUTH_USER_ID_KEY);
            setCurrentUserId(null);
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        fetchUser(currentUserId);
    }, [currentUserId, fetchUser]);

    const login = useCallback((nextId: any, rememberMe = false) => {
        const stringId = String(nextId);
        localStorage.removeItem(AUTH_USER_ID_KEY);
        sessionStorage.removeItem(AUTH_USER_ID_KEY);

        if (rememberMe) {
            localStorage.setItem(AUTH_USER_ID_KEY, stringId);
        } else {
            sessionStorage.setItem(AUTH_USER_ID_KEY, stringId);
        }
        setCurrentUserId(stringId);
    }, []);

    const loginWithCredentials = useCallback(async (email: string, password: string, rememberMe: boolean) => {
        setAuthError(null);

        // Demo account — skip backend entirely
        if (isDemoUser(email)) {
            sessionStorage.setItem('is_demo', 'true');
            sessionStorage.setItem('tm_selected_id', 'demo-team-001');
            login('demo-user-001', false);
            return { success: true, redirecting: true };
        }

        try {
            const result = await authService.loginWithEmail(email, password);

            if (!result.success) {
                setAuthError(result.message || 'E-posta veya şifre hatalı.');
                return { success: false };
            }

            // SKIP_EMAIL_OTP=true: token direkt döndü
            if (result.token && result.user) {
                if (rememberMe) localStorage.setItem(AUTH_TOKEN_KEY, result.token);
                else            sessionStorage.setItem(AUTH_TOKEN_KEY, result.token);
                if (isDemoUser(email)) sessionStorage.setItem('is_demo', 'true');
                else                   sessionStorage.removeItem('is_demo');
                login(result.user.id, rememberMe);
                return { success: true, redirecting: true };
            }

            // OTP akışı: verify ekranına geç
            setPendingUser({ email: result.email, userId: result.userId, rememberMe });
            authService.startLoginVerification({ email: result.email, userId: result.userId, rememberMe });
            setAuthStep('verify');
            return { success: true, redirecting: false };
        } catch (error) {
            console.error('[AuthContext] loginWithCredentials hatası:', error instanceof Error ? error.message : String(error));
            setAuthError('Sistem bağlantı hatası.');
            return { success: false };
        }
    }, [login]);

    const roleNameForTeam = useCallback((teamId: any, type: 'role' | 'plan' = 'role'): string | null => {
        if (!currentUser || !teamId) return null;

        if (type === 'role') {
            const entry = currentUser.role?.find((r: any) => String(r.teamId) === String(teamId));
            if (!entry) return null;
            // Backend may return roleName (capitalized) or role (lowercase) — handle both
            if (entry.roleName) return entry.roleName;
            if (entry.role) return entry.role.charAt(0).toUpperCase() + entry.role.slice(1);
            return null;
        }

        if (type === 'plan') {
            const team = teams.find((t: any) => String(t.id) === String(teamId));
            return team?.settings?.planContext?.planName || null;
        }

        return null;
    }, [currentUser, teams]);

    const isAdmin = useCallback(
        (teamId: any): boolean => roleNameForTeam(teamId) === 'Admin',
        [roleNameForTeam]
    );

    const value = useMemo(() => ({
        currentUser,
        currentUserId,
        teams,
        loading,
        isAuthenticated: !!currentUser,
        login,
        loginWithCredentials,
        logout,
        roleNameForTeam,
        isAdmin,
        authStep,
        setAuthStep,
        authError,
        setAuthError,
        pendingUser,
    }), [
        currentUser, currentUserId, teams, loading,
        login, loginWithCredentials, logout,
        roleNameForTeam, isAdmin,
        authStep, authError, pendingUser,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};