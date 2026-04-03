import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../components.css/Navbar.css';
import UserImage from '../../assets/images/user-profile.png'
import ThemeModal from '../modals/ThemeModal';
import Notification from '../modals/Notification';
import UserDropdown from '../modals/UserDropdown';
import Language from '../modals/Language';
import TeamSelectModal from '../modals/TeamSelectModal';

import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
    const { roleNameForTeam, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Modal Açma/Kapama State'leri
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isTeamOpen, setIsTeamOpen] = useState(false);
    
    // Takım ID state'i (localStorage'dan başlatıyoruz)
    const [selectedTeamId, setSelectedTeamId] = useState(() => {
        return localStorage.getItem('tm_selected_id') || null;
    });

    // authLoading devam ediyorsa veya takım seçili değilse false döner
    const isAdmin = !authLoading && selectedTeamId && roleNameForTeam(selectedTeamId) === 'Admin';

    // Takım değişikliklerini dinle
    useEffect(() => {
        const syncSelectedTeam = () => {
            const updatedId = localStorage.getItem('tm_selected_id');
            setSelectedTeamId(prevId =>
                String(prevId || '') === String(updatedId || '') ? prevId : updatedId
            );
        };

        const handleTeamChanged = () => syncSelectedTeam();

        // Hem 'storage' event'ini hem de özel 'teamChanged' event'ini dinleyerek takım değişikliklerini senkronize ediyoruz
        window.addEventListener('teamChanged', handleTeamChanged);
        window.addEventListener('storage', syncSelectedTeam);

        return () => {
            window.removeEventListener('teamChanged', handleTeamChanged);
            window.removeEventListener('storage', syncSelectedTeam);
        };
    }, []);

    // Takım seçimi yapıldığında çağrılacak fonksiyon
    const handleTeamChange = (teamId) => {
        const stringId = String(teamId);
        localStorage.setItem('tm_selected_id', stringId);
        localStorage.setItem('tm_view_mode', 'main');
        setSelectedTeamId(stringId);

        window.dispatchEvent(
            new CustomEvent('teamChanged', {
                detail: { teamId: stringId, viewMode: 'main' }
            })
        );
    };

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
                            className={`team-select-head github-source ${isTeamOpen ? 'active' : ''}`} 
                            onClick={() => setIsTeamOpen(!isTeamOpen)}>
                            <i className="ti ti-users-group"></i>
                        </button>

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
                        
                        {isAdmin && (
                            <li><NavLink to="/requests"><i className="ti ti-pencil-question"></i> Requests</NavLink></li>
                        )}
                        
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

            <ThemeModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
            
            <Notification 
                isOpen={isNotificationOpen} 
                onClose={() => setIsNotificationOpen(false)} 
                userRole={isAdmin ? "admin" : "user"} 
            />

            <Language isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />

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