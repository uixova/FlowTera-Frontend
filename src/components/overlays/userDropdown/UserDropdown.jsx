import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../hooks/useModal';
import Confirm from '../Confirm';
import Alert from '../Alert';
import './UserDropdown.css';

const UserDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser, loading, logout } = useAuth();

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
      "Oturumu Kapat",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      () => {
        logout();
        navigate('/');
        onClose();
      },
      "danger"
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
            <p className="user-name">Yükleniyor...</p>
          ) : (
            <>
              <p className="user-name">{currentUser?.name || currentUser?.username || 'Misafir Kullanıcı'}</p>
              <p className="user-status">
                {currentUser ? 'Çevrim içi' : 'Bağlantı Kesildi'}
              </p>
            </>
          )}
        </div>
        <hr />

        <div className="dropdown-body">
          <button className="dropdown-item" onClick={handleSettings}>
            <i className="ti ti-settings"></i> Ayarlar
          </button>
        </div>

        <hr />

        <button className="dropdown-item logout" onClick={handleLogoutClick}>
          <i className="ti ti-logout"></i> Hesaptan Çık
        </button>
      </div>

      <Confirm {...confirmConfig} onClose={closeConfirm} />
      <Alert {...alertConfig} onClose={closeAlert} />
    </>,
    document.body
  );
};

export default UserDropdown;