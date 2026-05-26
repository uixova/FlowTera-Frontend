import React, { memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DemoBar.css';

const DemoBar = memo(() => {
    const { logout } = useAuth();

    const handleLogin = () => {
        logout();
        window.location.href = '/login';
    };

    const handleSignup = () => {
        logout();
        window.location.href = '/signup';
    };

    return (
        <div className="demo-bar" role="banner" aria-label="Demo modu bildirimi">
            <i className="ti ti-flask demo-bar-icon" />
            <span className="demo-bar-text">
                Demo modundasınız — tüm özellikler kilitli.
            </span>
            <div className="demo-bar-actions">
                <button className="demo-bar-btn demo-bar-btn--home" onClick={() => { logout(); window.location.href = '/'; }}>
                    <i className="ti ti-home" /> Ana Sayfa
                </button>
                <button className="demo-bar-btn demo-bar-btn--login" onClick={handleLogin}>
                    Giriş Yap
                </button>
                <button className="demo-bar-btn demo-bar-btn--signup" onClick={handleSignup}>
                    Ücretsiz Kayıt
                </button>
            </div>
        </div>
    );
});

export default DemoBar;
