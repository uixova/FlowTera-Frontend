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
    showCurrency = false, 
    searchPlaceholder, 
    buttons = [],
    showSearch = true,
    showCreate = true 
}) => {
    const getTeamNameFromCache = useCallback((teamId) => {
        if (!teamId) return "";

        const directName = localStorage.getItem('tm_selected_name');
        if (directName) return directName;

        try {
            const rawCache = localStorage.getItem('tm_teams_cache');
            const parsedCache = rawCache ? JSON.parse(rawCache) : [];
            if (!Array.isArray(parsedCache)) return "";

            const matchedTeam = parsedCache.find((team) => String(team.id) === String(teamId));
            return matchedTeam?.name || "";
        } catch {
            return "";
        }
    }, []);

    const formatTeamName = useCallback((teamName) => {
        if (!teamName) return "";
        return teamName.length > 18
            ? `${teamName.substring(0, 15)}...`
            : teamName;
    }, []);

    const [displayTeamName, setDisplayTeamName] = useState(() => {
        const selectedId = localStorage.getItem('tm_selected_id');
        return formatTeamName(getTeamNameFromCache(selectedId));
    });

    const updateTeamName = useCallback(async (isMounted = { current: true }) => {
        const selectedId = localStorage.getItem('tm_selected_id');
        if (!selectedId) return;

        const cachedTeamName = getTeamNameFromCache(selectedId);
        if (cachedTeamName && isMounted.current) {
            setDisplayTeamName(formatTeamName(cachedTeamName));
        }

        try {
            const teams = await teamsService.getTeams();
            if (teams && isMounted.current) {
                const currentTeam = teams.find(t => String(t.id) === String(selectedId));
                if (currentTeam) {
                    localStorage.setItem('tm_selected_name', currentTeam.name || '');
                    const newName = formatTeamName(currentTeam.name);
                    setDisplayTeamName(newName);
                }
            }
        } catch (error) {
            console.error("SubNavbar update error:", error);
        }
    }, [formatTeamName, getTeamNameFromCache]);

    useEffect(() => {
        // Component'in hala mount edilip edilmediğini kontrol etmek için
        const status = { current: true };

        // useEffect içinde doğrudan çağırmak yerine bir fonksiyon aracılığıyla tetikliyoruz
        const initUpdate = async () => {
            await updateTeamName(status);
        };

        initUpdate();

        const handleTeamChange = (event) => {
            const incomingName = event?.detail?.teamName || localStorage.getItem('tm_selected_name');
            if (incomingName) {
                setDisplayTeamName(formatTeamName(incomingName));
                return;
            }

            const selectedId = event?.detail?.teamId || localStorage.getItem('tm_selected_id');
            const cachedName = getTeamNameFromCache(selectedId);
            if (cachedName) {
                setDisplayTeamName(formatTeamName(cachedName));
                return;
            }

            updateTeamName(status);
        };

        const handleStorageChange = () => {
            const cachedTeamName = localStorage.getItem('tm_selected_name');
            if (cachedTeamName) {
                setDisplayTeamName(formatTeamName(cachedTeamName));
            }
            updateTeamName(status);
        };

        window.addEventListener('teamChanged', handleTeamChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            status.current = false; 
            window.removeEventListener('teamChanged', handleTeamChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [formatTeamName, getTeamNameFromCache, updateTeamName]);

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
                {showCurrency && <div className="nav-currency-indicator" title="Multi-currency enabled"></div>}
                
                {showSearch && (
                    <Input 
                        placeholder={searchPlaceholder}
                        icon="ti ti-search"
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