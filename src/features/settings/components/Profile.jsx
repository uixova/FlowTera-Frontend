import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../locales/i18n';
import PhoneNumber from '../../../components/overlays/phone/PhoneNumber';
import { settingsService } from '../services/settingService';
import './Profile.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Profile = ({ user }) => {
    const { t } = useTranslation('settings.profile');
    const { t: tBtn } = useTranslation('common.buttons');
    const fileInputRef                        = useRef(null);
    const [showId,        setShowId]          = useState(false);
    const [selectedFile,  setSelectedFile]    = useState(null);
    const [avatarPreview, setAvatarPreview]   = useState(user?.avatar || '');
    const [avatarError,   setAvatarError]     = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [saving,        setSaving]          = useState(false);
    const [saveMsg,       setSaveMsg]         = useState('');

    const [form, setForm] = useState({
        name:     user?.name     || '',
        username: user?.username || '',
        email:    user?.email    || '',
        phone:    user?.phone    || '',
    });

    const handleAvatarPick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!ALLOWED_TYPES.includes(file.type)) {
            setAvatarError(t('err_invalid_type'));
            e.target.value = '';
            return;
        }
        setAvatarError('');
        setSelectedFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        setSaveMsg('');

        if (selectedFile) {
            setAvatarUploading(true);
            const uploadResult = await settingsService.uploadAvatar(user.id, selectedFile);
            setAvatarUploading(false);
            if (uploadResult.success) {
                setAvatarPreview(uploadResult.url);
                setSelectedFile(null);
            } else {
                setAvatarError(t('err_upload_fail'));
                setSaving(false);
                return;
            }
        }

        const result = await settingsService.updateProfile(user.id, {
            name:     form.name,
            username: form.username,
            email:    form.email,
            phone:    form.phone,
        });
        setSaving(false);
        setSaveMsg(result.success ? t('save_success') : t('save_error'));
        if (result.success) setTimeout(() => setSaveMsg(''), 3000);
    };

    if (!user) return null;

    return (
        <div className="st-content-section">
            <div className="st-header-box">
                <h2>{t('title')}</h2>
                <p>{t('subtitle')}</p>
            </div>

            <div className="st-card">
                <div className="st-user-top">
                    <div className="st-avatar-box">
                        <img src={avatarPreview || user.avatar || '/Logo.png'} alt="Avatar" onError={(e) => { e.currentTarget.src = '/Logo.png'; }} />
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
                            {user.subscription?.plan?.toUpperCase()} {t('account_label')}
                        </div>
                    </div>
                </div>

                {avatarError && <p className="st-avatar-error">{avatarError}</p>}

                <div className="st-form-grid">
                    <div className="st-input-group static-field">
                        <label>{t('user_id_label')}</label>
                        <div className="static-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ flex: 1, letterSpacing: showId ? 'normal' : '0.1em', filter: showId ? 'none' : 'blur(5px)', userSelect: showId ? 'text' : 'none', transition: 'filter 0.2s' }}>
                                {user.id}
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowId(v => !v)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-2)', padding: '2px 4px', flexShrink: 0 }}
                                title={showId ? t('hide') : t('show')}
                            >
                                <i className={`ti ${showId ? 'ti-eye-off' : 'ti-eye'}`} />
                            </button>
                        </div>
                    </div>
                    <div className="st-input-group static-field">
                        <label>{t('joined_date')}</label>
                        <div className="static-value">
                            {user.joinedDate
                                ? new Date(user.joinedDate).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : '—'}
                        </div>
                    </div>

                    <div className="st-input-group">
                        <label>{t('name')}</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t('name_placeholder')} />
                    </div>
                    <div className="st-input-group">
                        <label>{t('username_label')}</label>
                        <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="kullanici_adi" />
                    </div>
                    <div className="st-input-group">
                        <label>{t('email')}</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@ornek.com" />
                    </div>
                    <div className="st-input-group">
                        <label>{t('phone_label')}</label>
                        <PhoneNumber
                            value={form.phone}
                            onChange={(val) => setForm(prev => ({ ...prev, phone: val }))}
                            placeholder="5xx xxx xx xx"
                            authMode={true}
                        />
                    </div>
                </div>

                <div className="st-form-footer">
                    {saveMsg && <span className="st-save-msg">{saveMsg}</span>}
                    <button className="st-btn-save" onClick={handleSave} disabled={saving || avatarUploading}>
                        <i className={`ti ${(saving || avatarUploading) ? 'ti-loader-2' : 'ti-device-floppy'}`} />
                        {avatarUploading ? tBtn('loading') : saving ? tBtn('saving') : tBtn('save_changes')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
