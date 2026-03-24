import React, { useState, useEffect, useCallback } from 'react';
import Input from '../common/Input';
import '../components.css/SubNavbar.css';
import allTeams from '../../features/teams/data/teams.json';

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
    // İSMİ DAHA STATE OLUŞURKEN HESAPLA (Hata veren useEffect'teki ilk çağrıyı iptal eder)
    const [displayTeamName, setDisplayTeamName] = useState(() => {
        const selectedId = localStorage.getItem('tm_selected_id');
        const currentTeam = allTeams.find(t => String(t.id) === String(selectedId));
        if (currentTeam) {
            return currentTeam.name.length > 18 
                ? currentTeam.name.substring(0, 15) + "..." 
                : currentTeam.name;
        }
        return "Team";
    });

    // Güncelleme fonksiyonunu useCallback ile koru
    const updateTeamName = useCallback(() => {
        const selectedId = localStorage.getItem('tm_selected_id');
        const currentTeam = allTeams.find(t => String(t.id) === String(selectedId));
        
        // Takım ismini kısaltarak göster (18 karakterden uzun ise)
        const newName = currentTeam 
            ? (currentTeam.name.length > 18 ? currentTeam.name.substring(0, 15) + "..." : currentTeam.name)
            : "Team";
            
        // Sadece isim gerçekten değiştiyse state güncelle (render maliyetini düşürür)
        setDisplayTeamName(prev => (prev !== newName ? newName : prev));
    }, []);

    useEffect(() => {
        // Takım değişikliklerini dinlemek için hem custom event hem de storage event'ini kullanıyoruz
        const handleStorageChange = () => {
            updateTeamName();
        };

        window.addEventListener('teamChanged', handleStorageChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('teamChanged', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [updateTeamName]); // Sadece event dinleyicileri kurar

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
                {showCurrency && (
                    <div className="nav-currency-indicator" title="Multi-currency enabled"></div>
                )}

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