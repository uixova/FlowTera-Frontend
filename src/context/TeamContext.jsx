import React, { createContext, useContext, useState, useEffect } from 'react';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
    const [selectedTeamId, setSelectedTeamId] = useState(() => localStorage.getItem('tm_selected_id') || null);

    // Takım Seçme Fonksiyonu
    const selectTeam = (teamId) => {
        const id = String(teamId);
        localStorage.setItem('tm_selected_id', id);
        localStorage.setItem('tm_view_mode', 'main');
        setSelectedTeamId(id);
    };

    // Takımdan Çıkış / Temizleme Fonksiyonu
    const clearTeam = () => {
        localStorage.removeItem('tm_selected_id');
        localStorage.removeItem('tm_view_mode');
        setSelectedTeamId(null);
    };

    // Başka sekmelerde değişim olursa senkronize kalmak için (Opsiyonel ama iyi olur)
    useEffect(() => {
        const sync = () => {
            const id = localStorage.getItem('tm_selected_id');
            if (id !== selectedTeamId) setSelectedTeamId(id);
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, [selectedTeamId]);

    return (
        <TeamContext.Provider value={{ selectedTeamId, selectTeam, clearTeam }}>
            {children}
        </TeamContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTeam = () => useContext(TeamContext);