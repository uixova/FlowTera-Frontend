import React, { memo } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import ImageBox from '../../../components/modals/ImageBox'; 
import { useImageBox } from '../../../hooks/useLightbox'; 
import '../expenses.css/ExpenseDetail.css'; 

const ExpenseDetail = ({ isOpen, onClose, data, onReopen }) => {
  const { wrapSidebarClose } = useImageBox();

  if (!data) return null;
  const protectedClose = wrapSidebarClose(onClose);

  const sidebarFooter = (
    <div className="ex-panel-footer" style={{ width: '100%', borderTop: 'none', padding: 0 }}>
      <button className="ex-primary-btn">
        <i className="ti ti-file-download"></i>
        Fatura Detayını İndir
      </button>
    </div>
  );

  return (
    <ActionSidebar
      isOpen={isOpen}
      onClose={protectedClose} 
      title={null}
      footer={sidebarFooter}
      width="480px"
    >
      {/* Header Image Area - ImageBox ile sarmalandı */}
      <div className="ex-panel-header-image">
        <ImageBox 
          src={data.image || '/src/assets/images/receipt-placeholder.png'} 
          alt={data.title}
          // Resim açılınca sidebar'ı kapat (onClose tetiklenir)
          onToggle={(state) => {
            if (state) {
              // Resim açıldı, sidebar'ı kapat
              onClose(); 
            } else {
              // Resim kapandı, sidebar'ı tekrar açan fonksiyonu tetikle
              if (onReopen) onReopen(); 
            }
          }}
        >
          {/* Sidebar içindeki tetikleyici görsel */}
          <img src={data.image || '/src/assets/images/receipt-placeholder.png'} alt="Receipt" />
          <div className="ex-header-overlay"></div>
        </ImageBox>
      </div>

      <div className="ex-panel-content-internal">
        <div className="ex-panel-title-section">
          <div className="ex-type-icon">
            <i className={`ti ${data.icon || 'ti-receipt'}`}></i>
          </div>
          <div>
            <h3>{data.title}</h3>
            <span className="ex-panel-category">{data.category}</span>
          </div>
        </div>

        <div className="ex-financial-card">
          <div className="ex-amount-group">
            <label>Toplam Miktar</label>
            <div className="ex-main-price">
              <span className="ex-price-symbol">{data.currencySymbol}</span>
              <span className="ex-price-val">{(data.amount || 0).toFixed(2)}</span>
              <span className="ex-price-cur">{data.currency}</span>
            </div>
            <div className="ex-local-conv">
              Ödenen: {data.localSymbol}{data.localAmount?.toLocaleString('tr-TR')} {data.localCurrency}
            </div>
          </div>
          
          <div className="ex-status-group">
            <label>İşlem Durumu</label>
            <span className={`ex-status-badge ${data.status?.toLowerCase()}`}>
              {data.status?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="ex-rate-banner">
          <i className="ti ti-history"></i>
          İşlem Kuru: 1 {data.currency} = {data.exchangeRates?.[data.localCurrency] || data.exchangeRate} {data.localCurrency}
        </div>

        {data.status === 'rejected' && (
          <div className="ex-rejection-box">
            <div className="ex-rej-header">
              <i className="ti ti-alert-triangle"></i>
              <span>Reddetme Sebebi</span>
            </div>
            <p>{data.rejectionReason}</p>
          </div>
        )}

        <hr className="ex-divider" />

        <div className="ex-info-list">
          <div className="ex-info-item">
            <span className="ex-label"><i className="ti ti-user-circle"></i> Gönderici</span>
            <span className="ex-value">{data.user}</span>
          </div>
          <div className="ex-info-item">
            <span className="ex-label"><i className="ti ti-file-analytics"></i> Rapor</span>
            <span className="ex-value report-tag">{data.report || 'General'}</span>
          </div>
          <div className="ex-info-item">
            <span className="ex-label"><i className="ti ti-building"></i> İşletme</span>
            <span className="ex-value">{data.merchant}</span>
          </div>
          <div className="ex-info-item">
            <span className="ex-label"><i className="ti ti-calendar-event"></i> Tarih</span>
            <span className="ex-value">{data.date}</span>
          </div>
          <div className="ex-info-item full-width">
            <span className="ex-label"><i className="ti ti-align-left"></i> Açıklama</span>
            <p className="ex-desc-box">{data.desc || "Açıklama bulunmuyor."}</p>
          </div>
        </div>
      </div>
    </ActionSidebar>
  );
};

export default memo(ExpenseDetail);