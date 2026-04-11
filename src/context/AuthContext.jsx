import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api/api';
import Loader from '../components/common/Loader';

const AuthContext = createContext(null);

const AUTH_USER_ID_KEY = 'auth_user_id';

export const AuthProvider = ({ children }) => {
    const [currentUserId, setCurrentUserId] = useState(() => {
        return sessionStorage.getItem(AUTH_USER_ID_KEY) || localStorage.getItem(AUTH_USER_ID_KEY) || "u1";
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // logout fonksiyonunu fetchUser'dan önce tanımlıyoruz
    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_USER_ID_KEY);
        sessionStorage.removeItem(AUTH_USER_ID_KEY);
        localStorage.removeItem('tm_selected_id'); 
        setCurrentUserId(null);
        setCurrentUser(null);
    }, []);

    // Kullanıcı verilerini çekme
    const fetchUser = useCallback(async (userId) => {
        if (!userId) {
            setCurrentUser(null);
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
                // logout artık bağımlılık dizisinde mevcut
                logout();
            }
        } catch (error) {
            console.error("Auth Error:", error);
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    }, [logout]); 

    useEffect(() => {
        fetchUser(currentUserId);
    }, [currentUserId, fetchUser]);

    // Giriş İşlemleri
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

    // Yetki Kontrolleri
    const roleNameForTeam = useCallback((teamId) => {
        if (!currentUser || !teamId) return null;
        return currentUser.role?.find(r => String(r.teamId) === String(teamId))?.roleName || null;
    }, [currentUser]);

    const value = useMemo(() => ({
        currentUser,
        currentUserId,
        loading,
        isAuthenticated: !!currentUser,
        login,
        logout,
        roleNameForTeam,
        isAdmin: (teamId) => roleNameForTeam(teamId) === 'Admin'
    }), [currentUser, currentUserId, loading, login, logout, roleNameForTeam]);

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