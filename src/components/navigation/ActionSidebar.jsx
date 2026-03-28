import React from 'react';
import '../components.css/ActionSidebar.css';

const ActionSidebar = ({ isOpen, onClose, title, children, footer, width = "460px" }) => {
  return (
    <>
      {/* Karartma Overlay */}
      <div 
        className={`as-overlay ${isOpen ? 'is-active' : ''}`} 
        onClick={onClose} 
      />

      {/* Sağ Panel */}
      <div 
        className={`as-panel ${isOpen ? 'is-open' : ''}`} 
        style={{ '--sidebar-width': width }}
      >
        {/* Ortak Header */}
        <div className="as-header">
          <div className="as-header-content">
            {title}
          </div>
          <button className="as-close-btn" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        {/* Dinamik İçerik Alanı */}
        <div className="as-body custom-scroll">
          {children}
        </div>

        {/* Opsiyonel Footer */}
        {footer && (
          <div className="as-footer">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

export default ActionSidebar;