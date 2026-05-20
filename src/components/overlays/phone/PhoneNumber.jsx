import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePhoneCountry } from '../../../hooks/usePhoneCountry';
import Flags from 'country-flag-icons/react/3x2';
import './PhoneNumber.css';

const FlagIcon = ({ code, className }) => {
  const Component = Flags[code];
  return Component ? <Component className={className} /> : <span>🌐</span>;
};

const formatPhoneNumber = (raw, format) => {
  const digits = raw.replace(/\D/g, '');
  if (!format) return digits;
  
  let result = '';
  let digitIndex = 0;
  
  for (let i = 0; i < format.length && digitIndex < digits.length; i++) {
    const char = format[i];
    if (char === '#') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += char;
    }
  }
  
  return result;
};

const getPlaceholderFromFormat = (format) => {
  if (!format) return '5xx xxx xx xx';
  return format.replace(/#/g, 'x');
};

const PhoneNumber = ({ value = '', onChange, error, authMode = false }) => {
  const { countries, defaultCountry } = usePhoneCountry();
  const [selected, setSelected] = useState(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Dropdown'ın ekrandaki yerini tutacak state
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const getLocalNum = (val, country) => {
    const rawDigits = val.replace(/\D/g, '');
    if (val) {
      const withoutDial = rawDigits.replace(new RegExp(`^${country.dial.replace(/\D/g, '')}`), '');
      return formatPhoneNumber(withoutDial, country.format);
    }
    return '';
  };

  const [localNum, setLocalNum] = useState(() => getLocalNum(value, defaultCountry));
  const [isUp, setIsUp] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const searchRef = useRef(null);

  // Portal için konum hesaplama fonksiyonu
  const updateDropdownPosition = useCallback(() => {
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const computedIsUp = spaceBelow < 280;
      
      setIsUp(computedIsUp);
      
      setCoords({
        // Eğer yukarı doğru açılacaksa inputun üst çizgisinden yukarı taşırız, aşağıysa altından başlatırız
        top: computedIsUp 
          ? rect.top + window.scrollY 
          : rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  // Dropdown açıkken pencere kaydırılırsa veya boyutu değişirse pozisyonu güncelle
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true); // capture: true modal/scroll içi durumlar için iyi olur
    }
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        // Eğer tıklanan yer açılan portal dropdown'ının içindeyse kapatma
        if (e.target.closest('.pn-dropdown')) return;
        
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
    const cursorPos = e.target.selectionStart;
    const oldValue = localNum;
    const raw = e.target.value.replace(/[^\d]/g, '');
    
    const formatted = formatPhoneNumber(raw, selected.format);
    setLocalNum(formatted);
    emitChange(selected, formatted);
    
    setTimeout(() => {
      if (inputRef.current) {
        let newCursorPos = cursorPos;
        if (formatted.length > oldValue.length) {
          newCursorPos += (formatted.length - oldValue.length);
        }
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleSelect = (country) => {
    setSelected(country);
    setIsOpen(false);
    setSearch('');
    
    const currentDigits = localNum.replace(/\D/g, '');
    const formatted = formatPhoneNumber(currentDigits, country.format);
    setLocalNum(formatted);
    emitChange(country, formatted);
  };

  const filtered = search.trim()
    ? countries.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.dial.includes(search) || 
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  const dynamicPlaceholder = getPlaceholderFromFormat(selected.format);

  return (
    <div className={`pn-root ${error ? 'pn-has-error' : ''} ${authMode ? 'pn-auth-mode' : ''}`} ref={wrapRef}>
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
          ref={inputRef}
          className="pn-number-input"
          type="tel"
          value={localNum}
          onChange={handleNumberInput}
          placeholder={dynamicPlaceholder}
          autoComplete="tel-national"
        />
      </div>

      {/* PORTAL BURADA BAŞLIYOR */}
      {isOpen && createPortal(
        <div 
          className={`pn-dropdown ${isUp ? 'open-up' : ''}`}
          style={{
            position: 'absolute',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            zIndex: 9999 // Üstte kalması için yüksek bir z-index
          }}
        >
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
        </div>,
        document.body // DOM'da direkt body'nin altına ışınlıyoruz
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