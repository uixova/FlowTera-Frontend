import React, { memo } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import ImageBox from '../../../components/modals/ImageBox';
import { useImageBox } from '../../../hooks/useLightbox';
import '../trips.css/TripDetail.css';

const TripDetail = ({ isOpen, onClose, data, onReopen }) => {
  const { handleImageToggle, wrapSidebarClose } = useImageBox();

  if (!data) return null;

  // Sidebar'ın dışarı tıklanma veya ESC ile kapanmasını korumaya al
  const protectedClose = wrapSidebarClose(onClose);

  const sidebarFooter = (
    <div className="tr-panel-footer" style={{ width: '100%', borderTop: 'none', padding: 0 }}>
      <button className="tr-action-btn primary">
        <i className="ti ti-edit"></i> Edit Trip Details
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
      {/* Header Image Area - ImageBox Entegrasyonu */}
      <div className="tr-panel-header-image">
        <ImageBox 
          src={data.image || "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop"} 
          alt={data.title}
          onToggle={(state) => {
            handleImageToggle(state); // Hook state'ini günceller
            if (state) {
              onClose(); // Resim açılınca sidebar'ı kapat
            } else {
              if (onReopen) onReopen(); // Resim kapanınca sidebar'ı geri aç
            }
          }}
        >
          <img 
            src={data.image || "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop"} 
            alt="destination" 
          />
          <div className="tr-header-overlay"></div>
        </ImageBox>
      </div>

      <div className="tr-panel-content-internal">
        <div className="tr-panel-title-section">
          <div className="tr-type-icon">
            <i className={`ti ${data.icon || 'ti-map-pin'}`}></i>
          </div>
          <div className="tr-title-text">
            <h3>{data.title}</h3>
            <span className="tr-panel-category">{data.category} • {data.date}</span>
          </div>
        </div>

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

        <div className="tr-rate-info">
          <i className="ti ti-history"></i>
          <span>Rate: 1 {data.currency} = {data.exchangeRate?.rate} {data.localCurrency}</span>
        </div>

        <hr className="tr-divider" />

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
    </ActionSidebar>
  );
};

export default memo(TripDetail);