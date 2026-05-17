import React, { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import './Navbar.css';
import UserImage from '../../../assets/images/user-profile.png';

import { useTeam }         from '../../../context/TeamContext';
import { useAuth }         from '../../../context/AuthContext';
import { useSubscription } from '../../../context/SubscriptionContext';
import { useModal }        from '../../../hooks/useModal';
import { useTheme }        from '../../../context/ThemeContext';

import ThemeModal      from '../../overlays/themeModal/ThemeModal';
import Notification    from '../../overlays/notification/Notification';
import UserDropdown    from '../../overlays/userDropdown/UserDropdown';
import Language        from '../../overlays/language/Language';
import TeamSelectModal from '../../overlays/teamSelectModal/TeamSelectModal';

const Navbar = React.memo(() => {
    const { roleNameForTeam, loading: authLoading, currentUser } = useAuth();
    const { selectedTeamId, selectTeam } = useTeam();
    const { theme, toggleMode } = useTheme();

    const navigate = useNavigate();
    const location = useLocation();
    const { hasFeature } = useSubscription();
    const { showAlert }  = useModal();

    const [isThemeOpen,        setIsThemeOpen]        = useState(false);
    const [isUserOpen,         setIsUserOpen]         = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isLangOpen,         setIsLangOpen]         = useState(false);
    const [isTeamOpen,         setIsTeamOpen]         = useState(false);
    const [isDrawerOpen,       setIsDrawerOpen]       = useState(false);

    // startTransition ile setState çağrısı — ESLint react-hooks/set-state-in-effect uyarısını giderir !!!
    useEffect(() => {
        startTransition(() => {
            setIsDrawerOpen(false);
        });
    }, [location.pathname]);

    // Drawer açıkken scroll kilitle
    useEffect(() => {
        document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isDrawerOpen]);

    // Plan ve Yetki Hesaplamaları
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
    const canAccessArchive  = checkAccess('view_archive');
    const isAdmin           = teamRoleData?.roleName?.toLowerCase() === 'admin';
    const isEnterprise      = !authLoading && selectedTeamId && currentPlan === 'enterprise';
    const isDark            = theme.mode === 'dark';

    // Rota Koruması
    useEffect(() => {
        const allProtectedRoutes = ['/expense', '/trips', '/analysis', '/history', '/requests', '/archive'];
        const path = location.pathname;
        if (!selectedTeamId) {
            if (allProtectedRoutes.includes(path)) navigate('/team');
            return;
        }
        if (path === '/analysis' && !canAccessAnalysis) navigate('/home');
        if (path === '/requests' && !canAccessRequests) navigate('/home');
        if (path === '/archive' && (!canAccessArchive || !isEnterprise)) navigate('/home');
    }, [selectedTeamId, location.pathname, navigate, canAccessAnalysis, canAccessRequests, canAccessArchive, isEnterprise]);

    const handleThemeClick = useCallback(() => {
        if (!hasFeature('theme_management')) {
            showAlert("Planınız Yetersiz", "Tema Özelleştirme Professional paketine özeldir.", "info", () => navigate('/subscription'));
            return;
        }
        setIsThemeOpen(true);
    }, [hasFeature, showAlert, navigate]);

    const handleTeamChange = useCallback((teamId) => {
        selectTeam(teamId);
        setIsTeamOpen(false);
    }, [selectTeam]);

    const handleHamburgerClick = useCallback((e) => {
        e.stopPropagation();
        setIsDrawerOpen(v => !v);
    }, []);

    // UserDropdown kendi içinde overlay yönetmeli; burada sadece toggle
    const handleUserClick = useCallback((e) => {
        e.stopPropagation();
        setIsUserOpen(v => !v);
    }, []);

    const handleToggleMode = useCallback(() => {
        toggleMode();
    }, [toggleMode]);

    // Drawer'daki nav linkleri — tek yerde tanımlı, hem drawer hem desktop kullanır
    const navLinks = useMemo(() => (
        <>
            <NavLink to="/home"><i className="ti ti-home" /> <span>Anasayfa</span></NavLink>
            {selectedTeamId && (
                <>
                    <NavLink to="/expense"><i className="ti ti-calendar-dollar" /> <span>Giderler</span></NavLink>
                    <NavLink to="/trips"><i className="ti ti-plane-departure" /> <span>Geziler</span></NavLink>
                    {canAccessAnalysis && (
                        <NavLink to="/analysis"><i className="ti ti-chart-pie" /> <span>Analiz</span></NavLink>
                    )}
                    <NavLink to="/history"><i className="ti ti-history" /> <span>Geçmiş</span></NavLink>
                    {canAccessRequests && (
                        <NavLink to="/requests"><i className="ti ti-pencil-question" /> <span>İstekler</span></NavLink>
                    )}
                    {canAccessArchive && isEnterprise && (
                        <NavLink to="/archive"><i className="ti ti-archive" /> <span>Arşiv</span></NavLink>
                    )}
                </>
            )}
            <NavLink to="/team"><i className="ti ti-users-group" /> <span>Takım</span></NavLink>
            <NavLink to="/help"><i className="ti ti-help" /> <span>Yardım</span></NavLink>
        </>
    ), [selectedTeamId, canAccessAnalysis, canAccessRequests, canAccessArchive, isEnterprise]);

    return (
        <>
            <header className="navbar-header">
                <div className="nav-container">
                    <div className="app-logo" onClick={() => navigate('/home')}>
                        <div className="logo-icon-wrapper">
                            <img src="/Logo.png" alt="FlowTera" className="logo-img" />
                        </div>
                        <h1>Flowtera</h1>
                    </div>

                    <nav className="nav-links-center">
                        <ul>
                            <li><NavLink to="/home"><i className="ti ti-home" /> Anasayfa</NavLink></li>
                            {selectedTeamId && (
                                <>
                                    <li><NavLink to="/expense"><i className="ti ti-calendar-dollar" /> Giderler</NavLink></li>
                                    <li><NavLink to="/trips"><i className="ti ti-plane-departure" /> Geziler</NavLink></li>
                                    {canAccessAnalysis && (
                                        <li><NavLink to="/analysis"><i className="ti ti-chart-pie" /> Analiz</NavLink></li>
                                    )}
                                    <li><NavLink to="/history"><i className="ti ti-history" /> Geçmiş</NavLink></li>
                                    {canAccessRequests && (
                                        <li><NavLink to="/requests"><i className="ti ti-pencil-question" /> İstekler</NavLink></li>
                                    )}
                                    {canAccessArchive && isEnterprise && (
                                        <li><NavLink to="/archive"><i className="ti ti-archive" /> Arşiv</NavLink></li>
                                    )}
                                </>
                            )}
                            <li><NavLink to="/team"><i className="ti ti-users-group" /> Takım</NavLink></li>
                            <li><NavLink to="/help"><i className="ti ti-help" /> Yardım</NavLink></li>
                        </ul>
                    </nav>

                    <div className="nav-actions-right">
                        <div className="head-lnk-btn">
                            <button
                                className={`team-select-head btn-dark ${isTeamOpen ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setIsTeamOpen(v => !v); }}
                            >
                                <i className="ti ti-users-group" />
                            </button>

                            <button
                                className={`btn-dark ${isLangOpen ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setIsLangOpen(v => !v); }}
                            >
                                <i className="ti ti-world" />
                            </button>

                            <button
                                className={`notification-btn btn-dark ${isNotificationOpen ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setIsNotificationOpen(v => !v); }}
                            >
                                <i className="ti ti-bell" />
                                <span className="nt-dot" />
                            </button>

                            <button className="btn-dark" onClick={(e) => { e.stopPropagation(); handleThemeClick(); }}>
                                <i className="ti ti-brush" />
                                {!hasFeature('theme_management') && (
                                    <i className="ti ti-lock" style={{ marginLeft: '5px', fontSize: '10px' }} />
                                )}
                            </button>

                            {/* Gece / Gündüz toggle — ThemeContext.toggleMode'a bağlı,
                                localStorage'a otomatik yazılır, sayfa yenilemede korunur */}
                            <button
                                className={`light-dark-head btn-dark${!isDark ? ' active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); handleToggleMode(); }}
                                title={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
                            >
                                <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} />
                            </button>
                        </div>

                        <div className="head-user-profile" onClick={handleUserClick}>
                            <div className="head-profile-img">
                                <img src={currentUser?.avatar || UserImage} alt="Profile" />
                            </div>
                        </div>

                        <button
                            className={`nav-hamburger${isDrawerOpen ? ' is-open' : ''}`}
                            onClick={handleHamburgerClick}
                            aria-label="Menüyü aç"
                        >
                            <span className="hbg-line" />
                            <span className="hbg-line" />
                            <span className="hbg-line" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {createPortal(
                <div
                    className={`nav-mobile-drawer${isDrawerOpen ? ' is-open' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="nav-drawer-overlay" onClick={() => setIsDrawerOpen(false)} />
                    <div className="nav-drawer-panel">
                        <div className="nav-drawer-top">
                            <div className="nav-drawer-logo">
                                <img src="/Logo.png" alt="FlowTera" />
                                <span>Flowtera</span>
                            </div>
                            <button className="nav-drawer-close" onClick={() => setIsDrawerOpen(false)}>
                                <i className="ti ti-x" />
                            </button>
                        </div>

                        <nav className="nav-drawer-links">
                            {navLinks}
                            <div className="nav-drawer-divider" />
                            <button className="nav-drawer-action-btn" onClick={handleToggleMode}>
                                <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} />
                                <span>{isDark ? 'Açık Tema' : 'Koyu Tema'}</span>
                            </button>
                            <button className="nav-drawer-action-btn" onClick={() => { setIsNotificationOpen(true); setIsDrawerOpen(false); }}>
                                <i className="ti ti-bell" />
                                <span>Bildirimler</span>
                                <span className="nav-drawer-nt-dot" />
                            </button>
                            <button className="nav-drawer-action-btn" onClick={() => { setIsThemeOpen(true); setIsDrawerOpen(false); }}>
                                <i className="ti ti-brush" />
                                <span>Tema Paneli</span>
                            </button>
                            <button className='nav-drawer-action-btn' onClick={() => { setIsLangOpen(true); setIsDrawerOpen(false); }}>
                                <i className="ti ti-world" />
                                <span>Dil Paneli</span>
                            </button>
                        </nav>

                        <div className="nav-drawer-footer">
                            <div className="nav-drawer-avatar">
                                <img src={currentUser?.avatar || UserImage} alt="Profile" />
                            </div>
                            <div className="nav-drawer-user-info">
                                <div className="nav-drawer-user-name">
                                    {currentUser?.name || currentUser?.username || 'Kullanıcı'}
                                </div>
                                <div className="nav-drawer-user-plan">
                                    {currentUser?.subscription?.plan || 'Free'}
                                </div>
                            </div>
                            <button
                                className="nav-drawer-settings-btn"
                                onClick={() => { navigate('/settings'); setIsDrawerOpen(false); }}
                            >
                                <i className="ti ti-settings" />
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {createPortal(<ThemeModal isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />, document.body)}
            {createPortal(<Notification isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} userRole={isAdmin ? 'admin' : 'user'} />, document.body)}
            {createPortal(<Language isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />, document.body)}
            {createPortal(<TeamSelectModal isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} onSelectTeam={handleTeamChange} currentTeamId={selectedTeamId} />, document.body)}
            {createPortal(<UserDropdown isOpen={isUserOpen} onClose={() => setIsUserOpen(false)} />, document.body)}
        </>
    );
});

Navbar.displayName = 'Navbar';

export default Navbar;