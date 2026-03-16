import React, { useState, useEffect, memo } from 'react';
import '../expenses.css/ExpenseDetail.css'; 

const ExpenseDetail = ({ isOpen, onClose, data }) => {
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
      let timer;
      if (isOpen) {
        // 10ms gecikme React'ın render kuyruğunu rahatlatır.
        timer = setTimeout(() => setIsAnimate(true), 10);
      } else {
        // Kapanışta animasyonun düzgün çalışması için hemen false yapmıyoruz.
        Promise.resolve().then(() => setIsAnimate(false));
      }
      return () => clearTimeout(timer);
    }, [isOpen]);

  // Sadece veri yoksa render etme. 
  // isOpen false olsa bile hemen 'null' dönmüyoruz ki kapanış animasyonu çalışabilsin.
  if (!data) return null;

  return (
    <div 
      className={`ex-side-panel-overlay ${isAnimate ? 'open' : ''}`} 
      onClick={onClose}
    >
      <div 
        className={`ex-side-panel-box ${isAnimate ? 'open' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="ex-panel-header-image">
          <img src={data.image || '/src/assets/images/receipt-placeholder.png'} alt="Receipt" />
          <div className="ex-header-overlay"></div>
          <button className="ex-panel-close-btn" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="ex-panel-content">
          {/* Title Section */}
          <div className="ex-panel-title-section">
            <div className="ex-type-icon">
              <i className={`ti ${data.icon || 'ti-receipt'}`}></i>
            </div>
            <div>
              <h3>{data.title}</h3>
              <span className="ex-panel-category">{data.category}</span>
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="ex-financial-card">
            <div className="ex-amount-group">
              <label>Total Amount</label>
              <div className="ex-main-price">
                <span className="ex-price-symbol">{data.currencySymbol}</span>
                <span className="ex-price-val">{(data.amount || 0).toFixed(2)}</span>
                <span className="ex-price-cur">{data.currency}</span>
              </div>
              <div className="ex-local-conv">
                ≈ {data.localSymbol}{data.localAmount?.toLocaleString()} {data.localCurrency}
              </div>
            </div>
            
            <div className="ex-status-group">
              <label>Status</label>
              <span className={`ex-status-badge ${data.status?.toLowerCase()}`}>
                {data.status?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Rate Info Banner */}
          <div className="ex-rate-banner">
            <i className="ti ti-history"></i>
            <span>Rate: 1 {data.currency} = {data.exchangeRate} {data.localCurrency}</span>
          </div>

          {data.status === 'rejected' && (
            <div className="ex-rejection-box">
              <div className="ex-rej-header">
                <i className="ti ti-alert-triangle"></i>
                <span>Rejection Reason</span>
              </div>
              <p>{data.rejectionReason}</p>
            </div>
          )}

          <hr className="ex-divider" />

          {/* Info List */}
          <div className="ex-info-list">
            <div className="ex-info-item">
              <span className="ex-label"><i className="ti ti-user-circle"></i> Submitter</span>
              <span className="ex-value">{data.user}</span>
            </div>
            <div className="ex-info-item">
              <span className="ex-label"><i className="ti ti-file-analytics"></i> Report</span>
              <span className="ex-value report-tag">{data.report || 'General'}</span>
            </div>
            <div className="ex-info-item">
              <span className="ex-label"><i className="ti ti-building"></i> Merchant</span>
              <span className="ex-value">{data.merchant}</span>
            </div>
            <div className="ex-info-item">
              <span className="ex-label"><i className="ti ti-calendar-event"></i> Date</span>
              <span className="ex-value">{data.date}</span>
            </div>
            <div className="ex-info-item full-width">
              <span className="ex-label"><i className="ti ti-align-left"></i> Description</span>
              <p className="ex-desc-box">{data.desc || "Açıklama bulunmuyor."}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ex-panel-footer">
          <button className="ex-primary-btn">
            <i className="ti ti-file-download"></i>
            Download Full Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ExpenseDetail);