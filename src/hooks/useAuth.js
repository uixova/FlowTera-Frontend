import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';

// Local Storage anahtarı için sabit değer
const AUTH_USER_ID_KEY = 'auth_user_id';

export const useAuth = () => {
  const [currentUserId, setCurrentUserId] = useState(() => {
    return localStorage.getItem(AUTH_USER_ID_KEY) || 'u1';
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // currentUserId değiştiğinde kullanıcı bilgilerini API'den çeken useEffect
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const users = (await api.users.getAll()) || [];
        const user = users.find(u => String(u.id) === String(currentUserId)) || null;
        if (!cancelled) setCurrentUser(user);
      } catch {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  // Authenticated user ID'sini güncelleyen fonksiyon
  const setAuthUserId = useCallback((nextId) => {
    const stringId = nextId == null ? '' : String(nextId);
    localStorage.setItem(AUTH_USER_ID_KEY, stringId || 'u2');
    setCurrentUserId(stringId || 'u2');
  }, []);

  // Takım rolleri için yardımcı fonksiyon
  const roleNameForTeam = useCallback(
    (teamId) => {
      if (!currentUser || !teamId) return null;
      return currentUser.role?.find(r => String(r.teamId) === String(teamId))?.roleName || null;
    },
    [currentUser]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    return {
      currentUserId: currentUser?.id ?? currentUserId,
      currentUser,
      loading,
      setAuthUserId,
      roleNameForTeam,
      canAdminTeam: (teamId) => roleNameForTeam(teamId) === 'Admin'
    };
  }, [currentUser, currentUserId, loading, setAuthUserId, roleNameForTeam]);

  return contextValue;
};

