import React from 'react';
import '../settings.css/Notifications.css';

const Notification = ({ notifConfig, setNotifConfig }) => {
  if (!notifConfig) return null;

  const handleToggle = (key) => {
    setNotifConfig({
      ...notifConfig,
      [key]: !notifConfig[key]
    });
  };

  return (
    <div className="st-content-section">
      <div className="st-header-box">
        <h2>Notifications</h2>
        <p>Stay updated. Choose how and when you want to receive alerts.</p>
      </div>

      <div className="st-card notification-card">
        {/* Email Notifications */}
        <div className="st-toggle-row-modern">
          <div className="toggle-info">
            <div className="toggle-title-area">
                <i className="ti ti-mail"></i>
                <h4>Email Notifications</h4>
            </div>
            <p>Receive daily summaries, expense reports and system updates via email.</p>
            <span className={`status-text ${notifConfig.email ? 'on' : 'off'}`}>
                {notifConfig.email ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <label className="st-switch">
            <input 
              type="checkbox" 
              checked={notifConfig.email} 
              onChange={() => handleToggle('email')}
            />
            <span className="st-slider"></span>
          </label>
        </div>

        {/* SMS Alerts */}
        <div className="st-toggle-row-modern">
          <div className="toggle-info">
            <div className="toggle-title-area">
                <i className="ti ti-message-dots"></i>
                <h4>SMS Alerts</h4>
            </div>
            <p>Get instant text messages for critical security alerts and large transactions.</p>
            <span className={`status-text ${notifConfig.sms ? 'on' : 'off'}`}>
                {notifConfig.sms ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <label className="st-switch">
            <input 
              type="checkbox" 
              checked={notifConfig.sms} 
              onChange={() => handleToggle('sms')}
            />
            <span className="st-slider"></span>
          </label>
        </div>

        {/* Push Notifications */}
        <div className="st-toggle-row-modern">
          <div className="toggle-info">
            <div className="toggle-title-area">
                <i className="ti ti-device-mobile-message"></i>
                <h4>Push Notifications</h4>
            </div>
            <p>Desktop and mobile browser notifications for real-time activity.</p>
            <span className={`status-text ${notifConfig.push ? 'on' : 'off'}`}>
                {notifConfig.push ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <label className="st-switch">
            <input 
              type="checkbox" 
              checked={notifConfig.push} 
              onChange={() => handleToggle('push')}
            />
            <span className="st-slider"></span>
          </label>
        </div>

        <div className="notification-footer">
            <button className="st-btn-save">Save Preferences</button>
            <p>Last updated: Just now</p>
        </div>
      </div>
    </div>
  );
};

export default Notification;