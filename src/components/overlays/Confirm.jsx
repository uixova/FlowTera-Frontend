import React from 'react';
import './Modal.css';

const Confirm = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = "Evet, Devam Et", cancelText = "Vazgeç" }) => {
    if (!isOpen) return null;

    const colors = {
        warning: '#ffc107',
        danger: '#ff4d4d',
        info: '#00bcd4'
    };

    const currentColor = colors[type] || colors.warning;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-icon" style={{ color: currentColor }}>
                    <i className={type === 'danger' ? 'ti ti-trash-x' : 'ti ti-help-hexagon'}></i>
                </div>
                <div className="modal-body">
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>
                <div className="modal-footer confirm-footer">
                    <button className="btn-cancel" onClick={onClose}>{cancelText}</button>
                    <button 
                        className="btn-confirm" 
                        style={{ backgroundColor: currentColor }} 
                        onClick={() => { onConfirm(); onClose(); }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Confirm;