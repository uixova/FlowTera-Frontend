import React from 'react';
import { useTranslation } from 'react-i18next';
import './Modal.css';

const ICON_CONFIG = {
    success: { icon: 'ti ti-circle-check', color: '#0ed45a' },
    error:   { icon: 'ti ti-circle-x',     color: '#ff4d4d' },
    warning: { icon: 'ti ti-alert-triangle',color: '#ffc107' },
    info:    { icon: 'ti ti-info-circle',   color: '#00bcd4' },
};

const Alert = ({ isOpen, onClose, title, message, type = 'info' }) => {
    const { t } = useTranslation('common.modals');
    if (!isOpen) return null;

    const current = ICON_CONFIG[type] || ICON_CONFIG.info;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container alert-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-icon" style={{ color: current.color }}>
                    <i className={current.icon} />
                </div>
                <div className="modal-body">
                    <h3 style={{ borderBottom: `2px solid ${current.color}`, display: 'inline-block', paddingBottom: '5px' }}>
                        {title}
                    </h3>
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button
                        className="modal-btn"
                        style={{ backgroundColor: current.color, color: type === 'warning' ? '#000' : '#fff' }}
                        onClick={onClose}
                    >
                        {t('ok')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Alert;