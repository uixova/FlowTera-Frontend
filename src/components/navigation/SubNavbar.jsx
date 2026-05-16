import React, { useState, useCallback } from 'react';
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
    showCreate = true,
}) => {
    const { activeTeam } = useTeam();
    // Mobilde sağ aksiyonları aç/kapat
    const [isActionsOpen, setIsActionsOpen] = useState(false);

    const formatTeamName = useCallback((teamName) => {
        if (!teamName) return '';
        return teamName.length > 18 ? `${teamName.substring(0, 15)}…` : teamName;
    }, []);

    const displayTeamName = activeTeam ? formatTeamName(activeTeam.name) : '';

    return (
        <div className={`sub-navbar-container${isActionsOpen ? ' actions-open' : ''}`}>
            {/* Sol: başlık / breadcrumb */}
            <div className="sub-nav-left">
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

            {/* Sağ: aksiyonlar */}
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
                            placeholder={searchPlaceholder || 'Ara…'}
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

            {/* Mobil: sağ aksiyonlar toggle butonu */}
            <button
                className={`sub-nav-toggle${isActionsOpen ? ' is-open' : ''}`}
                onClick={() => setIsActionsOpen(v => !v)}
                aria-label="Araçları göster"
            >
                <i className={`ti ${isActionsOpen ? 'ti-x' : 'ti-dots-vertical'}`}></i>
            </button>

            {/* Mobil açılır aksiyon çekmecesi */}
            {isActionsOpen && (
                <div className="sub-nav-mobile-actions">
                    {showSearch && (
                        <div className="sub-search-wrapper sub-search-full">
                            <i className="ti ti-search search-icon"></i>
                            <input
                                type="text"
                                placeholder={searchPlaceholder || 'Ara…'}
                                value={searchValue}
                                onChange={(e) => onSearch && onSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                    <div className="sub-mobile-btn-row">
                        {showCurrency && (
                            <div className="nav-currency-indicator btn-dark-sub" title="Multi-currency active">
                                <i className="ti ti-currency-dollar"></i> Aktif
                            </div>
                        )}
                        {buttons.map((btn, index) => (
                            <button
                                key={index}
                                className={`${btn.isSpecial ? 'sub-special-btn' : 'btn-dark-sub'} ${btn.className || ''}`}
                                onClick={() => { btn.onClick && btn.onClick(); setIsActionsOpen(false); }}
                                title={btn.tooltip}
                            >
                                <i className={btn.icon}></i>
                                {btn.label && <span className="btn-label-text">{btn.label}</span>}
                            </button>
                        ))}
                        {showCreate && createLabel && (
                            <button className="sub-create-btn" onClick={() => { onCreate && onCreate(); setIsActionsOpen(false); }}>
                                <i className="ti ti-plus"></i>
                                {createLabel}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubNavbar;