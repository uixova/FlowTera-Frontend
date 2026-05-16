import React, { useMemo } from 'react';
import './MyActivities.css';

/* SOL PANEL — STATUS OVERVIEW */
export const StatusOverview = ({ stats }) => {
    const items = useMemo(() => [
        {
            key:   'pending',
            icon:  'ti-clock-pause',
            type:  'pending',
            label: 'Beklemede',
            value: String(stats?.pendingCount  || 0).padStart(2, '0'),
        },
        {
            key:   'trips',
            icon:  'ti-plane-tilt',
            type:  'trip',
            label: 'Aktif Geziler',
            value: String(stats?.activeTrips   || 0).padStart(2, '0'),
        },
        {
            key:   'total',
            icon:  'ti-receipt-2',
            type:  'total',
            label: 'Toplam Gider',
            value: `$${stats?.totalExpenses    || '0.00'}`,
        },
        {
            key:   'reject',
            icon:  'ti-circle-x',
            type:  'reject',
            label: 'Reddedilen',
            value: String(stats?.rejectedCount || 0).padStart(2, '0'),
        },
    ], [stats]);

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
    const count = activities?.length ?? 0;

    return (
        <div className="hm-recent-expenses">

            {/* Başlık */}
            <div className="hm-panel-header">
                <div className="hm-panel-left">
                    <div className="hm-panel-icon">
                        <i className="ti ti-activity" aria-hidden="true" />
                    </div>
                    <h2>Son Aktivitelerim</h2>
                </div>
                {count > 0 && (
                    <span className="hm-panel-badge">{count} kayıt</span>
                )}
            </div>

            <div className="hm-divider" />

            {/* Tablo başlığı */}
            <div className="recent-grid-header" aria-hidden="true">
                <span>Konu</span>
                <span>Takım</span>
                <span>Tür</span>
                <span>Kategori</span>
                <span className="col-right">Bilgi</span>
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
                                    {item.type}
                                </span>
                                <span
                                    className={`badge badge-${item.category?.replace(/\s+/g, '-').toLowerCase()}`}
                                    title={item.category}
                                >
                                    {item.category}
                                </span>
                                <span className="col-amount">{item.amount}</span>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-data" role="status">
                        <i className="ti ti-mood-empty" aria-hidden="true" />
                        <span>Henüz bir aktiviteniz yok.</span>
                    </div>
                )}
            </div>
        </div>
    );
};