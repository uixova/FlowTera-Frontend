import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../components/components.css/UserDropdown.css';

const UserDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  {/* Ayarlar sayfasına yönlendirme işlemi (örnek) */}
  const handleSettings = () => {
    navigate('/settings');
    onClose();
  };

  {/* Çıkış yapma işlemi (örnek) */}
  const handleLogout = () => {
    alert('Çıkış yapıldı!');
    onClose();
  };

  return (
    <>
      <div className="dropdown-overlay" onClick={onClose}></div>
      
      <div className="user-quick-dropdown active" onClick={(e) => e.stopPropagation()}>
        <div className="dropdown-header">
          <p className="user-name">Ahmet Yılmaz</p>
          <p className="user-status">Çevrim içi</p>
        </div>
        <hr />
        <button className="dropdown-item" onClick={handleSettings}>
          <i className="ti ti-settings"></i> Ayarlar
        </button>
        <button className="dropdown-item logout" onClick={handleLogout}>
          <i className="ti ti-logout"></i> Hesaptan Çık
        </button>
      </div>
    </>
  );
};

export default UserDropdown;