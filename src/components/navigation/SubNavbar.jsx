import React, { useCallback } from 'react';
import Input from '../ui/Input';
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
                        <span className="breadcrumb-team">
                            <i className="ti ti-users-group"></i> {displayTeamName}
                        </span>
                        <i className="ti ti-chevron-right breadcrumb-separator"></i>
                        <span className="breadcrumb-page">{pageName}</span>
                    </div>
                ) : (
                    <h1>{title || pageName}</h1>
                )}
            </div>
            
            <div className="sub-nav-right">
                {showCurrency && (
                    <div className="nav-currency-indicator btn-dark-sub" title="Multi-currency active">
                        <i className="ti ti-currency-dollar"></i> Aktif
                    </div>
                )}
                
                {showSearch && (
                    <div className="sub-search-wrapper">
                        <i className="ti ti-search search-icon"></i>
                        <input 
                            type="text"
                            placeholder={searchPlaceholder || "Ara..."}
                            value={searchValue}
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                        />
                    </div>
                )}
                
                {buttons.map((btn, index) => (
                    <button 
                        key={index} 
                        className={`${btn.isSpecial ? 'sub-special-btn' : 'btn-dark-sub'} ${btn.className || ''}`} 
                        onClick={btn.onClick}
                        title={btn.tooltip}
                    >
                        <i className={btn.icon}></i>
                        {btn.label && <span className="btn-label-text">{btn.label}</span>}
                    </button>
                ))}

                {showCreate && createLabel && (
                    <button className="sub-create-btn" onClick={onCreate}>
                        <i className="ti ti-plus"></i>
                        {createLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SubNavbar;