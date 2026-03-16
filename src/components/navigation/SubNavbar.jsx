// src/components/navigation/SubNavbar.jsx
import React from 'react';
import Input from '../common/Input';
import '../components.css/SubNavbar.css';

const SubNavbar = ({ 
    title, 
    teamName, 
    pageName, 
    onCreate, 
    createLabel, 
    onSearch, 
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
                {showSearch && (
                    <Input 
                        placeholder={searchPlaceholder}
                        icon="ti ti-search"
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
                        className="nav-action-btn" 
                        onClick={btn.onClick}
                        title={btn.tooltip}
                    >
                        <i className={btn.icon}></i>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SubNavbar;