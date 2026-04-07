import React, { useState, useEffect, useCallback } from 'react';
import Input from '../common/Input';
import '../components.css/SubNavbar.css';
import { teamsService } from '../../features/teams/services/teamsService';

const SubNavbar = ({ 
    title, 
    pageName, 
    onCreate, 
    createLabel, 
    onSearch, 
    searchValue,
    showCurrency = false, 
    searchPlaceholder, 
    buttons = [],
    showSearch = true,
    showCreate = true 
}) => {
    
    // Takım ismini formatla 
    const formatTeamName = useCallback((teamName) => {
        if (!teamName) return "";
        return teamName.length > 18 ? `${teamName.substring(0, 15)}...` : teamName;
    }, []);

    // Cache'den isim çek 
    const getTeamNameFromCache = useCallback(() => {
        const selectedId = localStorage.getItem('tm_selected_id');
        if (!selectedId) return "";

        const directName = localStorage.getItem('tm_selected_name');
        if (directName) return directName;

        try {
            const rawCache = localStorage.getItem('tm_teams_cache');
            const parsedCache = rawCache ? JSON.parse(rawCache) : [];
            const matchedTeam = parsedCache.find((t) => String(t.id) === String(selectedId));
            return matchedTeam?.name || "";
        } catch { return ""; }
    }, []);

    // Sayfa açılır açılmaz veriyi buradan alıyoruz (Effect'e gerek kalmıyor)
    const [displayTeamName, setDisplayTeamName] = useState(() => {
        return formatTeamName(getTeamNameFromCache());
    });

    // Takım İsmini API'den Güncelleme (Async)
    const updateTeamName = useCallback(async (isMounted) => {
        const selectedId = localStorage.getItem('tm_selected_id');
        if (!selectedId) return;

        try {
            const teams = await teamsService.getTeams();
            // Component hala ekrandaysa ve veri geldiyse güncelle
            if (teams && isMounted.current) {
                const currentTeam = teams.find(t => String(t.id) === String(selectedId));
                if (currentTeam) {
                    localStorage.setItem('tm_selected_name', currentTeam.name || '');
                    setDisplayTeamName(formatTeamName(currentTeam.name));
                }
            }
        } catch (error) { 
            console.error("SubNavbar update error:", error); 
        }
    }, [formatTeamName]);

    // Sadece dış değişiklikleri dinliyoruz
    useEffect(() => {
        const status = { current: true };

        const initUpdate = setTimeout(() => {
            updateTeamName(status);
        }, 0);

        const handleTeamChange = () => {
            // UI'ı anında cache ile güncelle, arkada API'yi süz
            setDisplayTeamName(formatTeamName(getTeamNameFromCache()));
            updateTeamName(status);
        };

        window.addEventListener('teamChanged', handleTeamChange);
        window.addEventListener('storage', handleTeamChange);

        return () => {
            status.current = false; 
            clearTimeout(initUpdate); 
            window.removeEventListener('teamChanged', handleTeamChange);
            window.removeEventListener('storage', handleTeamChange);
        };
    }, [updateTeamName, formatTeamName, getTeamNameFromCache]);

    return (
        <div className="sub-navbar-container">
            <div className="sub-nav-left">
                {displayTeamName && pageName ? (
                    <div className="sub-nav-breadcrumb">
                        <span className="breadcrumb-team">{displayTeamName}</span>
                        <i className="ti ti-chevron-right breadcrumb-separator"></i>
                        <span className="breadcrumb-page">{pageName}</span>
                    </div>
                ) : (
                    <h1>{title}</h1>
                )}
            </div>
            
            <div className="sub-nav-right">
                {showCurrency && <div className="nav-currency-indicator" title="Multi-currency active"></div>}
                
                {showSearch && (
                    <Input 
                        placeholder={searchPlaceholder}
                        icon="ti ti-search"
                        value={searchValue}
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                )}
                
                {showCreate && createLabel && (
                    <button className="nav-action-btn nav-create-btn" onClick={onCreate}>
                        <i className="ti ti-plus"></i>
                        {createLabel}
                    </button>
                )}

                {buttons.map((btn, index) => (
                    <button 
                        key={index} 
                        className={`nav-action-btn ${btn.className || ''}`} 
                        onClick={btn.onClick}
                        title={btn.tooltip}
                    >
                        {btn.label && <span className="btn-label-text">{btn.label}</span>}
                        <i className={btn.icon}></i>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SubNavbar;