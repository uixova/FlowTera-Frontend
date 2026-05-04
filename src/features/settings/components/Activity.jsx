import React from 'react';
import './Activity.css';

const Activity = ({ logs }) => {
  return (
    <div className="st-content-section">
      <div className="st-header-box">
        <h2>Aktivite Kayıtları</h2>
        <p>Hesabınızın Flowtera modülleri boyunca yaptığı son işlemler.</p>
      </div>

      <div className="st-card activity-card">
        <div className="st-log-list-modern">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="st-log-card">
                <div className="log-indicator"></div>
                <div className="log-info">
                  <div className="log-main-row">
                    <p className="log-action">{log.action}</p>
                    <span className="log-status-badge">Başarılı</span>
                  </div>
                  <div className="log-meta-row">
                    <span className="log-date">
                      <i className="ti ti-calendar-event"></i>
                      {new Date(log.timestamp).toLocaleString('tr-TR')}
                    </span>
                    <span className="log-device">
                      <i className="ti ti-device-laptop"></i>
                      Sistem
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="st-empty-logs">
              <i className="ti ti-ghost"></i>
              <p>Henüz bir faaliyet kaydedilmedi.</p>
            </div>
          )}
        </div>
        
        {logs && logs.length > 5 && (
            <button className="st-btn-load-more">Önceki Günlükleri Yükle</button>
        )}
      </div>
    </div>
  );
};

export default Activity;