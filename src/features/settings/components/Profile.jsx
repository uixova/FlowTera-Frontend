import React, { useRef, useState } from 'react';
import './Profile.css';

const Profile = ({ user }) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarPick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!allowedImageTypes.includes(file.type)) {
      setAvatarError('Only JPG, PNG or WEBP images are allowed.');
      event.target.value = '';
      return;
    }

    setAvatarError('');
    setAvatarPreview(URL.createObjectURL(file));
  };

  if (!user) return null;

  return (
    <div className="st-content-section">
      <div className="st-header-box">
        <h2>Profil Detayları</h2>
        <p>Kişisel bilgiler ve profil kimliği.</p>
      </div>
      
      <div className="st-card">
        {/* Üst Profil Alanı */}
        <div className="st-user-top">
          <div className="st-avatar-box">
            <img src={avatarPreview || user.avatar} alt="Avatar" />
            <div className="st-avatar-badge" onClick={() => fileInputRef.current?.click()}>
              <i className="ti ti-camera"></i>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleAvatarPick}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="st-user-meta">
            <div className="name-row">
                <h4>{user.name}</h4>
                <div className={`status-dot ${user.status}`}></div>
            </div>
            <span>{user.subscription?.plan?.toUpperCase()} Hesap</span>
            </div>
        </div>
        {avatarError && <p className="st-avatar-error">{avatarError}</p>}

        {/* Form Alanı */}
        <div className="st-form-grid">
          {/* Read-Only Alanlar (Tıklanamaz) */}
          <div className="st-input-group static-field">
            <label>Kullanıcı ID'si</label>
            <div className="static-value">{user.id}</div>
          </div>
          <div className="st-input-group static-field">
            <label>Katılma Tarihi</label>
            <div className="static-value">{user.joinedDate}</div>
          </div>

          {/* Düzenlenebilir Alanlar */}
          <div className="st-input-group">
            <label>Tam İsim</label>
            <input type="text" defaultValue={user.name} placeholder="Adın" />
          </div>
          <div className="st-input-group">
            <label>Kullanıcı Adı</label>
            <input type="text" defaultValue={user.username} placeholder="username" />
          </div>
          <div className="st-input-group">
            <label>Email Adresi</label>
            <input type="email" defaultValue={user.email} placeholder="email@example.com" />
          </div>
          <div className="st-input-group">
            <label>Telefon Numarası</label>
            <input type="text" defaultValue={user.phone} placeholder="+90 5XX XXX XX XX" />
          </div>
        </div>
        
        {/* Buton ile form arasına boşluk */}
        <div className="st-form-footer">
            <button className="st-btn-save">Profili Güncelle</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;