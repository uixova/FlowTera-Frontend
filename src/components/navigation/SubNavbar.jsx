// src/components/navigation/SubNavbar.jsx
import React from 'react';
import Input from '../common/Input';
import '../components.css/SubNavbar.css';

const SubNavbar = ({ 
    title, 
    onCreate, 
    createLabel, 
    onSearch, 
    searchPlaceholder, 
    buttons = [],
    showSearch = true, // Arama çubuğu kontrolü
    showCreate = true  // Ana aksiyon butonu kontrolü
}) => {
    return (
        <div className="sub-navbar-container">
            <div className="sub-nav-left">
                <h1>{title}</h1>
            </div>
            
            <div className="sub-nav-right">
                {/* Arama Çubuğu Kontrolü */}
                {showSearch && (
                    <Input 
                        placeholder={searchPlaceholder}
                        icon="ti ti-search"
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                )}
                
                {/* Ana Aksiyon Butonu Kontrolü (New Expense, Export vb.) */}
                {showCreate && createLabel && (
                    <button className="nav-action-btn nav-create-btn" onClick={onCreate}>
                        {createLabel}
                    </button>
                )}

                {/* Diğer Opsiyonel Butonlar (Filter, Refresh vb.) */}
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