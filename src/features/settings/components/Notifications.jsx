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
        <h2>Bildirimler</h2>
        <p>Güncel kalın. Uyarıları nasıl ve ne zaman almak istediğinizi seçin.</p>
      </div>

      <div className="st-card notification-card">
        {/* Email Notifications */}
        <div className="st-toggle-row-modern">
          <div className="toggle-info">
            <div className="toggle-title-area">
                <i className="ti ti-mail"></i>
                <h4>E-posta Bildirimleri</h4>
            </div>
            <p>Günlük özetler, gider raporları ve sistem güncellemelerini e-posta yoluyla alın.</p>
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
                <h4>SMS Uyarıları</h4>
            </div>
            <p>Kritik güvenlik uyarıları ve büyük işlemler için anında mesajlar alın.</p>
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
                <h4>Push Bildirimleri</h4>
            </div>
            <p>Gerçek zamanlı etkinlik için masaüstü ve mobil tarayıcı bildirimleri.</p>
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
            <button className="st-btn-save">Değişiklikleri Kaydet</button>
        </div>
      </div>
    </div>
  );
};

export default Notification;