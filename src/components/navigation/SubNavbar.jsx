import React, { useCallback } from 'react';
import Input from '../common/Input';
import './SubNavbar.css';
import { useTeam } from '../../context/TeamContext'; 

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
    
    // Context'ten aktif takım bilgisini çekiyoruz
    const { activeTeam } = useTeam();

    // Takım ismini formatla 
    const formatTeamName = useCallback((teamName) => {
        if (!teamName) return "";
        return teamName.length > 18 ? `${teamName.substring(0, 15)}...` : teamName;
    }, []);

    // Context'ten gelen veriyi formatlıyoruz
    const displayTeamName = activeTeam ? formatTeamName(activeTeam.name) : "";

    return (
        <div className="sub-navbar-container">
            <div className="sub-nav-left">
                {/* Eğer aktif bir takım varsa ve sayfa ismi geldiyse breadcrumb göster */}
                {displayTeamName && pageName ? (
                    <div className="sub-nav-breadcrumb">
                        <span className="breadcrumb-team">{displayTeamName}</span>
                        <i className="ti ti-chevron-right breadcrumb-separator"></i>
                        <span className="breadcrumb-page">{pageName}</span>
                    </div>
                ) : (
                    <h1>{title || pageName}</h1>
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