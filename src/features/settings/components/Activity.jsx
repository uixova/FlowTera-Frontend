import React from 'react';
import '../settings.css/Activity.css';

const Activity = ({ logs }) => {
  return (
    <div className="st-content-section">
      <div className="st-header-box">
        <h2>Activity Logs</h2>
        <p>Recent actions performed by your account across Flowtera modules.</p>
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
                    <span className="log-status-badge">Success</span>
                  </div>
                  <div className="log-meta-row">
                    <span className="log-date">
                      <i className="ti ti-calendar-event"></i>
                      {new Date(log.timestamp).toLocaleString('tr-TR')}
                    </span>
                    <span className="log-device">
                      <i className="ti ti-device-laptop"></i>
                      System
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="st-empty-logs">
              <i className="ti ti-ghost"></i>
              <p>No activity recorded yet.</p>
            </div>
          )}
        </div>
        
        {logs && logs.length > 5 && (
            <button className="st-btn-load-more">Load Previous Logs</button>
        )}
      </div>
    </div>
  );
};

export default Activity;