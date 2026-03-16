import React, { useState, useEffect, memo } from 'react';
import '../trips.css/TripDetail.css';

const TripDetail = ({ isOpen, onClose, data }) => {
    // Animasyon kontrolü için local state
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
 
  if (!data) return null;

  return (
    <div 
      className={`tr-side-panel-overlay ${isAnimate ? 'open' : ''}`}
      onClick={onClose}
    >
      <div 
        className={`tr-side-panel-box ${isAnimate ? 'open' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="tr-panel-header-image">
          <img 
            src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop" 
            alt="destination" 
          />
          <button className="tr-panel-close-btn" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div className="tr-panel-content">
          {/* Title Section */}
          <div className="tr-panel-title-section">
            <div className="tr-type-icon">
              <i className={`ti ${data.icon || 'ti-map-pin'}`}></i>
            </div>
            <div className="tr-title-text">
              <h3>{data.title}</h3>
              <span className="tr-panel-category">{data.category} • {data.date}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="tr-panel-stats-grid">
            <div className="tr-stat-item">
              <label>Estimated Cost</label>
              <div className="tr-amount-section">
                <span className="tr-amount-symbol">{data.currencySymbol}</span>
                <strong className="tr-amount-val">
                  {(Number(data.amount) || 0).toFixed(2)}
                </strong>
                <span className="tr-amount-cur">{data.currency}</span>
              </div>
              <div className="tr-currency-freeze">
                ≈ {data.localSymbol}{data.localAmount?.toLocaleString()} {data.localCurrency}
              </div>
            </div>
            <div className="tr-stat-item">
              <label>Current Status</label>
              <span className={`tr-status-badge ${data.statusClass}`}>
                {data.status}
              </span>
            </div>
          </div>

          {/* Rate Info Banner */}
          <div className="tr-rate-info">
            <i className="ti ti-history"></i>
            <span>Rate: 1 {data.currency} = {data.exchangeRate?.rate} {data.localCurrency}</span>
          </div>

          <hr className="tr-divider" />

          {/* Detail Rows */}
          <div className="tr-detail-row">
            <span><i className="ti ti-map-2"></i> Destination</span>
            <p>{data.destination}</p>
          </div>

          <div className="tr-detail-row">
            <span><i className="ti ti-car"></i> Vehicle & Duration</span>
            <p>{data.vehicle} • {data.duration}</p>
          </div>

          <div className="tr-detail-row">
            <span><i className="ti ti-notes"></i> Trip Description</span>
            <p className="tr-desc-text">{data.desc || "No additional notes."}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="tr-panel-footer">
          <button className="tr-action-btn primary">
            <i className="ti ti-edit"></i> Edit Trip Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(TripDetail);