import React, { useRef, useState } from 'react';
import PhoneNumber from '../../../components/overlays/phone/PhoneNumber';
import './Profile.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Profile = ({ user }) => {
    const fileInputRef                      = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
    const [avatarError,   setAvatarError]   = useState('');
    const [phone,         setPhone]         = useState(user?.phone || '');

    const handleAvatarPick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            setAvatarError('Yalnızca JPG, PNG veya WEBP formatına izin verilir.');
            e.target.value = '';
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
                <div className="st-user-top">
                    <div className="st-avatar-box">
                        <img src={avatarPreview || user.avatar} alt="Avatar" />
                        <div className="st-avatar-badge" onClick={() => fileInputRef.current?.click()}>
                            <i className="ti ti-camera" />
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
                            <div className={`status-dot ${user.status}`} />
                        </div>
                        <div className="plan-pill">
                            <i className="ti ti-crown" />
                            {user.subscription?.plan?.toUpperCase()} Hesap
                        </div>
                    </div>
                </div>

                {avatarError && <p className="st-avatar-error">{avatarError}</p>}

                <div className="st-form-grid">
                    <div className="st-input-group static-field">
                        <label>Kullanıcı ID</label>
                        <div className="static-value">{user.id}</div>
                    </div>
                    <div className="st-input-group static-field">
                        <label>Katılma Tarihi</label>
                        <div className="static-value">{user.joinedDate}</div>
                    </div>

                    <div className="st-input-group">
                        <label>Tam İsim</label>
                        <input type="text" defaultValue={user.name} placeholder="Adınız" />
                    </div>
                    <div className="st-input-group">
                        <label>Kullanıcı Adı</label>
                        <input type="text" defaultValue={user.username} placeholder="kullanici_adi" />
                    </div>
                    <div className="st-input-group">
                        <label>E-posta Adresi</label>
                        <input type="email" defaultValue={user.email} placeholder="email@ornek.com" />
                    </div>
                    <div className="st-input-group">
                        <label>Telefon Numarası</label>
                        <PhoneNumber 
                            value={phone} 
                            onChange={setPhone} 
                            placeholder="5xx xxx xx xx"
                        />
                    </div>
                </div>

                <div className="st-form-footer">
                    <button className="st-btn-save">
                        <i className="ti ti-device-floppy" />
                        Profili Güncelle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;