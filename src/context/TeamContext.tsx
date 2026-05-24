import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { socketClient } from '../api/socketClient';

interface TeamContextType {
    selectedTeamId: string | null;
    activeTeam: any;
    selectTeam: (teamId: any) => void;
    clearTeam: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const TEAM_ID_KEY   = 'tm_selected_id';
const VIEW_MODE_KEY = 'tm_view_mode';

interface TeamProviderProps {
    children: React.ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
    const { teams } = useAuth();

    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
        () => localStorage.getItem(TEAM_ID_KEY) || null
    );

    const activeTeam = useMemo(() => {
        if (!selectedTeamId || !teams.length) return null;
        return teams.find((t: any) => String(t.id) === String(selectedTeamId)) ?? null;
    }, [selectedTeamId, teams]);

    const selectTeam = useCallback((teamId: any) => {
        const id = String(teamId);
        localStorage.setItem(TEAM_ID_KEY, id);
        localStorage.setItem(VIEW_MODE_KEY, 'main');
        setSelectedTeamId(id);

        // Takım değişiminde socket'i yeni teamId ile yeniden bağla
        const role = teams.find((t: any) => String(t.id) === id)
            ?.members?.find((m: any) => m.userId === localStorage.getItem('auth_user_id'))
            ?.roleName ?? 'Member';
        socketClient.connectWithTeam(id, role);
    }, [teams]);

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
