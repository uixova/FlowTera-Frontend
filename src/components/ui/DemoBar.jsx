import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DemoBar.css';

const DemoBar = () => {
    const navigate = useNavigate();
    return (
        <div className="demo-bar" role="banner" aria-label="Demo modu bildirimi">
            <i className="ti ti-flask demo-bar-icon" />
            <span className="demo-bar-text">
                Demo modundasınız — tüm özellikler kilitli.
            </span>
            <div className="demo-bar-actions">
                <button className="demo-bar-btn demo-bar-btn--login"  onClick={() => navigate('/login')}>
                    Giriş Yap
                </button>
                <button className="demo-bar-btn demo-bar-btn--signup" onClick={() => navigate('/signup')}>
                    Ücretsiz Kayıt
                </button>
            </div>
        </div>
    );
};

export default DemoBar;
