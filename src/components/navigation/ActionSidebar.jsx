import React, { useState, useEffect } from 'react';
import '../components.css/ActionSidebar.css';

const ActionSidebar = ({ isOpen, onClose, title, children, footer, width = "460px" }) => {
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
    let timeout;
    if (isOpen) {
      timeout = setTimeout(() => setIsAnimate(true), 10);
    } else {
      setIsAnimate(false);
    }
    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen && !isAnimate) return null;

  return (
    <>
      {/* Karartma Overlay */}
      <div 
        className={`as-overlay ${isAnimate ? 'is-active' : ''}`} 
        onClick={onClose} 
      />

      {/* Sağ Panel */}
      <div 
        className={`as-panel ${isAnimate ? 'is-open' : ''}`} 
        style={{ '--sidebar-width': width }}
      >
        <div className="as-header">
          <div className="as-header-content">
            {title}
          </div>
          <button className="as-close-btn" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="as-body custom-scroll">
          {children}
        </div>

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