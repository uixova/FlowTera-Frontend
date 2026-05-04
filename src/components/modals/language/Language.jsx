import React, { useState } from 'react';
import Flags from 'country-flag-icons/react/3x2';
import './Language.css';

const FlagIcon = ({ code, className }) => {
  const Component = Flags[code];
  return Component ? <Component className={className} /> : <span>🌐</span>;
};

const Language = ({ isOpen, onClose }) => {
  const [selectedLang, setSelectedLang] = useState('TR');

  if (!isOpen) return null;

  const languages = [
    { code: 'TR', name: 'Türkçe' },
    { code: 'US', name: 'English' },
    { code: 'DE', name: 'Deutsch' },
  ];

  const handleLangSelect = (code) => {
    setSelectedLang(code); // State'i güncelle
    console.log(`${code} seçildi`);
    
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <>
      <div className="lang-overlay" onClick={onClose}></div>
      <div className="lang-dropdown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lang-modal-header">
          <span>Dil Seç</span>
        </div>
        <div className="lang-list">
          {languages.map((lang) => (
            <button 
              key={lang.code} 
              className={`lang-option ${selectedLang === lang.code ? 'active' : ''}`}
              onClick={() => handleLangSelect(lang.code)}
            >
              <div className="lang-flag-container">
                <FlagIcon code={lang.code} className="lang-svg-flag" />
              </div>
              <span className="lang-name">{lang.name}</span>
              
              {selectedLang === lang.code && <i className="ti ti-check"></i>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Language;