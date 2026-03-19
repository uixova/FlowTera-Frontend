import React from 'react';
import Input from '../common/Input';
import '../components.css/SubNavbar.css';

const SubNavbar = ({ 
    // props tanımları
    title, 
    teamName, 
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
    return (
        <div className="sub-navbar-container">
            <div className="sub-nav-left">
                {teamName && pageName ? (
                    <div className="sub-nav-breadcrumb">
                        <span className="breadcrumb-team">{teamName}</span>
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