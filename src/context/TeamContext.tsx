import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Context için esnek bir tip tanımı
interface TeamContextType {
    selectedTeamId: string | null;
    activeTeam: any; // İçerideki nesne yapısını bozmamak için esnek bıraktık
    selectTeam: (teamId: any) => void;
    clearTeam: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const TEAM_ID_KEY    = 'tm_selected_id';
const TEAMS_CACHE_KEY = 'tm_teams_cache';
const VIEW_MODE_KEY  = 'tm_view_mode';

interface TeamProviderProps {
    children: React.ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
        () => localStorage.getItem(TEAM_ID_KEY) || null
    );

    const activeTeam = useMemo(() => {
        if (!selectedTeamId) return null;

        try {
            const rawCache = localStorage.getItem(TEAMS_CACHE_KEY);
            if (!rawCache) return null;
            const teams = JSON.parse(rawCache);
            return teams.find((t: any) => String(t.id) === String(selectedTeamId)) || null;
        } catch (e) {
            console.error('Team Context Cache Parse Error:', e);
            return null;
        }
    }, [selectedTeamId]);

    const selectTeam = useCallback((teamId: any) => {
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

export const useTeam = () => {
    const context = useContext(TeamContext); 
    if (!context) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
};