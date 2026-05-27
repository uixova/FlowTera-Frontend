import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import './DemoBar.css';

const DemoBar = memo(() => {
    const { logout } = useAuth();
    const { t } = useTranslation('common.errors');
    const { t: tBtn } = useTranslation('common.buttons');
    const { t: tNav } = useTranslation('common.nav');

    const handleLogin = () => { logout(); window.location.href = '/login'; };
    const handleSignup = () => { logout(); window.location.href = '/signup'; };

    return (
        <div className="demo-bar" role="banner">
            <i className="ti ti-flask demo-bar-icon" />
            <span className="demo-bar-text">{t('demo_bar_text')}</span>
            <div className="demo-bar-actions">
                <button className="demo-bar-btn demo-bar-btn--home" onClick={() => { logout(); window.location.href = '/'; }}>
                    <i className="ti ti-home" /> {tNav('home')}
                </button>
                <button className="demo-bar-btn demo-bar-btn--login" onClick={handleLogin}>
                    {tBtn('login')}
                </button>
                <button className="demo-bar-btn demo-bar-btn--signup" onClick={handleSignup}>
                    {tBtn('signup')}
                </button>
            </div>
        </div>
    );
});

export default DemoBar;
