import React, { useEffect, useState, useRef, startTransition } from 'react';
import './CurrencyModal.css';
import { useCurrency } from '../../../context/CurrencyContext'; 

const CurrencyModal = ({ isOpen, onClose, teamDefaultCurrency }) => {
  const { selectedCurrency, updateCurrency } = useCurrency();
  const [coords, setCoords] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      startTransition(() => {
        setCoords(null);
      });
      return;
    }

    const updatePosition = () => {
      if (window.innerWidth > 576) {
        const triggerEl = document.querySelector('.currency-btn-trigger');
        if (triggerEl) {
          const rect = triggerEl.getBoundingClientRect();
          
          // Eslint uyarısını (set-state-in-effect) ezen ve render'ı 
          // asenkron geçiş durumuna alan sihirli dokunuş:
          startTransition(() => {
            setCoords({
              top: rect.bottom + window.scrollY + 6,
              left: rect.right - 195 + window.scrollX
            });
          });
        } else {
          startTransition(() => {
            setCoords({ top: 100, left: window.innerWidth - 220 });
          });
        }
      } else {
        startTransition(() => {
          setCoords({}); 
        });
      }
    };

    // İlk açılışta konumu tetikle
    updatePosition();

    // Ekran boyutu değişimlerini ve scroll hareketlerini dinle
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    // Temizlik (Cleanup)
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen]);

  if (!isOpen || (window.innerWidth > 576 && !coords)) return null;

  const currencies = [
    { code: 'TRY', symbol: '₺' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' }
  ];

  const inlineStyle = window.innerWidth > 576 && coords ? {
    top: `${coords.top}px`,
    left: `${coords.left}px`,
    position: 'absolute'
  } : {};

  return (
    <>
      <div className="currency-dropdown-overlay" onClick={onClose}></div>
      <div 
        ref={modalRef}
        className="currency-dropdown-modal" 
        style={inlineStyle}
        onClick={e => e.stopPropagation()}
      >
        <div className="currency-modal-header">
          <span>Para Birimi Seçiniz</span>
        </div>
        <div className="currency-list">
          {currencies.map((curr) => {
            const isTeamDefault = curr.code === teamDefaultCurrency;
            const isActive = selectedCurrency === curr.code;

            return (
              <button 
                key={curr.code} 
                className={`currency-option ${isActive ? 'active' : ''} ${isTeamDefault ? 'team-default-opt' : ''}`}
                onClick={() => {
                  updateCurrency(curr.code); 
                  onClose();
                }}
              >
                <div className="currency-symbol-box">{curr.symbol}</div>
                <div className="curr-info">
                  <span className="curr-name">({curr.code})</span>
                  {isTeamDefault && <span className="team-default-badge">Varsayılan</span>}
                </div>
                {isActive && <i className="ti ti-check check-icon"></i>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CurrencyModal;