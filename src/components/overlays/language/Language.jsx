import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import * as Flags from 'country-flag-icons/react/3x2';
import { changeLanguage, SUPPORTED_LANGUAGES } from '../../../locales/index';
import './Language.css';

const EMOJI_MAP = { TR: '🇹🇷', GB: '🇬🇧', US: '🇺🇸' };
const FLAG_CODE = { tr: 'TR', en: 'GB' };

const FlagIcon = ({ code, className }) => {
  const Component = Flags[code];
  if (Component) return <Component className={className} />;
  return <span style={{ fontSize: '1.4em', lineHeight: 1 }}>{EMOJI_MAP[code] || '🌐'}</span>;
};

const Language = ({ isOpen, onClose }) => {
  const { i18n, t } = useTranslation('common.nav');
  const activeLang = i18n.language || 'tr';

  if (!isOpen) return null;

  const handleLangSelect = (code) => {
    changeLanguage(code);
    setTimeout(onClose, 150);
  };

  const title = t('lang_panel');

  return createPortal(
    <>
      <div className="lang-overlay" onClick={onClose} />
      <div className="lang-dropdown-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lang-modal-header">
          <span>{title}</span>
        </div>
        <div className="lang-list">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`lang-option ${activeLang === lang.code ? 'active' : ''}`}
              onClick={() => handleLangSelect(lang.code)}
            >
              <div className="lang-flag-container">
                <FlagIcon code={FLAG_CODE[lang.code] || lang.code.toUpperCase()} className="lang-svg-flag" />
              </div>
              <span className="lang-name">{lang.label}</span>
              {activeLang === lang.code && <i className="ti ti-check lang-check-icon" />}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
};

export default Language;