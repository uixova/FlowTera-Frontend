// src/components/modals/ThemeModal.jsx
import React from 'react';
import '../components.css/ThemeModal.css';

const ThemeModal = ({ isOpen, onClose }) => {
  
  return (
    <div 
    className={`panel-overlay ${isOpen ? 'active' : ''}`} 
      onClick={onClose}
    >
      <div 
        className={`side-panel ${isOpen ? 'open' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-header">
          <h3>Appearance</h3>
          <button className="panel-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="panel-body">
          <div className="panel-section">
            <label>System Mode</label>
            <div className="mode-switch-group">
              <button className="mode-opt active"><i className="ti ti-moon"></i> Dark</button>
              <button className="mode-opt"><i className="ti ti-sun"></i> Light</button>
            </div>
          </div>

          <div className="panel-section">
            <label>Accent Color</label>
            <div className="color-picker-grid">
              <div className="color-dot active" style={{ background: '#50e091' }}></div>
              <div className="color-dot" style={{ background: '#0ed45a' }}></div>
              <div className="color-dot" style={{ background: '#8cbed1' }}></div>
              <div className="color-dot" style={{ background: '#f1c40f' }}></div>
              <div className="color-dot" style={{ background: '#e74c3c' }}></div>
              <div className="color-dot" style={{ background: '#f10ff1' }}></div>
              <div className="color-dot" style={{ background: '#943ce7' }}></div>
              <div className="color-dot" style={{ background: '#0f97f1' }}></div>
            </div>
          </div>

          <div className="panel-section">
            <label>Corner Radius</label>
            <div className="radius-list">
              <button className="rad-opt">Sharp</button>
              <button className="rad-opt active">Soft</button>
              <button className="rad-opt">Round</button>
              <button className="rad-opt">Soft Round</button>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button className="btn-reset">Reset</button>
          <button className="btn-save">Save Design</button>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;