import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../../../utils/i18nHelpers';
import './MyActivities.css';

/* SOL PANEL — STATUS OVERVIEW */
export const StatusOverview = ({ stats }) => {
    const { t } = useTranslation('dashboard.overview');

    const items = useMemo(() => [
        {
            key:   'pending',
            icon:  'ti-clock-pause',
            type:  'pending',
            label: t('pending_count'),
            value: String(stats?.pendingCount  || 0).padStart(2, '0'),
        },
        {
            key:   'trips',
            icon:  'ti-plane-tilt',
            type:  'trip',
            label: t('active_trips'),
            value: String(stats?.activeTrips   || 0).padStart(2, '0'),
        },
        {
            key:   'total',
            icon:  'ti-receipt-2',
            type:  'total',
            label: t('total_expenses'),
            value: `$${stats?.totalExpenses    || '0.00'}`,
        },
        {
            key:   'reject',
            icon:  'ti-circle-x',
            type:  'reject',
            label: t('rejected'),
            value: String(stats?.rejectedCount || 0).padStart(2, '0'),
        },
    ], [stats, t]);

    return (
        <div className="hm-status-grid">
            {items.map((item) => (
                <div key={item.key} className="status-item">
                    <div className="status-top-row">
                        <div className={`status-icon ${item.type}`}>
                            <i className={`ti ${item.icon}`} aria-hidden="true" />
                        </div>
                    </div>
                    <div className="status-info">
                        <span className="status-value">{item.value}</span>
                        <span className="status-label">{item.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

/* SAĞ PANEL — RECENT ACTIVITIES */
export const RecentActivities = ({ activities }) => {
    const { t } = useTranslation('dashboard.activities');
    const { tCategory, tTripCategory } = useI18n();
    const count = activities?.length ?? 0;

    return (
        <div className="hm-recent-expenses">

            {/* Başlık */}
            <div className="hm-panel-header">
                <div className="hm-panel-left">
                    <div className="hm-panel-icon">
                        <i className="ti ti-activity" aria-hidden="true" />
                    </div>
                    <h2>{t('my_activities')}</h2>
                </div>
                {count > 0 && (
                    <span className="hm-panel-badge">{count}</span>
                )}
            </div>

            <div className="hm-divider" />

            {/* Tablo başlığı */}
            <div className="recent-grid-header" aria-hidden="true">
                <span>{t('col_subject', 'Konu')}</span>
                <span>{t('col_team', 'Takım')}</span>
                <span>{t('col_type', 'Tür')}</span>
                <span>{t('col_category', 'Kategori')}</span>
                <span className="col-right">{t('col_info', 'Bilgi')}</span>
            </div>

            {/* Satırlar */}
            <div className="hm-recent-container custom-scroll" role="list">
                {count > 0 ? (
                    activities.map((item) => {
                        const isTrip = item.type?.toLowerCase() === 'trip';
                        return (
                            <div key={item.id} className="hm-recent-box" role="listitem">
                                <span className="col-subject" title={item.subject}>
                                    {item.subject}
                                </span>
                                <span className="col-team-name" title={item.teamName}>
                                    {item.teamName}
                                </span>
                                <span className={`col-type ${isTrip ? 'trip' : 'expense'}`}>
                                    {isTrip ? t('type_trip') : t('type_expense')}
                                </span>
                                <span
                                    className={`badge badge-${item.category?.replace(/\s+/g, '-').toLowerCase()}`}
                                    title={isTrip ? tTripCategory(item.category) : tCategory(item.category)}
                                >
                                    {isTrip ? tTripCategory(item.category) : tCategory(item.category)}
                                </span>
                                <span className="col-amount">{item.amount}</span>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-data" role="status">
                        <i className="ti ti-mood-empty" aria-hidden="true" />
                        <span>{t('no_activities')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};