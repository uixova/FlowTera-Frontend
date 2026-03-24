import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../components.css/Navbar.css';
import UserImage from '../../assets/images/user-profile.png'
import ThemeModal from '../modals/ThemeModal';
import Notification from '../modals/Notification';
import UserDropdown from '../modals/UserDropdown';
import Language from '../modals/Language';
import TeamSelectModal from '../modals/TeamSelectModal';

const Navbar = () => {
    // Modal Açma/Kapama State'leri
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isTeamOpen, setIsTeamOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(() => {
        return localStorage.getItem('tm_selected_id') || null;
    });

    // Takım değişikliklerini dinlemek için storage event'ini kullanıyoruz
    useEffect(() => {
        const handleStorageUpdate = () => {
            const id = localStorage.getItem('tm_selected_id');
            setSelectedTeamId(id);
        };
        window.addEventListener('storage', handleStorageUpdate);
        return () => window.removeEventListener('storage', handleStorageUpdate);
    }, []);

    // Takım seçildiğinde çağrılacak fonksiyon
    const handleTeamChange = (teamId) => {
        localStorage.setItem('tm_selected_id', teamId);
        localStorage.setItem('tm_view_mode', 'main');
        setSelectedTeamId(teamId);
        window.dispatchEvent(new Event('storage')); 
    };

    // React Router'un useNavigate hook'u ile programatik navigasyon
    const navigate = useNavigate();

  return (
    <header>
      <div className="top-head">
        <div className="app-logo">
          <h1>Flowtera</h1>
        </div>
        <div className="head-project-manager">
          {/* Proje Yöneticisi Bilgisi - Örnek olarak sabit bir isim */}
          <div className="head-lnk-btn">
            <button className="github-source"><i className="ti ti-brand-github"></i> Source code</button>
            <button className="donate-lnk"><i className="ti ti-heart"></i> Donate</button>
            <button 
              className={`team-select-head github-source ${isTeamOpen ? 'active' : ''}`} 
              onClick={() => setIsTeamOpen(!isTeamOpen)}>
                <i className="ti ti-users-group"></i>
            </button>

            {/* Bildirim, Dil ve Tema butonları */}
            <button className={`light-dark-head github-source ${isLangOpen ? 'active' : ''}`} 
            onClick={() => setIsLangOpen(!isLangOpen)}>
              <i className="ti ti-world"></i>
            </button>
            
            <button 
              className={`notification-btn github-source ${isNotificationOpen ? 'active' : ''}`}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <i className="ti ti-bell"></i>

              <span className="nt-dot"></span>
            </button>

            <button className="light-dark-head github-source"><i className="ti ti-sun"></i></button>
          </div>
          <div className="head-user-profile" onClick={() => setIsUserOpen(!isUserOpen)}>
              <div className="head-profile-img">
                  <img src={UserImage} alt="Profile" />
              </div>

              {/* Kullanıcı Dropdown Menüsü */}
              <UserDropdown 
                  isOpen={isUserOpen} 
                  onClose={() => setIsUserOpen(false)} 
              />
          </div>
        </div>
      </div>
      <hr />
      {/* Navbar altı - Ana menü */}
      <div className="bottom-head">
        <div className="left-head">
          {/* NavLink'ler ile sayfa geçişleri */}
          <ul>
            <li><NavLink to="/home"><i className="ti ti-home"></i> Home</NavLink></li>
            <li><NavLink to="/expense"><i className="ti ti-calendar-dollar"></i> Expense</NavLink></li>
            <li><NavLink to="/trips"><i className="ti ti-plane-departure"></i> Trips</NavLink></li>
            <li><NavLink to="/analysis"><i className="ti ti-chart-pie"></i> Analysis</NavLink></li>
            <li><NavLink to="/history"><i className="ti ti-history"></i> History</NavLink></li>
            <li><NavLink to="/team"><i className="ti ti-users-group"></i> Team</NavLink></li>
            <li><NavLink to="/help"><i className="ti ti-help"></i> Help</NavLink></li>
          </ul>
        </div>
        <div className="right-head">
          <ul>
            <li><button onClick={() => navigate('/settings')} className="nav-settings-btn">Settings</button></li>
            <li><button className="nav-theme-btn" onClick={() => setIsThemeOpen(true)}>Theme</button></li>
          </ul>
        </div>
      </div>

      {/* Tema Modal */}
      <ThemeModal 
        isOpen={isThemeOpen} 
        onClose={() => setIsThemeOpen(false)} 
      />

      {/* Bildirim Modal */}
      <Notification 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        userRole="admin" 
      />

      {/* Dil Seçimi Modal */}
      <Language 
        isOpen={isLangOpen} 
        onClose={() => setIsLangOpen(false)} 
      />

      {/* Takım Seçimi Modal */}
      <TeamSelectModal 
        isOpen={isTeamOpen} 
        onClose={() => setIsTeamOpen(false)} 
        onSelectTeam={handleTeamChange} 
        currentTeamId={selectedTeamId} 
      />
    </header>
  );
};

export default Navbar;