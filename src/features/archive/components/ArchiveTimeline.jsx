import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../../../utils/i18nHelpers';
import ImageBox from '../../../components/overlays/imageBox/ImageBox';

// Handles ISO 8601 and legacy DD/MM/YYYY
const toDate = (dateStr = '') => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

const formatGroupLabel = (dateStr) => {
    const d = toDate(dateStr);
    if (!d) return dateStr;
    return d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
};

const formatDisplayDate = (dateStr) => {
    const d = toDate(dateStr);
    if (!d) return dateStr;
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Status normalize
const normalizeStatus = (status = '') =>
    status.toLowerCase().replace(/\s+/g, '');

const ArchiveTimeline = ({ items, symbol }) => {
    const { t } = useTranslation('archive');
    const { tCategory, tStatus } = useI18n();

    const groups = useMemo(() => {
        const map = new Map();
        items.forEach(item => {
            const label = formatGroupLabel(item.date || item.startDate);
            if (!map.has(label)) map.set(label, []);
            map.get(label).push(item);
        });
        return Array.from(map.entries());
    }, [items]);

    return (
        <div className="arc-timeline">
            {groups.map(([groupLabel, groupItems]) => (
                <div key={groupLabel} className="arc-timeline-group">

                    {/* Tarih başlığı */}
                    <div className="arc-timeline-date-header">
                        <span className="arc-timeline-date-label">{groupLabel}</span>
                        <div className="arc-timeline-date-line" />
                        <span className="arc-timeline-date-label">{groupItems.length} {t('record_label')}</span>
                    </div>

                    {/* O aya ait kayıtlar */}
                    <div className="arc-timeline-items">
                        {groupItems.map(item => {
                            const isExpense   = item._type === 'expense';
                            const statusClass = normalizeStatus(item.status);
                            const icon        = item.icon
                                ? `ti ${item.icon}`
                                : (isExpense ? 'ti ti-credit-card' : 'ti ti-plane-departure');

                            return (
                                <div
                                    key={item.id}
                                    className={`arc-row status-${statusClass}`}
                                >
                                    {/* İkon */}
                                    <div className="arc-row-icon">
                                        <i className={icon} />
                                    </div>

                                    {/* Başlık + alt bilgi */}
                                    <div className="arc-row-info">
                                        <div className="arc-row-title">{item.title}</div>
                                        <div className="arc-row-sub">
                                            {/* Harcama: merchant */}
                                            {item.merchant && (
                                                <span>
                                                    <i className="ti ti-building-store" />
                                                    {item.merchant}
                                                </span>
                                            )}
                                            {/* Seyahat: destinasyon */}
                                            {item.destination && (
                                                <span>
                                                    <i className="ti ti-map-pin" />
                                                    {item.destination}
                                                </span>
                                            )}
                                            {/* Oluşturan */}
                                            <span>
                                                <i className="ti ti-user" />
                                                {item.createdBy?.name ?? item.user ?? '—'}
                                            </span>
                                            {/* Kategori */}
                                            {item.category && (
                                                <span>
                                                    <i className="ti ti-tag" />
                                                    {tCategory(item.category)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tip badge */}
                                    <span className={`arc-row-type ${item._type}`}>
                                        {isExpense ? t('type_expense') : t('type_trip')}
                                    </span>

                                    {/* Tutar */}
                                    <div className="arc-row-amount">
                                        {item.currencySymbol || symbol}
                                        {item.amount?.toLocaleString('tr-TR')}
                                    </div>

                                    {/* Durum + tarih */}
                                    <div className="arc-row-status">
                                        <span className={`arc-status-dot ${statusClass}`}>
                                            {tStatus(item.status)}
                                        </span>
                                        <span className="arc-row-date">
                                            {formatDisplayDate(item.date || item.startDate)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ArchiveTimeline;
