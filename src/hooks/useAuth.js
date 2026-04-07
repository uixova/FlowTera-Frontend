import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';

const AUTH_USER_ID_KEY = 'auth_user_id';

export const useAuth = () => {
  // İlk açılışta hem session hem local storage kontrolü yapıyoruz
  const [currentUserId, setCurrentUserId] = useState(() => {
    return sessionStorage.getItem(AUTH_USER_ID_KEY) || 
           localStorage.getItem(AUTH_USER_ID_KEY) || 
           'u1';
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const users = (await api.users.getAll()) || [];
        const user = users.find(u => String(u.id) === String(currentUserId)) || null;
        
        if (!cancelled) {
          if (user) {
            setCurrentUser(user);
          } else {
            // ID var ama kullanıcı yoksa (hatalı/eski id) temizle
            setCurrentUser(null);
          }
        }
      } catch {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [currentUserId]);

  /**
   * Authenticated user ID'sini güncelleyen ana fonksiyon.
   * @param {string|null} nextId - Kullanıcı ID'si (null ise çıkış yapar)
   * @param {boolean} rememberMe - True ise localStorage, false ise sessionStorage kullanır
   */
  const setAuthUserId = useCallback((nextId, rememberMe = false) => {
    // Eğer null veya boş gelirse çıkış yap(Logout)
    if (!nextId) {
      localStorage.removeItem(AUTH_USER_ID_KEY);
      sessionStorage.removeItem(AUTH_USER_ID_KEY);
      setCurrentUserId(null);
      setCurrentUser(null);
      return;
    }

    const stringId = String(nextId);
    
    // Her iki tarafı da önce bir temizle
    localStorage.removeItem(AUTH_USER_ID_KEY);
    sessionStorage.removeItem(AUTH_USER_ID_KEY);

    if (rememberMe) {
      localStorage.setItem(AUTH_USER_ID_KEY, stringId);
    } else {
      sessionStorage.setItem(AUTH_USER_ID_KEY, stringId);
    }

    setCurrentUserId(stringId);
  }, []);

  const roleNameForTeam = useCallback(
    (teamId) => {
      if (!currentUser || !teamId) return null;
      return currentUser.role?.find(r => String(r.teamId) === String(teamId))?.roleName || null;
    },
    [currentUser]
  );

  const contextValue = useMemo(() => {
    return {
      currentUserId: currentUser?.id ?? currentUserId,
      currentUser,
      loading,
      setAuthUserId, // Hem giriş hem çıkış için tek fonksiyon
      roleNameForTeam,
      canAdminTeam: (teamId) => roleNameForTeam(teamId) === 'Admin',
      isAuthenticated: !!currentUser 
    };
  }, [currentUser, currentUserId, loading, setAuthUserId, roleNameForTeam]);

  return contextValue;
};