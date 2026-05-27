import React from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../../../utils/i18nHelpers';
import ImageBox from '../../../components/overlays/imageBox/ImageBox';

const normalizeStatus = (status = '') => status.toLowerCase().replace(/\s+/g, '');

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const ArchiveGrid = ({ items, symbol }) => {
    const { t } = useTranslation('archive');
    const { tCategory } = useI18n();

    return (
        <div className="arc-grid">
            {items.map(item => {
                const statusClass = normalizeStatus(item.status);
                const isExpense   = item._type === 'expense';
                const icon        = item.icon ? `ti ${item.icon}` : (isExpense ? 'ti ti-credit-card' : 'ti ti-plane-departure');

                return (
                    <div key={item.id} className={`arc-card status-${statusClass}`}>

                        {/* Görsel — ImageBox ile lightbox'a bağlı */}
                        <div className="arc-card-image">
                            <span className={`arc-type-badge ${item._type}`}>
                                {isExpense ? t('type_expense') : t('type_trip')}
                            </span>

                            {(item.receiptUrl || item.receipt) ? (
                                <ImageBox src={item.receiptUrl || item.receipt} alt={item.title}>
                                    <img src={item.receiptUrl || item.receipt} alt={item.title} loading="lazy" />
                                </ImageBox>
                            ) : (
                                <div className="arc-card-image-placeholder">
                                    <i className={icon} />
                                </div>
                            )}
                        </div>

                        {/* Kart gövdesi */}
                        <div className="arc-card-body">
                            <div className="arc-card-top">
                                <span className="arc-card-title">{item.title}</span>
                                <span className="arc-card-amount">
                                    {item.currencySymbol || symbol}{item.amount?.toLocaleString('tr-TR')}
                                </span>
                            </div>

                            <div className="arc-card-meta">
                                <span className="arc-card-category">
                                    {tCategory(item.category)}
                                </span>
                                {/* Seyahatlerde destinasyon göster */}
                                {item.destination && (
                                    <span className="arc-card-category">
                                        <i className="ti ti-map-pin" style={{ fontSize: '0.6rem', marginRight: '2px' }} />
                                        {item.destination}
                                    </span>
                                )}
                                {/* Harcamalarda merchant göster */}
                                {item.merchant && (
                                    <span className="arc-card-category">{item.merchant}</span>
                                )}
                            </div>

                            <div className="arc-card-footer">
                                <span className="arc-card-user">
                                    <i className="ti ti-user" />
                                    {item.createdBy?.name ?? item.user ?? '—'}
                                </span>
                                <span className="arc-card-date">{formatDate(item.date || item.startDate)}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ArchiveGrid;
