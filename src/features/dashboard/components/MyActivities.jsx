import React from 'react';
import '../dashboard.css/Activities.css';

// SOL: Status Overview Bileşeni
export const StatusOverview = ({ stats }) => {
    return (
        <div className="hm-card hm-status-grid">
            <div className="status-item">
                <div className="status-icon pending"><i className="ti ti-clock-pause"></i></div>
                <div className="status-info">
                    <span className="status-label">Beklemede</span>
                    <span className="status-value">{String(stats.pendingCount || 0).padStart(2, '0')}</span>
                </div>
            </div>
            <div className="status-item">
                <div className="status-icon trips"><i className="ti ti-plane-tilt"></i></div>
                <div className="status-info">
                    <span className="status-label">Aktif Geziler</span>
                    <span className="status-value">{String(stats.activeTrips || 0).padStart(2, '0')}</span>
                </div>
            </div>
            <div className="status-item">
                <div className="status-icon total"><i className="ti ti-receipt-2"></i></div>
                <div className="status-info">
                    <span className="status-label">Toplam Gider</span>
                    <span className="status-value">${stats.totalExpenses || 0}</span>
                </div>
            </div>
            <div className="status-item rejected">
                <div className="status-icon reject"><i className="ti ti-circle-x"></i></div>
                <div className="status-info">
                    <span className="status-label">Reddedilen</span>
                    <span className="status-value">{String(stats.rejectedCount || 0).padStart(2, '0')}</span>
                </div>
            </div>
        </div>
    );
};

// SAĞ: My Recent Activities Bileşeni
export const RecentActivities = ({ activities }) => {
    return (
        <div className="hm-card hm-recent-expenses">
            <div className="card-header">
                <h2>Son Aktivitelerim</h2>
            </div>
            <hr />
            <div className="recent-grid-header">
                <span>Konu</span>
                <span>Takım</span> 
                <span>Tür</span>
                <span>Kategori</span>
                <span className="text-right">Bilgi</span>
            </div>

            <div className="hm-recent-container custom-scroll">
                {activities && activities.length > 0 ? (
                    activities.map((item) => (
                        <div key={item.id} className="hm-recent-box">
                            <span className="col-subject" title={item.subject}>{item.subject}</span>
                            <span className="col-team-name">{item.teamName}</span>
                            <span className="col-type">{item.type}</span>
                            <span className={`badge badge-${item.category?.replace(/\s+/g, '-').toLowerCase()}`}>
                                {item.category}
                            </span>
                            <span className="col-amount">{item.amount}</span>
                        </div>
                    ))
                ) : (
                    <p className="no-data">Henüz bir aktiviteniz yok.</p>
                )}
            </div>
        </div>
    );
};