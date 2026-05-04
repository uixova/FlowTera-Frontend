import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css'; 
import { settingsService } from './services/settingService';
import Loader from '../../components/common/Loader';

// Alt Sayfalar
import Profile from './components/Profile';
import UserPlan from './components/UserPlan';
import Security from './components/Security';
import Activity from './components/Activity';
import Notification from './components/Notifications';

// Hooks & Modals
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../hooks/useModal'; 
import Confirm from '../../components/modals/Confirm'; 

const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('st-profile');
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notifConfig, setNotifConfig] = useState({ email: false, sms: false, push: false });
  const [loading, setLoading] = useState(true);

  // Auth'tan logout fonksiyonunu da çekiyoruz
  const { currentUserId, loading: authLoading, logout } = useAuth();
  
  // Modal yönetimi
  const { confirmConfig, askConfirm, closeConfirm } = useModal();

  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.classList.add('no-padding');

    const fetchSettingsData = async () => {
      setLoading(true);
      try {
        const [userData, userLogs, userNotifs] = await Promise.all([
          settingsService.getCurrentUser(currentUserId),
          settingsService.getUserLogs(currentUserId),
          settingsService.getUserNotifications(currentUserId)
        ]);
        
        setUser(userData);
        setLogs(userLogs);
        if (userNotifs) setNotifConfig(userNotifs);
      } catch (error) {
        console.error("Data Download Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) fetchSettingsData();
  }, [currentUserId]);

  useEffect(() => {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.add('st-page-active');
    }

    return () => {
      if (appContainer) {
        appContainer.classList.remove('st-page-active');
      }
    };
  }, []);

  // LOGOUT MANTIĞI
  const handleLogoutClick = () => {
    askConfirm(
      "Oturumu Kapat",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      async () => {
        try {
          if (logout) {
            await logout();
          }
          navigate('/');
          closeConfirm();
        } catch (err) {
          console.error("Çıkış yapılırken hata:", err);
        }
      },
      "info" 
    );
  };

  if (authLoading || loading || !user) return <Loader type="butterfly" />;

  if (user?.isDeleted) {
    return (
      <div className="st-loader" style={{ textAlign: 'center', paddingTop: 40 }}>
        <i className="ti ti-trash" style={{ fontSize: 42, color: '#ff4757' }}></i>
        <div style={{ marginTop: 12, fontWeight: 700 }}>Bu hesap silindi.</div>
      </div>
    );
  }

  const menuItems = [
    { id: 'st-profile', label: 'Profil Detayları', icon: 'ti-user-circle' },
    { id: 'st-subscription', label: 'Abonelik & Planlar', icon: 'ti-credit-card' },
    { id: 'st-security', label: 'Gizlilik & Güvenlik', icon: 'ti-shield-lock' },
    { id: 'st-logs', label: 'Aktivite Kayıtları', icon: 'ti-list-details' },
    { id: 'st-notifications', label: 'Bildirimler', icon: 'ti-bell-ringing' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'st-profile': return <Profile user={user} />;
      case 'st-subscription': return <UserPlan user={user} />;
      case 'st-security': return <Security />;
      case 'st-logs': return <Activity logs={logs} />;
      case 'st-notifications': return <Notification notifConfig={notifConfig} setNotifConfig={setNotifConfig} />;
      default: return <Profile user={user} />;
    }
  };

  return (
    <div className="settings-container">
      {/* SIDEBAR */}
      <div className="st-sidebar">
        <div className="st-menu">
          <div className="st-sidebar-header">
              <h3>Ayarlar</h3>
          </div>
          {menuItems.map((item) => (
            <div 
              key={item.id}
              className={`st-menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <i className={`ti ${item.icon}`}></i> <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* LOGOUT BUTONU */}
        <div className="st-logout-btn" onClick={handleLogoutClick}>
          <i className="ti ti-logout"></i> Hesaptan Çık
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="st-main-content">
          {renderSection()}
      </div>

      {/* CONFIRM MODAL */}
      <Confirm {...confirmConfig} onClose={closeConfirm} />
    </div>
  );
};

export default Settings;