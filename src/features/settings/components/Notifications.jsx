import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { settingsService } from '../services/settingService';
import './Notifications.css';

const NOTIF_ITEMS = [
    {
        key:   'email',
        icon:  'ti-mail',
        title: 'E-posta Bildirimleri',
        desc:  'Günlük özetler, gider raporları ve sistem güncellemelerini e-posta yoluyla alın.',
    },
    {
        key:   'sms',
        icon:  'ti-message-dots',
        title: 'SMS Uyarıları',
        desc:  'Kritik güvenlik uyarıları ve büyük işlemler için anında mesaj alın.',
    },
    {
        key:   'push',
        icon:  'ti-device-mobile-message',
        title: 'Push Bildirimleri',
        desc:  'Gerçek zamanlı takip için masaüstü ve mobil tarayıcı bildirimleri.',
    },
];

const Notification = ({ notifConfig, setNotifConfig }) => {
    const { currentUserId } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    if (!notifConfig) return null;

    const handleToggle = (key) =>
        setNotifConfig((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleSave = async () => {
        if (!currentUserId) return;
        setSaving(true);
        const result = await settingsService.updateNotifications(currentUserId, notifConfig);
        setSaving(false);
        setSaveMsg(result.success ? 'Kaydedildi.' : 'Hata oluştu.');
        setTimeout(() => setSaveMsg(''), 3000);
    };

    return (
        <div className="st-content-section">
            <div className="st-header-box">
                <h2>Bildirimler</h2>
                <p>Güncel kalın. Uyarıları nasıl ve ne zaman almak istediğinizi seçin.</p>
            </div>

            <div className="st-card">
                {NOTIF_ITEMS.map(({ key, icon, title, desc }) => (
                    <div className="st-toggle-row" key={key}>
                        <div className="toggle-left">
                            <div className="toggle-icon-wrap">
                                <i className={`ti ${icon}`} />
                            </div>
                            <div className="toggle-text">
                                <h4>{title}</h4>
                                <p>{desc}</p>
                                <span className={`toggle-status ${notifConfig[key] ? 'on' : 'off'}`}>
                                    {notifConfig[key] ? 'Aktif' : 'Pasif'}
                                </span>
                            </div>
                        </div>
                        <label className="st-switch">
                            <input
                                type="checkbox"
                                checked={notifConfig[key]}
                                onChange={() => handleToggle(key)}
                            />
                            <span className="st-slider" />
                        </label>
                    </div>
                ))}

                <div className="notif-footer">
                    <span className="notif-footer-hint">
                        {saveMsg || 'Değişiklikleri kaydetmek için butona basın'}
                    </span>
                    <button className="st-btn-save" onClick={handleSave} disabled={saving}>
                        <i className={`ti ${saving ? 'ti-loader-2' : 'ti-device-floppy'}`} />
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notification;