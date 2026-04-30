import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api/api';
import { authService, VERIFIED_SIGNUP_KEY } from '../features/auth/services/authService';
import Loader from '../components/common/Loader';

const AuthContext = createContext(null);
const AUTH_USER_ID_KEY = 'auth_user_id';

export const AuthProvider = ({ children }) => {
    const [currentUserId, setCurrentUserId] = useState(() => {
        // "u1"
        return sessionStorage.getItem(AUTH_USER_ID_KEY) || localStorage.getItem(AUTH_USER_ID_KEY) || null;
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [teams, setTeams] = useState([]); 
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_USER_ID_KEY);
        sessionStorage.removeItem(AUTH_USER_ID_KEY);
        localStorage.removeItem('tm_selected_id'); 
        setCurrentUserId(null);
        setCurrentUser(null);
        setTeams([]);
    }, []);

    const fetchUser = useCallback(async (userId) => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const users = await api.users.getAll();
            const user = users.find(u => String(u.id) === String(userId));
    
            if (user) {
                setCurrentUser(user);
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
                        // no-op
                    }
                }
                logout();
            }
        } catch (error) {
            console.error("Auth Error:", error);
            logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        fetchUser(currentUserId);
    }, [currentUserId, fetchUser]);

    const login = useCallback((nextId, rememberMe = false) => {
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

    const loginWithCredentials = useCallback(async (email, password) => {
        const result = await authService.loginWithEmail(email, password);
        return result;
    }, []);

    const roleNameForTeam = useCallback((teamId, type = 'role') => {
        if (!currentUser || !teamId) return null;

        if (type === 'role') {
            return currentUser.role?.find(r => String(r.teamId) === String(teamId))?.roleName || null;
        }

        if (type === 'plan') {
            const team = teams.find(t => String(t.id) === String(teamId));
            return team?.settings?.planContext?.planName || null;
        }

        return null;
    }, [currentUser, teams]);

    const value = useMemo(() => ({
        currentUser,
        currentUserId,
        loading,
        isAuthenticated: !!currentUser,
        login,
        loginWithCredentials,
        logout,
        roleNameForTeam,
        isAdmin: (teamId) => roleNameForTeam(teamId) === 'Admin'
    }), [currentUser, currentUserId, loading, login, loginWithCredentials, logout, roleNameForTeam]);

    if (loading) return <Loader type="butterfly" />;

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