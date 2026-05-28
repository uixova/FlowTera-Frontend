import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Settings.css';
import { settingsService } from './services/settingService';
import Loader from '../../components/ui/Loader';
import ActionSidebar from '../../components/navigation/ActionSidebar';

import Profile      from './components/Profile';
import UserPlan     from './components/UserPlan';
import Security     from './components/Security';
import Activity     from './components/Activity';
import Notification from './components/Notifications';

import { useAuth }  from '../../context/AuthContext';
import { useTeam }  from '../../context/TeamContext';
import { useModal } from '../../hooks/useModal';
import Confirm      from '../../components/overlays/Confirm';

const MENU_ITEM_DEFS = [
    { id: 'st-profile',       tKey: 'profile_tab',       icon: 'ti-user-circle'  },
    { id: 'st-subscription',  tKey: 'plan_tab',          icon: 'ti-credit-card'  },
    { id: 'st-security',      tKey: 'security_tab',      icon: 'ti-shield-lock'  },
    { id: 'st-logs',          tKey: 'activity_tab',      icon: 'ti-list-details' },
    { id: 'st-notifications', tKey: 'notifications_tab', icon: 'ti-bell-ringing' },
];

const Settings = () => {
    const { t } = useTranslation('settings');
    const { t: tBtn } = useTranslation('common.buttons');
    const navigate                                        = useNavigate();
    const { currentUserId, loading: authLoading, logout } = useAuth();
    const { selectedTeamId } = useTeam();
    const { confirmConfig, askConfirm, closeConfirm }     = useModal();

    const [activeSection,  setActiveSection]  = useState('st-profile');
    const [user,           setUser]           = useState(null);
    const [logs,           setLogs]           = useState([]);
    const [notifConfig,    setNotifConfig]    = useState({ email: false, sms: false, push: false });
    const [loading,        setLoading]        = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.classList.add('st-page-active');
        return () => appContainer?.classList.remove('st-page-active');
    }, []);

    useEffect(() => {
        if (!currentUserId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [userData, userLogs, userNotifs] = await Promise.all([
                    settingsService.getCurrentUser(currentUserId),
                    settingsService.getUserLogs(currentUserId, selectedTeamId),
                    settingsService.getUserNotifications(currentUserId),
                ]);
                setUser(userData);
                setLogs(userLogs);
                if (userNotifs) setNotifConfig(userNotifs);
            } catch (err) {
                console.error('[Settings] Veri çekme hatası:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUserId, selectedTeamId]);

    // LOGOUT MANTIĞI
    const handleLogoutClick = () => {
        askConfirm(
            'Oturumu Kapat',
            'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
            async () => {
                try {
                    if (logout) await logout();
                    navigate('/');
                    closeConfirm();
                } catch (err) {
                    console.error('[Settings] Çıkış hatası:', err);
                }
            },
            'info'
        );
    };

    const handleMenuSelect = (id) => {
        setActiveSection(id);
        setIsMobileMenuOpen(false);
    };

    const MENU_ITEMS = MENU_ITEM_DEFS.map(item => ({ ...item, label: t(item.tKey) }));

    if (authLoading || loading || !user) return <Loader type="butterfly" />;

    if (user?.isDeleted) {
        return (
            <div className="st-loader">
                <i className="ti ti-trash" style={{ fontSize: 40, color: '#ff5630' }} />
                <span>Bu hesap silindi.</span>
            </div>
        );
    }

    const activeLabel = MENU_ITEMS.find(m => m.id === activeSection)?.label ?? t('page_title');

    const renderSection = () => {
        switch (activeSection) {
            case 'st-profile':       return <Profile      user={user} />;
            case 'st-subscription':  return <UserPlan     user={user} />;
            case 'st-security':      return <Security />;
            case 'st-logs':          return <Activity     logs={logs} />;
            case 'st-notifications': return <Notification notifConfig={notifConfig} setNotifConfig={setNotifConfig} />;
            default:                 return <Profile      user={user} />;
        }
    };

    const menuContent = (
        <div className="st-menu-sidebar-inner">
            <div className="st-menu">
                {MENU_ITEMS.map((item) => (
                    <div
                        key={item.id}
                        className={`st-menu-item${activeSection === item.id ? ' active' : ''}`}
                        onClick={() => handleMenuSelect(item.id)}
                    >
                        <i className={`ti ${item.icon}`} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="st-logout-btn" onClick={() => { setIsMobileMenuOpen(false); handleLogoutClick(); }}>
                <i className="ti ti-logout" />
                {tBtn('logout')}
            </div>
        </div>
    );

    return (
        <div className="settings-container">
            {/* Desktop Sidebar */}
            <div className="st-sidebar">
                <div>
                    <div className="st-sidebar-header">
                        <h3>{t('page_title')}</h3>
                        <p>{t('page_subtitle')}</p>
                    </div>
                    <div className="st-menu">
                        {MENU_ITEMS.map((item) => (
                            <div
                                key={item.id}
                                className={`st-menu-item${activeSection === item.id ? ' active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <i className={`ti ${item.icon}`} />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="st-logout-btn" onClick={handleLogoutClick}>
                    <i className="ti ti-logout" />
                    {tBtn('logout')}
                </div>
            </div>

            {/* Main Content */}
            <div className="st-main-content">
                {/* Mobile topbar */}
                <div className="st-mobile-topbar">
                    <button className="st-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                        <i className="ti ti-layout-sidebar" />
                        <span>{activeLabel}</span>
                        <i className="ti ti-chevron-down" />
                    </button>
                </div>

                {renderSection()}
            </div>

            {/* Mobile Menu Drawer */}
            <ActionSidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                title={t('page_title')}
                width="300px"
            >
                {menuContent}
            </ActionSidebar>

            <Confirm {...confirmConfig} onClose={closeConfirm} />
        </div>
    );
};

export default Settings;