import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../hooks/useModal';
import Confirm from '../Confirm';
import Alert from '../Alert';
import './UserDropdown.css';

const UserDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();
  const { t } = useTranslation('common.modals');
  const { t: tBtn } = useTranslation('common.buttons');
  const { t: tNav } = useTranslation('common.nav');

  const {
    alertConfig,
    confirmConfig,
    askConfirm,
    closeAlert,
    closeConfirm
  } = useModal();

  if (!isOpen) return null;

  const handleSettings = () => {
    navigate('/settings');
    onClose();
  };

  const handleLogoutClick = () => {
    askConfirm(
      tBtn('logout'),
      t('confirm_logout'),
      () => { logout(); navigate('/'); onClose(); },
      'danger'
    );
  };

  const handleOverlayClick = () => {
    if (confirmConfig.isOpen || alertConfig.isOpen) return;
    onClose();
  };

  return createPortal(
    <>
      <div className="dropdown-overlay" onClick={handleOverlayClick} />
      <div className="user-quick-dropdown" onClick={(e) => e.stopPropagation()}>
        <div className="dropdown-header">
          {loading ? (
            <p className="user-name">{tBtn('loading')}</p>
          ) : (
            <>
              <p className="user-name">{currentUser?.name || currentUser?.username || 'Guest'}</p>
              <p className="user-status">{currentUser ? 'Online' : 'Offline'}</p>
            </>
          )}
        </div>
        <hr />

        <div className="dropdown-body">
          <button className="dropdown-item" onClick={handleSettings}>
            <i className="ti ti-settings" /> {tNav('settings')}
          </button>
        </div>

        <hr />

        <button className="dropdown-item logout" onClick={handleLogoutClick}>
          <i className="ti ti-logout" /> {tBtn('logout')}
        </button>
      </div>

      <Confirm {...confirmConfig} onClose={closeConfirm} />
      <Alert {...alertConfig} onClose={closeAlert} />
    </>,
    document.body
  );
};

export default UserDropdown;