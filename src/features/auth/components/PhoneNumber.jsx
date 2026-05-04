import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePhoneCountry } from '../hook/usePhoneCountry';
import Flags from 'country-flag-icons/react/3x2';
import './PhoneNumber.css';

const FlagIcon = ({ code, className }) => {
  const Component = Flags[code];
  return Component ? <Component className={className} /> : <span>🌐</span>;
};

const PhoneNumber = ({ value = '', onChange, error, placeholder = '5xx xxx xx xx' }) => {
  const { countries, defaultCountry } = usePhoneCountry();
  const [selected, setSelected] = useState(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [localNum, setLocalNum] = useState(value.replace(/^\+\d+\s?/, ''));

  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 60);
  }, [isOpen]);

  const emitChange = useCallback((country, num) => {
    const trimmed = num.trim();
    onChange?.(trimmed ? `${country.dial} ${trimmed}` : '');
  }, [onChange]);

  const handleNumberInput = (e) => {
    const raw = e.target.value.replace(/[^\d\s-]/g, '');
    setLocalNum(raw);
    emitChange(selected, raw);
  };

  const handleSelect = (country) => {
    setSelected(country);
    setIsOpen(false);
    setSearch('');
    emitChange(country, localNum);
  };

  const filtered = search.trim()
    ? countries.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.dial.includes(search) || 
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  return (
    <div className={`pn-root ${error ? 'pn-has-error' : ''}`} ref={wrapRef}>
      <div className={`pn-input-row ${isOpen ? 'pn-focused' : ''}`}>
        <button
          type="button"
          className="pn-trigger"
          onClick={() => setIsOpen((v) => !v)}
        >
          <div className="pn-flag-container">
            <FlagIcon code={selected.code} className="pn-svg-flag" />
          </div>
          <span className="pn-dial">{selected.dial}</span>
          <svg className={`pn-chevron ${isOpen ? 'pn-chevron-open' : ''}`} width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="pn-divider" />
        <input
          className="pn-number-input"
          type="tel"
          value={localNum}
          onChange={handleNumberInput}
          placeholder={placeholder}
          autoComplete="tel-national"
        />
      </div>

      {isOpen && (
        <div className="pn-dropdown">
          <div className="pn-search-wrap">
            <input
              ref={searchRef}
              className="pn-search"
              type="text"
              placeholder="Ülke ara…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="pn-list">
            {filtered.length === 0 ? (
              <li className="pn-no-result">Sonuç bulunamadı</li>
            ) : (
              filtered.map((c) => (
                <li
                  key={`${c.code}-${c.dial}`}
                  className={`pn-option ${selected.code === c.code ? 'pn-option-active' : ''}`}
                  onMouseDown={() => handleSelect(c)}
                >
                  <FlagIcon code={c.code} className="pn-opt-svg-flag" />
                  <span className="pn-opt-name">{c.name}</span>
                  <span className="pn-opt-dial">{c.dial}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && (
        <small className="pn-error">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </small>
      )}
    </div>
  );
};

export default PhoneNumber;