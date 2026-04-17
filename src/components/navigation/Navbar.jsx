import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../components.css/Navbar.css';
import UserImage from '../../assets/images/user-profile.png';
import ThemeModal from '../modals/ThemeModal';
import Notification from '../modals/Notification';
import UserDropdown from '../modals/UserDropdown';
import Language from '../modals/Language';
import TeamSelectModal from '../modals/TeamSelectModal';

import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    // DİKKAT: AuthContext'ten user değil, currentUser geliyor. 
    const { roleNameForTeam, loading: authLoading, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isTeamOpen, setIsTeamOpen] = useState(false);

    const [selectedTeamId, setSelectedTeamId] = useState(() => {
        return localStorage.getItem('tm_selected_id') || null;
    });
    
    const currentPlan = useMemo(() => selectedTeamId ? roleNameForTeam(selectedTeamId, 'plan') : null, [selectedTeamId, roleNameForTeam]);

    // 1. KULLANICININ O TAKIMDAKİ ROLÜNÜ VE KISITLAMALARINI BULUYORUZ
    const teamRoleData = useMemo(() => {
        if (!currentUser || !selectedTeamId) return null;
        return currentUser.role?.find(r => String(r.teamId) === String(selectedTeamId));
    }, [currentUser, selectedTeamId]);

    // 2. ANA YETKİ KONTROL FONKSİYONU (İstediğin mantık burada)
    const checkAccess = useCallback((restrictionId) => {
        if (!teamRoleData) return false;
        
        // Adminse kısıtlamalara bakma, direkt true ver
        if (teamRoleData.roleName?.toLowerCase() === 'admin') return true;

        // Admin değilse, permissions (kısıtlamalar) dizisine bak. 
        // Eğer o ID dizide VARSA (includes) -> Kısıtlanmış demektir, false dön.
        // Eğer o ID dizide YOKSA -> Kısıtlanmamış demektir, true dön.
        const isRestricted = teamRoleData.permissions?.includes(restrictionId);
        return !isRestricted; 
    }, [teamRoleData]);

    // Sayfa bazlı kısıtlama kontrolleri
    const canAccessAnalysis = checkAccess('view_analytics');
    const canAccessRequests = checkAccess('manage_requests');
    const canAccessArchive = checkAccess('view_archive');

    // Admin ve Enterprise kontrolleri (Özel şartlar için)
    const isAdmin = teamRoleData?.roleName?.toLowerCase() === 'admin';
    const isEnterprise = !authLoading && selectedTeamId && currentPlan === 'enterprise';

    const allProtectedRoutes = useMemo(() => ['/expense', '/trips', '/analysis', '/history', '/requests', '/archive'], []);

    const syncSelectedTeam = useCallback(() => {
        const updatedId = localStorage.getItem('tm_selected_id');

        queueMicrotask(() => {
            setSelectedTeamId(updatedId);

            if (!updatedId) {
                if (allProtectedRoutes.includes(location.pathname)) {
                    navigate('/team');
                }
                return;
            }

            const path = location.pathname;

            // Rota Koruması: Adam linkten zorla girmeye çalışırsa kısıtlaması varsa anasayfaya at
            if (path === '/analysis' && !canAccessAnalysis) navigate('/home');
            if (path === '/requests' && !canAccessRequests) navigate('/home');
            if (path === '/archive' && (!canAccessArchive || !isEnterprise)) navigate('/home');
        });
    }, [location.pathname, navigate, isEnterprise, canAccessAnalysis, canAccessRequests, canAccessArchive, allProtectedRoutes]);

    useEffect(() => {
        const handleTeamChanged = () => syncSelectedTeam();
        window.addEventListener('teamChanged', handleTeamChanged);
        window.addEventListener('storage', syncSelectedTeam);
        syncSelectedTeam();

        return () => {
            window.removeEventListener('teamChanged', handleTeamChanged);
            window.removeEventListener('storage', syncSelectedTeam);
        };
    }, [syncSelectedTeam]);

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
        setIsTeamOpen(false);
    };

    return (
        <header>
            <div className="top-head">
                <div className="app-logo">
                    <h1>Flowtera</h1>
                </div>
                <div className="head-project-manager">
                    <div className="head-lnk-btn">
                        <button className="github-source"><i className="ti ti-brand-github"></i> Source Code</button>
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
                            {/* currentUser avatarını alıyoruz */}
                            <img src={currentUser?.avatar || UserImage} alt="Profile" />
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
                        <li><NavLink to="/home"><i className="ti ti-home"></i> Anasayfa</NavLink></li>

                        {selectedTeamId && (
                            <>
                                <li><NavLink to="/expense"><i className="ti ti-calendar-dollar"></i> Giderler</NavLink></li>
                                <li><NavLink to="/trips"><i className="ti ti-plane-departure"></i> Geziler</NavLink></li>

                                {/* KISITLAMA YOKSA (veya Adminse) GÖSTER */}
                                {canAccessAnalysis && (
                                    <li><NavLink to="/analysis"><i className="ti ti-chart-pie"></i> Analiz</NavLink></li>
                                )}

                                <li><NavLink to="/history"><i className="ti ti-history"></i> Geçmiş</NavLink></li>

                                {/* KISITLAMA YOKSA (veya Adminse) GÖSTER */}
                                {canAccessRequests && (
                                    <li>
                                        <NavLink to="/requests">
                                            <i className="ti ti-pencil-question"></i> İstekler
                                        </NavLink>
                                    </li>
                                )}

                                {/* ARŞİV KISITLAMASI YOKSA VE PLAN ENTERPRISE İSE GÖSTER */}
                                {canAccessArchive && isEnterprise && (
                                    <li>
                                        <NavLink to="/archive">
                                            <i className="ti ti-archive"></i> Arşiv
                                        </NavLink>
                                    </li>
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
                        <li><button className="nav-theme-btn" onClick={() => setIsThemeOpen(true)}>Tema</button></li>
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