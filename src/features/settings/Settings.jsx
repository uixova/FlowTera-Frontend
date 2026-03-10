import React, { useState, useEffect } from 'react';
import './settings.css/Settings.css'; 

const Settings = () => {
  // Aktif sekmeyi tutan state
  const [activeSection, setActiveSection] = useState('st-profile');

  useEffect(() => {
    // Sayfa açıldığında app-container'ı bul ve class ekle
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.add('no-padding');
    }

    // Sayfadan çıkıldığında (component unmount) class'ı temizle
    return () => {
      if (appContainer) {
        appContainer.classList.remove('no-padding');
      }
    };
  }, []);

  // Menü öğeleri dizisi (Kod tekrarını önlemek için)
  const menuItems = [
    { id: 'st-profile', label: 'Profile Details', icon: 'ti-user-circle' },
    { id: 'st-security', label: 'Security & Privacy', icon: 'ti-lock' },
    { id: 'st-logs', label: 'My Activity Logs', icon: 'ti-history' },
    { id: 'st-notifications', label: 'Notifications', icon: 'ti-bell' },
  ];

  return (
    <div className="settings-container" id="settingsPage">
      {/* SIDEBAR */}
      <div className="st-sidebar">
        <div className="st-menu">
          {menuItems.map((item) => (
            <div 
              key={item.id}
              className={`st-menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <i className={`ti ${item.icon}`}></i> {item.label}
            </div>
          ))}
        </div>

        <div className="st-logout-btn" id="btnLogout" onClick={() => console.log('Logout...')}>
          <i className="ti ti-logout"></i> Logout Account
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="st-main-content">
        
        {/* PROFILE SECTION */}
        {activeSection === 'st-profile' && (
          <div id="st-profile" className="st-content-section">
            <h2>Profile Details</h2>
            <div className="st-card">
              <div className="st-avatar-wrapper">
                <div className="st-avatar-main">
                  <img src="/src/assets/images/user-profile.png" id="stAvatarPreview" alt="Profile" />
                </div>
                <div className="st-avatar-info">
                  <div className="st-avatar-text">
                    <p className="st-avatar-title">Profile Picture</p>
                    <p className="st-avatar-subtitle">PNG, JPG or GIF. Max 2MB.</p>
                  </div>
                  <div className="st-avatar-actions">
                    <label htmlFor="avatarUpload" className="st-avatar-btn upload">
                      <i className="ti ti-camera"></i> Change Photo
                      <input type="file" id="avatarUpload" hidden accept="image/*" />
                    </label>
                    <button className="st-avatar-btn remove" id="btnRemoveAvatar">
                      <i className="ti ti-trash"></i> Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="st-grid">
                <div className="st-input-group readonly">
                  <label>User ID</label>
                  <input type="text" value="#FLW-9921" readOnly />
                </div>
                <div className="st-input-group readonly">
                  <label>Registration Date</label>
                  <input type="text" value="24/02/2026" readOnly />
                </div>
                <div className="st-input-group readonly">
                  <label>Full Name</label>
                  <input type="text" value="Ahmet Yılmaz" readOnly />
                </div>
                <div className="st-input-group readonly">
                  <label>Age</label>
                  <input type="text" value="28" readOnly />
                </div>
                <div className="st-input-group">
                  <label>Email Address</label>
                  <input type="email" defaultValue="ahmet@flowtera.com" id="stInpEmail" />
                </div>
                <div className="st-input-group">
                  <label>Phone Number</label>
                  <input type="text" defaultValue="+90 555 000 00 00" id="stInpPhone" />
                </div>
              </div>
              <button className="st-save-btn">Update Contact Info</button>
            </div>
          </div>
        )}

        {/* SECURITY SECTION */}
        {activeSection === 'st-security' && (
          <div id="st-security" className="st-content-section">
            <h2>Security & Privacy</h2>
            <div className="st-card">
              <div className="st-input-group">
                <label>Current Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="st-input-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" />
              </div>
              <div className="st-input-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" />
              </div>
              <button className="st-save-btn">Change Password</button>
            </div>
          </div>
        )}

        {/* LOGS SECTION */}
        {activeSection === 'st-logs' && (
          <div id="st-logs" className="st-content-section">
            <h2>Your Recent Logs</h2>
            <div className="st-card">
              <div className="st-log-list">
                <div className="st-log-item">
                  <span className="log-time">24/02 22:15</span>
                  <span className="log-desc">Password changed successfully.</span>
                  <span className="log-ip">IP: 192.168.1.45</span>
                </div>
                <div className="st-log-item">
                  <span className="log-time">23/02 10:05</span>
                  <span className="log-desc">Logged in from Chrome (Windows).</span>
                  <span className="log-ip">IP: 192.168.1.45</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS SECTION */}
        {activeSection === 'st-notifications' && (
          <div id="st-notifications" className="st-content-section">
            <h2>Notifications</h2>
            <div className="st-card">
              <div className="st-toggle-row">
                <span>Email Notifications</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="st-toggle-row">
                <span>Login Alerts</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;