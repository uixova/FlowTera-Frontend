import React from 'react';
import '../../components/components.css/Language.css';

const Language = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Örnek diller ve bayrakları
  const languages = [
    { code: 'TR', name: 'Türkçe', flag: 'https://flagcdn.com/w20/tr.png', active: true },
    { code: 'EN', name: 'English', flag: 'https://flagcdn.com/w20/us.png', active: false },
    { code: 'DE', name: 'Deutsch', flag: 'https://flagcdn.com/w20/de.png', active: false },
  ];

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
              className={`lang-option ${lang.active ? 'active' : ''}`}
              onClick={() => {
                console.log(`${lang.code} seçildi`);
                onClose();
              }}
            >
              <img src={lang.flag} alt={lang.name} />
              <span className="lang-name">{lang.name}</span>
              {lang.active && <i className="ti ti-check"></i>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Language;