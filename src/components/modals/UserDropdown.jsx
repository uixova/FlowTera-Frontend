import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 
import '../../components/components.css/UserDropdown.css';

const UserDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth(); // Hook'tan verileri çekiyoruz

  if (!isOpen) return null;

  // Ayarlar sayfasına yönlendirme
  const handleSettings = () => {
    navigate('/settings');
    onClose();
  };

  // Çıkış yapma işlemi
  const handleLogout = () => {
    alert('Sistemden çıkış yapılıyor...');
    onClose();
  };

  return (
    <>
      <div className="dropdown-overlay" onClick={onClose}></div>
      
      <div className="user-quick-dropdown active" onClick={(e) => e.stopPropagation()}>
        <div className="dropdown-header">
          {loading ? (
            <p className="user-name">Yükleniyor...</p>
          ) : (
            <>
              {/* API'den gelen kullanıcı adı veya email */}
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
          
          <button className="dropdown-item" onClick={() => navigate('/profile')}>
            <i className="ti ti-user"></i> Profilim
          </button>
        </div>

        <hr />
        
        <button className="dropdown-item logout" onClick={handleLogout}>
          <i className="ti ti-logout"></i> Hesaptan Çık
        </button>
      </div>
    </>
  );
};

export default UserDropdown;