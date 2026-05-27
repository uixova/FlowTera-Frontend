import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { settingsService } from '../services/settingService';
import './Notifications.css';

const NOTIF_KEYS = [
    { key: 'email', icon: 'ti-mail', titleKey: 'email_title', descKey: 'email_desc' },
    { key: 'sms', icon: 'ti-message-dots', titleKey: 'sms_title', descKey: 'sms_desc' },
    { key: 'push', icon: 'ti-device-mobile-message', titleKey: 'push_title', descKey: 'push_desc' },
];

const Notification = ({ notifConfig, setNotifConfig }) => {
    const { t } = useTranslation('settings.notifications');
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
        setSaveMsg(result.success ? t('saved') : t('save_error'));
        setTimeout(() => setSaveMsg(''), 3000);
    };

    return (
        <div className="st-content-section">
            <div className="st-header-box">
                <h2>{t('title')}</h2>
                <p>{t('subtitle')}</p>
            </div>

            <div className="st-card">
                {NOTIF_KEYS.map(({ key, icon, titleKey, descKey }) => (
                    <div className="st-toggle-row" key={key}>
                        <div className="toggle-left">
                            <div className="toggle-icon-wrap">
                                <i className={`ti ${icon}`} />
                            </div>
                            <div className="toggle-text">
                                <h4>{t(titleKey)}</h4>
                                <p>{t(descKey)}</p>
                                <span className={`toggle-status ${notifConfig[key] ? 'on' : 'off'}`}>
                                    {notifConfig[key] ? t('status_active') : t('status_inactive')}
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
                        {saveMsg || t('hint_save')}
                    </span>
                    <button className="st-btn-save" onClick={handleSave} disabled={saving}>
                        <i className={`ti ${saving ? 'ti-loader-2' : 'ti-device-floppy'}`} />
                        {saving ? t('saving') : t('save_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notification;
