import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const TeamContext = createContext();

const TEAM_ID_KEY    = 'tm_selected_id';
const TEAMS_CACHE_KEY = 'tm_teams_cache';
const VIEW_MODE_KEY  = 'tm_view_mode';

export const TeamProvider = ({ children }) => {
    const [selectedTeamId, setSelectedTeamId] = useState(
        () => localStorage.getItem(TEAM_ID_KEY) || null
    );

    const activeTeam = useMemo(() => {
        if (!selectedTeamId) return null;

        try {
            const rawCache = localStorage.getItem(TEAMS_CACHE_KEY);
            if (!rawCache) return null;
            const teams = JSON.parse(rawCache);
            return teams.find(t => String(t.id) === String(selectedTeamId)) || null;
        } catch (e) {
            console.error('Team Context Cache Parse Error:', e);
            return null;
        }
    }, [selectedTeamId]);

    const selectTeam = useCallback((teamId) => {
        const id = String(teamId);
        localStorage.setItem(TEAM_ID_KEY, id);
        localStorage.setItem(VIEW_MODE_KEY, 'main');
        setSelectedTeamId(id);
    }, []);

    const clearTeam = useCallback(() => {
        localStorage.removeItem(TEAM_ID_KEY);
        localStorage.removeItem(VIEW_MODE_KEY);
        setSelectedTeamId(null);
    }, []);

    // Sekmeler arası senkronizasyon
    useEffect(() => {
        const sync = () => {
            const id = localStorage.getItem(TEAM_ID_KEY);
            setSelectedTeamId(prev => (prev !== id ? id : prev));
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, []);

    const value = useMemo(() => ({
        selectedTeamId,
        activeTeam,
        selectTeam,
        clearTeam,
    }), [selectedTeamId, activeTeam, selectTeam, clearTeam]);

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTeam = () => {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
};