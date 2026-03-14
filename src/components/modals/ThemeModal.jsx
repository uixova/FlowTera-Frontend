import React, { useState } from 'react';
import '../components.css/ThemeModal.css';

const ThemeModal = ({ isOpen, onClose }) => {
  // Tema seçimlerini tutacak local stateler (İleride bunları Context veya Redux'a bağlayabilirsin)
  const [activeMode, setActiveMode] = useState('dark');
  const [accentColor, setAccentColor] = useState('#50e091');
  const [radius, setRadius] = useState('Soft');

  {/* Örnek renk seçenekleri ve köşe yarıçapı seçenekleri */}
  const colors = [
    '#50e091', '#0ed45a', '#8cbed1', '#f1c40f', 
    '#e74c3c', '#f10ff1', '#943ce7', '#0f97f1'
  ];

  const radiusOptions = ['Sharp', 'Soft', 'Round', 'Ultra'];

  return (
    <div className={`panel-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className={`side-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        
        <div className="panel-header">
          <div className="header-text">
            <h3>Appearance</h3>
            <p>Customize your workspace interface</p>
          </div>
          <button className="panel-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="panel-body">
          {/* SYSTEM MODE */}
          <div className="panel-section">
            <label>Interface Mode</label>
            <div className="mode-switch-group">
              <button 
                className={`mode-opt ${activeMode === 'dark' ? 'active' : ''}`}
                onClick={() => setActiveMode('dark')}
              >
                <i className="ti ti-moon"></i> Dark Mode
              </button>
              <button 
                className={`mode-opt ${activeMode === 'light' ? 'active' : ''}`}
                onClick={() => setActiveMode('light')}
              >
                <i className="ti ti-sun"></i> Light Mode
              </button>
            </div>
          </div>

          {/* ACCENT COLOR */}
          <div className="panel-section">
            <label>Brand Color</label>
            <div className="color-picker-grid">
              {colors.map(color => (
                <div 
                  key={color}
                  className={`color-dot ${accentColor === color ? 'active' : ''}`} 
                  style={{ background: color }}
                  onClick={() => setAccentColor(color)}
                >
                  {accentColor === color && <i className="ti ti-check"></i>}
                </div>
              ))}
            </div>
          </div>

          {/* CORNER RADIUS */}
          <div className="panel-section">
            <label>Element Curves</label>
            <div className="radius-list">
              {radiusOptions.map(opt => (
                <button 
                  key={opt}
                  className={`rad-opt ${radius === opt ? 'active' : ''}`}
                  onClick={() => setRadius(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="panel-footer">
          <button className="btn-reset" onClick={() => {
            setActiveMode('dark');
            setAccentColor('#50e091');
            setRadius('Soft');
          }}>Reset to Default</button>
          <button className="btn-save">Apply Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;