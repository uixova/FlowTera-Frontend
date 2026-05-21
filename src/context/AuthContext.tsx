import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../api/api';
import { authService, VERIFIED_SIGNUP_KEY } from '../features/auth/services/authService';
import { socketClient } from '../api/socketClient';

interface AuthContextType {
    currentUser: any | null;
    currentUserId: string | null;
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
        return sessionStorage.getItem(AUTH_USER_ID_KEY) || localStorage.getItem(AUTH_USER_ID_KEY) || "u1";
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
        localStorage.removeItem('tm_selected_id');
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

        setLoading(true);
        try {
            const [usersResult, teamsResult] = await Promise.all([
                api.users.getAll({ pageSize: 1000 }),
                api.teams.getAll({ pageSize: 500 }),
            ]);

            const usersArray = Array.isArray(usersResult) ? usersResult : (usersResult?.data ?? []);
            const teamsArray = Array.isArray(teamsResult) ? teamsResult : (teamsResult?.data ?? []);

            const user = usersArray.find((u: any) => String(u.id) === String(userId));

            if (user) {
                setCurrentUser(user);
                const userTeamIds = new Set([
                    ...(user.role?.map((r: any) => String(r.teamId)) || []),
                    ...(user.teams?.map((id: any) => String(id)) || [])
                ]);
                const userTeams = teamsArray.filter((t: any) => userTeamIds.has(String(t.id)));
                setTeams(userTeams);

                // Kullanıcı yüklendikten sonra WS bağlantısını kur
                // Backend gelince token localStorage'dan okunacak, mock'ta userId yeterli
                const token = localStorage.getItem(AUTH_TOKEN_KEY) || `mock_token_${userId}`;
                socketClient.connect(token, userId);

                // Kişisel bildirim odasına katıl
                socketClient.joinRoom(`user:${userId}`);
            } else {
                // Signup akışından gelen geçici session kullanıcısı
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
            console.error('[AuthContext] fetchUser hatası:', error);
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
        try {
            const result = await authService.loginWithEmail(email, password);

            if (result.success && result.user) {
                setPendingUser({ ...result.user, rememberMe });
                await authService.startLoginVerification({
                    email: result.user.email,
                    userId: result.user.id,
                    rememberMe,
                });
                setAuthStep('verify');
                return { success: true };
            }

            setAuthError(result.message || 'E-posta veya şifre hatalı.');
            return { success: false };
        } catch (error) {
            console.error('[AuthContext] loginWithCredentials hatası:', error);
            setAuthError('Sistem bağlantı hatası.');
            return { success: false };
        }
    }, []);

    const roleNameForTeam = useCallback((teamId: any, type: 'role' | 'plan' = 'role'): string | null => {
        if (!currentUser || !teamId) return null;

        if (type === 'role') {
            return currentUser.role?.find((r: any) => String(r.teamId) === String(teamId))?.roleName || null;
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
        currentUser, currentUserId, loading,
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