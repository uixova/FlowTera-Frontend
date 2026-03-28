import React, { memo } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../expenses.css/ExpenseDetail.css'; 

const ExpenseDetail = ({ isOpen, onClose, data }) => {
  
  // Sadece veri yoksa render etme. 
  if (!data) return null;

  // Custom Footer: İndirme butonu
  const sidebarFooter = (
    <div className="ex-panel-footer" style={{ width: '100%', borderTop: 'none', padding: 0 }}>
      <button className="ex-primary-btn">
        <i className="ti ti-file-download"></i>
        Download Full Receipt
      </button>
    </div>
  );

  return (
    <ActionSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={null} // Resimli header'ı body içinde yöneteceğiz
      footer={sidebarFooter}
      width="480px"
    >
      {/* Header Image Area */}
      <div className="ex-panel-header-image">
        <img src={data.image || '/src/assets/images/receipt-placeholder.png'} alt="Receipt" />
        <div className="ex-header-overlay"></div>
      </div>

      <div className="ex-panel-content-internal">
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

        {/* Rejection Alert - Sadece Reddedildiyse Görünür */}
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
    </ActionSidebar>
  );
};

export default memo(ExpenseDetail);