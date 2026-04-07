import React from 'react';
import '../components.css/CurrencyModal.css';

const CurrencyModal = ({ isOpen, onClose, onSelect, currentCurrency, teamDefaultCurrency }) => {
  if (!isOpen) return null;

  const currencies = [
    { code: 'TRY', symbol: '₺' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' }
  ];

  return (
    <>
      <div className="currency-dropdown-overlay" onClick={onClose}></div>
      <div className="currency-dropdown-modal" onClick={e => e.stopPropagation()}>
        <div className="currency-modal-header">
          <span>Para Birimi Seçiniz</span>
        </div>
        <div className="currency-list">
          {currencies.map((curr) => {
            const isTeamDefault = curr.code === teamDefaultCurrency;
            const isActive = currentCurrency === curr.code;

            return (
              <button 
                key={curr.code} 
                className={`currency-option ${isActive ? 'active' : ''} ${isTeamDefault ? 'team-default-opt' : ''}`}
                onClick={() => {
                  onSelect(curr.code);
                  // Seçim yapınca bir CustomEvent fırlatıp Navbar'ı uyandırabilirsin
                  window.dispatchEvent(new CustomEvent('currencyChanged'));
                  onClose();
                }}
              >
                <div className="currency-symbol-box">{curr.symbol}</div>
                <div className="curr-info">
                  <span className="curr-name">
                    ({curr.code})
                  </span>
                  {isTeamDefault && 
                  <span className="team-default-badge">
                    Varsayılan
                  </span>}
                </div>
                {isActive && 
                <i className="ti ti-check check-icon">
                </i>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CurrencyModal;