import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { useI18n } from '../../../utils/i18nHelpers';
import i18n from '../../../locales/i18n';
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
    const { t } = useTranslation('trips.detail');
    const { t: tBtn } = useTranslation('common.buttons');
    const { t: tList } = useTranslation('trips.list');
    const { tTripCategory, tStatus, tVehicle } = useI18n();

    if (!data) return null;

    const statusKey = data.statusClass?.toLowerCase() || data.status?.toLowerCase();

    const sidebarFooter = (
        <button className="tr-primary-btn">
            <i className="ti ti-file-download" />
            {t('download_btn')}
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
                            {tTripCategory(data.category)} · {data.date}
                        </span>
                    </div>
                </div>

                <div className="tr-financial-card">
                    <div>
                        <label>{t('financial_record')}</label>
                        <div className="tr-main-price">
                            <span className="tr-price-symbol">{data.currencySymbol}</span>
                            <span className="tr-price-val">
                                {(Number(data.amount) || 0).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="tr-price-cur">{data.currency}</span>
                        </div>
                        {data.localCurrency && data.localAmount != null && (
                            <div className="tr-local-conv">
                                {t('paid_label')}: {data.localSymbol}{data.localAmount?.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')} {data.localCurrency}
                            </div>
                        )}
                    </div>
                    <div className="tr-status-group">
                        <label>{t('current_status')}</label>
                        <span className={`tr-status-badge ${statusKey}`}>
                            {tStatus(statusKey || data.status || '')}
                        </span>
                    </div>
                </div>

                {(data.exchangeRates?.[data.localCurrency] || data.exchangeRate?.rate) && data.localCurrency && (
                    <div className="tr-rate-banner">
                        <i className="ti ti-arrows-exchange" />
                        1 {data.currency} = {data.exchangeRates?.[data.localCurrency] || data.exchangeRate?.rate} {data.localCurrency}
                    </div>
                )}

                {statusKey === 'rejected' && data.rejectionReason && (
                    <div className="tr-rejection-box">
                        <div className="tr-rej-header">
                            <i className="ti ti-alert-triangle" />
                            {t('rejection_reason')}
                        </div>
                        <p>{i18n.language === 'en' && data.rejectionReasonEn ? data.rejectionReasonEn : data.rejectionReason}</p>
                    </div>
                )}

                <div className="tr-divider" />

                <div className="tr-info-list">
                    <TrInfoItem icon="ti-map-2" label={t('destination_label')}>
                        <span className="tr-value">{data.destination}</span>
                    </TrInfoItem>
                    <TrInfoItem icon="ti-clock" label={t('date_range_label')}>
                        <span className="tr-value">{data.startDate} — {data.endDate}</span>
                    </TrInfoItem>
                    <TrInfoItem icon="ti-car" label={t('vehicle_label')}>
                        <span className="tr-value">{tVehicle(data.vehicle)}</span>
                    </TrInfoItem>
                    <TrInfoItem icon="ti-hourglass" label={t('duration_label')}>
                        <span className="tr-value">
                            {(() => {
                                const n = parseInt(data.duration, 10);
                                return isNaN(n) ? data.duration : `${n} ${tList('days')}`;
                            })()}
                        </span>
                    </TrInfoItem>
                    <TrInfoItem icon="ti-notes" label={t('desc_label')} full>
                        <p className="tr-desc-box">{data.desc || t('no_desc')}</p>
                    </TrInfoItem>
                </div>

            </div>
        </ActionSidebar>
    );
};

export default memo(TripDetail);
