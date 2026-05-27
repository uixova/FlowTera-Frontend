import React from 'react';
import { useTranslation } from 'react-i18next';
import './Modal.css';

const COLORS = { warning: '#ffc107', danger: '#ff4d4d', info: '#00bcd4' };

const Confirm = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText, cancelText }) => {
    const { t } = useTranslation('common.modals');
    if (!isOpen) return null;

    const currentColor = COLORS[type] || COLORS.warning;
    const confirmLabel = confirmText ?? t('yes_continue');
    const cancelLabel = cancelText ?? t('give_up');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-icon" style={{ color: currentColor }}>
                    <i className={type === 'danger' ? 'ti ti-trash-x' : 'ti ti-help-hexagon'} />
                </div>
                <div className="modal-body">
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>
                <div className="modal-footer confirm-footer">
                    <button className="btn-cancel" onClick={onClose}>{cancelLabel}</button>
                    <button
                        className="btn-confirm"
                        style={{ backgroundColor: currentColor }}
                        onClick={() => { onConfirm(); onClose(); }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Confirm;