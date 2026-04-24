import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
    const [selectedTeamId, setSelectedTeamId] = useState(() => localStorage.getItem('tm_selected_id') || null);

    // Aktif takımın tüm bilgilerini (settings, name vb.) cache'ten bulup döndüren obje
    const activeTeam = useMemo(() => {
        if (!selectedTeamId) return null;
        
        const rawCache = localStorage.getItem('tm_teams_cache');
        if (!rawCache) return null;

        try {
            const teams = JSON.parse(rawCache);
            // Cache içindeki takımlardan mevcut ID ile eşleşeni bul
            return teams.find(t => String(t.id) === String(selectedTeamId)) || null;
        } catch (e) {
            console.error("Team Context Cache Parse Error:", e);
            return null;
        }
    }, [selectedTeamId]);

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

    // Sekmeler arası senkronizasyon (Storage event dinleyici)
    useEffect(() => {
        const sync = () => {
            const id = localStorage.getItem('tm_selected_id');
            if (id !== selectedTeamId) {
                setSelectedTeamId(id);
            }
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, [selectedTeamId]);

    return (
        <TeamContext.Provider value={{ 
            selectedTeamId, 
            activeTeam, // Artık sayfalarından buna erişebilirsin
            selectTeam, 
            clearTeam 
        }}>
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