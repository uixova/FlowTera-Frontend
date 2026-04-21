import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../components.css/Navbar.css';
import UserImage from '../../assets/images/user-profile.png';

// Context & Hooks
import { useTeam } from '../../context/TeamContext';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useModal } from '../../hooks/useModal';

// Modals
import ThemeModal from '../modals/ThemeModal';
import Notification from '../modals/Notification';
import UserDropdown from '../modals/UserDropdown';
import Language from '../modals/Language';
import TeamSelectModal from '../modals/TeamSelectModal';

const Navbar = () => {
    const { roleNameForTeam, loading: authLoading, currentUser } = useAuth();
    const { selectedTeamId, selectTeam } = useTeam(); 
    
    const navigate = useNavigate();
    const location = useLocation();
    const { hasFeature } = useSubscription();
    const { showAlert } = useModal();

    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isTeamOpen, setIsTeamOpen] = useState(false);

    //  Plan ve Yetki Hesaplamaları 
    const currentPlan = useMemo(() => 
        selectedTeamId ? roleNameForTeam(selectedTeamId, 'plan') : null, 
    [selectedTeamId, roleNameForTeam]);

    const teamRoleData = useMemo(() => {
        if (!currentUser || !selectedTeamId) return null;
        return currentUser.role?.find(r => String(r.teamId) === String(selectedTeamId));
    }, [currentUser, selectedTeamId]);

    const checkAccess = useCallback((restrictionId) => {
        if (!teamRoleData) return false;
        if (teamRoleData.roleName?.toLowerCase() === 'admin') return true;
        return !teamRoleData.permissions?.includes(restrictionId); 
    }, [teamRoleData]);

    const canAccessAnalysis = checkAccess('view_analytics');
    const canAccessRequests = checkAccess('manage_requests');
    const canAccessArchive = checkAccess('view_archive');
    const isAdmin = teamRoleData?.roleName?.toLowerCase() === 'admin';
    const isEnterprise = !authLoading && selectedTeamId && currentPlan === 'enterprise';

    // 2. Rota Koruması (Artık syncSelectedTeam yerine sadece yönlendirme mantığı kaldı)
    useEffect(() => {
        const allProtectedRoutes = ['/expense', '/trips', '/analysis', '/history', '/requests', '/archive'];
        const path = location.pathname;

        if (!selectedTeamId) {
            if (allProtectedRoutes.includes(path)) navigate('/team');
            return;
        }

        // Yetki bazlı yönlendirme
        if (path === '/analysis' && !canAccessAnalysis) navigate('/home');
        if (path === '/requests' && !canAccessRequests) navigate('/home');
        if (path === '/archive' && (!canAccessArchive || !isEnterprise)) navigate('/home');
        
    }, [selectedTeamId, location.pathname, navigate, canAccessAnalysis, canAccessRequests, canAccessArchive, isEnterprise]);

    const handleThemeClick = () => {
        if (!hasFeature('theme_management')) {
            showAlert("Planınız Yetersiz", "Tema Özelleştirme Professional paketine özeldir.", "info", () => navigate('/subscription'));
            return;
        }
        setIsThemeOpen(true);
    };

    const handleTeamChange = (teamId) => {
        selectTeam(teamId); // Context'i günceller, Navbar render olur.
        setIsTeamOpen(false);
    };

    return (
        <header>
            <div className="top-head">
                <div className="app-logo"><h1>Flowtera</h1></div>
                <div className="head-project-manager">
                    <div className="head-lnk-btn">
                        <button className="github-source"><i className="ti ti-brand-github"></i> Source Code</button>
                        <button className="donate-lnk"><i className="ti ti-heart"></i> Donate</button>
                        
                        <button className={`team-select-head github-source ${isTeamOpen ? 'active' : ''}`} onClick={() => setIsTeamOpen(!isTeamOpen)}>
                            <i className="ti ti-users-group"></i>
                        </button>

                        <button className={`light-dark-head github-source ${isLangOpen ? 'active' : ''}`} onClick={() => setIsLangOpen(!isLangOpen)}>
                            <i className="ti ti-world"></i>
                        </button>

                        <button className={`notification-btn github-source ${isNotificationOpen ? 'active' : ''}`} onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                            <i className="ti ti-bell"></i>
                            <span className="nt-dot"></span>
                        </button>
                        <button className="light-dark-head github-source"><i className="ti ti-sun"></i></button>
                    </div>

                    <div className="head-user-profile" onClick={() => setIsUserOpen(!isUserOpen)}>
                        <div className="head-profile-img">
                            <img src={currentUser?.avatar || UserImage} alt="Profile" />
                        </div>
                        <UserDropdown isOpen={isUserOpen} onClose={() => setIsUserOpen(false)} />
                    </div>
                </div>
            </div>
            <hr />

            <div className="bottom-head">
                <div className="left-head">
                    <ul>
                        <li><NavLink to="/home"><i className="ti ti-home"></i> Anasayfa</NavLink></li>
                        {selectedTeamId && (
                            <>
                                <li><NavLink to="/expense"><i className="ti ti-calendar-dollar"></i> Giderler</NavLink></li>
                                <li><NavLink to="/trips"><i className="ti ti-plane-departure"></i> Geziler</NavLink></li>
                                {canAccessAnalysis && (
                                    <li><NavLink to="/analysis"><i className="ti ti-chart-pie"></i> Analiz</NavLink></li>
                                )}
                                <li><NavLink to="/history"><i className="ti ti-history"></i> Geçmiş</NavLink></li>
                                {canAccessRequests && (
                                    <li><NavLink to="/requests"><i className="ti ti-pencil-question"></i> İstekler</NavLink></li>
                                )}
                                {canAccessArchive && isEnterprise && (
                                    <li><NavLink to="/archive"><i className="ti ti-archive"></i> Arşiv</NavLink></li>
                                )}
                            </>
                        )}
                        <li><NavLink to="/team"><i className="ti ti-users-group"></i> Takım</NavLink></li>
                        <li><NavLink to="/help"><i className="ti ti-help"></i> Yardım</NavLink></li>
                    </ul>
                </div>
                <div className="right-head">
                    <ul>
                        <li><button onClick={() => navigate('/settings')} className="nav-settings-btn">Ayarlar</button></li>
                        <li>
                            <button className="nav-theme-btn" onClick={handleThemeClick}>
                                Tema {!hasFeature('theme_management') && <i className="ti ti-lock" style={{marginLeft: '5px', fontSize: '12px'}}></i>}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <ThemeModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />
            <Notification isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} userRole={isAdmin ? "admin" : "user"} />
            <Language isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
            <TeamSelectModal isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} onSelectTeam={handleTeamChange} currentTeamId={selectedTeamId} />
        </header>
    );
};

export default Navbar;