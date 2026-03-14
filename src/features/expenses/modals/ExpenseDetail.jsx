import React from 'react';
import '../expenses.css/ExpenseDetail.css'; 

const ExpenseDetail = ({ isOpen, onClose, data }) => {
  // Panel kapalıysa veya veri yoksa null dön
  if (!data) return null;

  return (
    <div className={`ex-side-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div 
        className={`ex-side-panel-box ${isOpen ? 'open' : ''}`} 
        onClick={(e) => e.stopPropagation()}>

        {/* Üst Kısım: Görsel ve Kapatma */}
        <div className="ex-panel-header-image">
           <img src={data.image || '/src/assets/images/receipt-placeholder.png'} alt="Receipt" />
           <button className="ex-panel-close-btn" onClick={onClose}>
             <i className="ti ti-x"></i>
           </button>
        </div>

        <div className="ex-panel-content">
          <div className="ex-panel-title-section">
            <div className="ex-type-icon">
                <i className="ti ti-receipt"></i>
            </div>
            <div>
                <h3>{data.title}</h3>
                <span className="ex-panel-category">{data.category}</span>
            </div>
          </div>

          <div className="ex-panel-stats-grid">
            <div className="ex-stat-item">
              <label>Total Amount</label>
              <div className="ex-amount-section">
                <strong>{data.amount}</strong>
                <span className="ex-currency-freeze">
                  (Frozen: {data.originalAmount} @ 1 USD = {data.exchangeRate} TRY)
                </span>
              </div>
            </div>

            <div className="ex-stat-item">
                <label>Status</label>
                <span className={`ex-status-badge ${data.status?.toLowerCase()}`}>
                    {data.status}
                </span>
            </div>
          </div>
          {/* Reddedilme Nedeni Alanı - Sadece Reddedilmiş harcamalar için gösterilir */}
          {data.status?.toLowerCase() === 'rejected' && data.rejectionReason && (
            <div className="ex-rejection-area">
                <span><i className="ti ti-alert-circle"></i> Rejection Reason</span>
                <p className="ex-rejection-text">{data.rejectionReason}</p>
            </div>
          )}

          <hr className="ex-divider" />
          
          {/* Detay Bilgiler Listesi */}
          <div className="ex-details-list">
            <div className="ex-detail-row">
                <span><i className="ti ti-user"></i> Submitted By</span>
                <p>{data.user}</p>
            </div>
            <div className="ex-detail-row">
                <span><i className="ti ti-building-store"></i> Merchant</span>
                <p>{data.merchant}</p>
            </div>
            <div className="ex-detail-row">
                <span><i className="ti ti-calendar"></i> Date</span>
                <p>{data.date}</p>
            </div>
            <div className="ex-detail-row">
                <span><i className="ti ti-notes"></i> Description</span>
                <p className="ex-desc-text">{data.desc}</p>
            </div>
          </div>
        </div>
          {/* Alt Kısım: Belgeleri İndirme Butonu */}
        <div className="ex-panel-footer">
          <button className="ex-download-all-btn">
             <i className="ti ti-download"></i> Download Documents
          </button>
        </div>
      </div>
    </div>
  );
};


export default ExpenseDetail;