import React, { useState } from 'react';
import './ThemeModal.css';
import { useSubscription } from '../../../context/SubscriptionContext';

const ThemeModal = ({ isOpen, onClose }) => {
  const { hasFeature } = useSubscription();
  
  const [activeMode, setActiveMode] = useState('dark');
  const [accentColor, setAccentColor] = useState('#50e091');
  const [radius, setRadius] = useState('Yumuşak');

  const colors = [
    '#50e091', '#0ed45a', '#3a86ff', '#8338ec', 
    '#ff006e', '#fb5607', '#ffbe0b', '#8cbed1'
  ];

  // Kısıtlama Kontrolü
  const isAdvancedThemeEnabled = hasFeature('theme_management');

  return (
    <div className={`panel-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className={`side-panel ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        
        <div className="panel-header">
          <div className="header-text">
            <h3>Görünüm Ayarları</h3>
            <p>Sistemi kendine göre özelleştir</p>
          </div>
          <button className="panel-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="panel-body">
          {/* TEMA SEÇİMİ - Herkes yapabilir */}
          <div className="panel-section">
            <label>Arayüz Modu</label>
            <div className="mode-selection-grid">
              <div 
                className={`mode-card ${activeMode === 'dark' ? 'active' : ''}`}
                onClick={() => setActiveMode('dark')}
              >
                <div className="mode-preview-box dark-preview"></div>
                <span>Koyu Tema</span>
              </div>
              <div 
                className={`mode-card ${activeMode === 'light' ? 'active' : ''}`}
                onClick={() => setActiveMode('light')}
              >
                <div className="mode-preview-box light-preview"></div>
                <span>Açık Tema</span>
              </div>
            </div>
          </div>

          {/* GELİŞMİŞ AYARLAR - Sadece Professional+ */}
          <div className={`advanced-theme-settings ${!isAdvancedThemeEnabled ? 'locked-feature' : ''}`}>
            {!isAdvancedThemeEnabled && (
                <div className="lock-overlay">
                    <i className="ti ti-lock"></i>
                    <span>Bu ayarlar Professional plan gerektirir</span>
                </div>
            )}

            {/* RENK SEÇİMİ */}
            <div className="panel-section">
              <label>Vurgu Rengi</label>
              <div className="color-picker-grid">
                {colors.map(c => (
                  <div 
                    key={c}
                    className={`color-dot ${accentColor === c ? 'active' : ''}`} 
                    style={{ background: c }}
                    onClick={() => isAdvancedThemeEnabled && setAccentColor(c)}
                  >
                    {accentColor === c && <i className="ti ti-check" style={{color: '#fff'}}></i>}
                  </div>
                ))}
              </div>
            </div>

            {/* RADIUS */}
            <div className="panel-section">
              <label>Kenar Yapısı</label>
              <div className="radius-list-modern">
                {['Keskin', 'Yumuşak', 'Oval', 'Tam'].map(r => (
                  <button 
                    key={r}
                    className={`rad-btn ${radius === r ? 'active' : ''}`}
                    onClick={() => isAdvancedThemeEnabled && setRadius(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button className="btn-reset-plain" onClick={() => {
            setActiveMode('dark');
            setAccentColor('#50e091');
            setRadius('Yumuşak');
          }}>Sıfırla</button>
          <button className="btn-apply" onClick={onClose}>Değişiklikleri Uygula</button>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;