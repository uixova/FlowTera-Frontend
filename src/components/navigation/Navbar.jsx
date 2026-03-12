import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../components.css/Navbar.css';
import UserImage from '../../assets/images/user-profile.png'
import ThemeModal from '../modals/ThemeModal';
import Notification from '../modals/Notification';
import UserDropdown from '../modals/UserDropdown';

const Navbar = () => {
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const navigate = useNavigate();

  return (
    <header>
      <div className="top-head">
        <div className="app-logo">
          <h1>Flowtera</h1>
        </div>
        <div className="head-project-manager">
          <div className="head-lnk-btn">
            <button className="github-source"><i className="ti ti-brand-github"></i> Source code</button>
            <button className="donate-lnk"><i className="ti ti-heart"></i> Donate</button>
            
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

              <UserDropdown 
                  isOpen={isUserOpen} 
                  onClose={() => setIsUserOpen(false)} 
              />
          </div>
        </div>
      </div>
      <hr />
      <div className="bottom-head">
        <div className="left-head">
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

      <ThemeModal 
        isOpen={isThemeOpen} 
        onClose={() => setIsThemeOpen(false)} 
      />

      <Notification 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
        userRole="admin" 
      />
    </header>
  );
};

export default Navbar;