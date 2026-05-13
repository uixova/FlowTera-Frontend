import React, { memo } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import './TripDetail.css';

const TrInfoItem = ({ icon, label, children, full }) => (
    <div className={`tr-info-item-detail${full ? ' full-width' : ''}`}>
        <span className="tr-label">
            <i className={`ti ${icon}`} />
            {label}
        </span>
        {children}
    </div>
);

const TripDetail = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    const statusKey = data.statusClass?.toLowerCase() || data.status?.toLowerCase();

    const sidebarFooter = (
        <button className="tr-primary-btn">
            <i className="ti ti-file-download" />
            Gezi Detaylarını İndir
        </button>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={null}
            footer={sidebarFooter}
            width="480px"
        >
            <div className="tr-panel-content-internal">

                <div className="tr-panel-title-section">
                    <div className="tr-type-icon">
                        <i className={`ti ${data.icon || 'ti-plane-departure'}`} />
                    </div>
                    <div>
                        <h3>{data.title}</h3>
                        <span className="tr-panel-category">
                            {data.category} · {data.date}
                        </span>
                    </div>
                </div>

                <div className="tr-financial-card">
                    <div>
                        <label>Mali Kayıt Tutarı</label>
                        <div className="tr-main-price">
                            <span className="tr-price-symbol">{data.currencySymbol}</span>
                            <span className="tr-price-val">
                                {(Number(data.amount) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="tr-price-cur">{data.currency}</span>
                        </div>
                        <div className="tr-local-conv">
                            Ödenen: {data.localSymbol}{data.localAmount?.toLocaleString('tr-TR')} {data.localCurrency}
                        </div>
                    </div>
                    <div className="tr-status-group">
                        <label>Mevcut Durum</label>
                        <span className={`tr-status-badge ${statusKey}`}>
                            {data.status}
                        </span>
                    </div>
                </div>

                <div className="tr-rate-banner">
                    <i className="ti ti-arrows-exchange" />
                    1 {data.currency} = {data.exchangeRates?.[data.localCurrency] || data.exchangeRate?.rate} {data.localCurrency}
                </div>

                {/* REDDETME SEBEBİ BURAYA EKLENDİ */}
                {statusKey === 'rejected' && data.rejectionReason && (
                    <div className="tr-rejection-box">
                        <div className="tr-rej-header">
                            <i className="ti ti-alert-triangle" />
                            Reddetme Sebebi
                        </div>
                        <p>{data.rejectionReason}</p>
                    </div>
                )}

                <div className="tr-divider" />

                <div className="tr-info-list">
                    <TrInfoItem icon="ti-map-2" label="Varış Noktası">
                        <span className="tr-value">{data.destination}</span>
                    </TrInfoItem>
                    <TrInfoItem icon="ti-clock" label="Tarih Aralığı">
                        <span className="tr-value">{data.startDate} — {data.endDate}</span>
                    </TrInfoItem>
                    <TrInfoItem icon="ti-car" label="Araç">
                        <span className="tr-value">{data.vehicle}</span>
                    </TrInfoItem>
                    <TrInfoItem icon="ti-hourglass" label="Süre">
                        <span className="tr-value">{data.duration}</span>
                    </TrInfoItem>
                    <TrInfoItem icon="ti-notes" label="Gezi Açıklaması" full>
                        <p className="tr-desc-box">{data.desc || 'Ek not yok.'}</p>
                    </TrInfoItem>
                </div>

            </div>
        </ActionSidebar>
    );
};

export default memo(TripDetail);