import React from 'react';
import '../components.css/CurrencyModal.css';

const CurrencyModal = ({ isOpen, onClose, onSelect, currentCurrency }) => {
  if (!isOpen) return null;

  const currencies = [
    { code: 'TRY', symbol: '₺' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' }
  ];

  return (
    <>
      {/* Arka plan: Dışarı tıklandığında kapanması için */}
      <div className="currency-dropdown-overlay" onClick={onClose}></div>
      
      {/* Dropdown Kutusu */}
      <div className="currency-dropdown-modal" onClick={e => e.stopPropagation()}>
        <div className="currency-modal-header">
          <span>Para Birimi Seçiniz</span>
        </div>
        
        <div className="currency-list">
          {currencies.map((curr) => (
            <button 
              key={curr.code} 
              // Aktif olan para birimine .active class'ı ekle
              className={`currency-option ${currentCurrency === curr.code ? 'active' : ''}`}
              onClick={() => {
                onSelect(curr.code);
                onClose();
              }}
            >
              <div className="currency-symbol-box">
                {curr.symbol}
              </div>
              
              <span className="curr-name">
                {curr.name} ({curr.code})
              </span>

              {/* Seçiliyse check iconu*/}
              {currentCurrency === curr.code && (
                <i className="ti ti-check"></i>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default CurrencyModal;