import React from 'react';
import './Modal.css';

const Alert = ({ isOpen, onClose, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    // Tiplere göre ikon ve renk şeması
    const config = {
        success: { icon: 'ti ti-circle-check', color: '#0ed45a' },
        error: { icon: 'ti ti-circle-x', color: '#ff4d4d' },
        warning: { icon: 'ti ti-alert-triangle', color: '#ffc107' },
        info: { icon: 'ti ti-info-circle', color: '#00bcd4' }
    };

    const current = config[type] || config.info;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-container alert-modal`} onClick={e => e.stopPropagation()}>
                <div className="modal-icon" style={{ color: current.color }}>
                    <i className={current.icon}></i>
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
                        Anladım
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Alert;