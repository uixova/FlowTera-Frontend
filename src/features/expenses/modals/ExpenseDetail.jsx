import React, { memo } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import ImageBox from '../../../components/overlays/imageBox/ImageBox';
import { useImageBox } from '../../../hooks/useLightbox';
import './ExpenseDetail.css';

const InfoItem = ({ icon, label, children, full }) => (
    <div className={`ex-info-item${full ? ' full-width' : ''}`}>
        <span className="ex-label">
            <i className={`ti ${icon}`} />
            {label}
        </span>
        {children}
    </div>
);

const ExpenseDetail = ({ isOpen, onClose, data }) => {
    const { wrapSidebarClose } = useImageBox();

    if (!data) return null;

    const protectedClose = wrapSidebarClose(onClose);
    const statusKey      = data.status?.toLowerCase();

    const sidebarFooter = (
        <button className="ex-primary-btn">
            <i className="ti ti-file-download" />
            Fatura Detayını İndir
        </button>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={protectedClose}
            title={null}
            footer={sidebarFooter}
            width="480px"
        >
            <div className="ex-panel-header-image">
                <ImageBox
                    src={data.image || '/src/assets/images/receipt-placeholder.png'}
                    alt={data.title}
                >
                    <img src={data.image || '/src/assets/images/receipt-placeholder.png'} alt="Fatura" />
                    <div className="ex-header-overlay" />
                </ImageBox>
            </div>

            <div className="ex-panel-content-internal">
                <div className="ex-panel-title-section">
                    <div className="ex-type-icon">
                        <i className={`ti ${data.icon || 'ti-receipt'}`} />
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
                        <label>Durum</label>
                        <span className={`ex-status-badge ${statusKey}`}>
                            {data.status?.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="ex-rate-banner">
                    <i className="ti ti-arrows-exchange" />
                    1 {data.currency} = {data.exchangeRates?.[data.localCurrency] || data.exchangeRate} {data.localCurrency}
                </div>

                {statusKey === 'rejected' && data.rejectionReason && (
                    <div className="ex-rejection-box">
                        <div className="ex-rej-header">
                            <i className="ti ti-alert-triangle" />
                            Reddetme Sebebi
                        </div>
                        <p>{data.rejectionReason}</p>
                    </div>
                )}

                <div className="ex-divider" />

                <div className="ex-info-list">
                    <InfoItem icon="ti-user-circle" label="Gönderici">
                        <span className="ex-value">{data.user}</span>
                    </InfoItem>
                    <InfoItem icon="ti-file-analytics" label="Rapor">
                        <span className="ex-value report-tag">{data.report || 'General'}</span>
                    </InfoItem>
                    <InfoItem icon="ti-building" label="İşletme">
                        <span className="ex-value">{data.merchant}</span>
                    </InfoItem>
                    <InfoItem icon="ti-calendar-event" label="Tarih">
                        <span className="ex-value">{data.date}</span>
                    </InfoItem>
                    <InfoItem icon="ti-align-left" label="Açıklama" full>
                        <p className="ex-desc-box">{data.desc || 'Açıklama bulunmuyor.'}</p>
                    </InfoItem>
                </div>
            </div>
        </ActionSidebar>
    );
};

export default memo(ExpenseDetail);