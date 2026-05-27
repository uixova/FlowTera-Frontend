import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Security.css';
import { useModal } from '../../../hooks/useModal';
import Confirm from '../../../components/overlays/Confirm';
import Alert from '../../../components/overlays/Alert';
import { useAuth } from '../../../context/AuthContext';
import { teamsService } from '../../teams/services/teamsService';
import { settingsService } from '../services/settingService';

const Security = () => {
    const { t } = useTranslation('settings.security');
    const { t: tBtn } = useTranslation('common.buttons');
    const [twoFA,     setTwoFA]     = useState(false);
    const [loading,   setLoading]   = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg,     setPwMsg]     = useState({ text: '', ok: true });
    const [pwForm,    setPwForm]    = useState({ currentPassword: '', newPassword: '' });
    const navigate                  = useNavigate();
    const { logout, currentUser, currentUserId } = useAuth();

    const handlePwChange = (e) => {
        const { name, value } = e.target;
        setPwForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSave = async () => {
        if (!currentUserId || !pwForm.currentPassword || !pwForm.newPassword) return;
        setPwLoading(true);
        setPwMsg({ text: '', ok: true });
        const result = await settingsService.updatePassword(currentUserId, pwForm);
        setPwLoading(false);
        setPwMsg({ text: result.success ? t('success_password') : (result.message || t('err_general')), ok: result.success });
        if (result.success) setPwForm({ currentPassword: '', newPassword: '' });
    };

    const {
        alertConfig,   showAlert,   closeAlert,
        confirmConfig, askConfirm,  closeConfirm,
    } = useModal();

    const checkAdminConstraints = async () => {
        try {
            setLoading(true);
            const adminTeams = currentUser?.role
                ?.filter(r => r.roleName === 'Admin')
                .map(r => r.teamId) || [];

            if (adminTeams.length === 0) return { canDelete: true };

            const problematicTeams = [];

            for (const teamId of adminTeams) {
                const members = await teamsService.getTeamMembers(teamId);
                const otherAdmins = members.filter(
                    m => m.roleName === 'Admin' && String(m.id) !== String(currentUser.id)
                );
                if (otherAdmins.length === 0) {
                    const teamInfo = await teamsService.getTeamSettings(teamId);
                    problematicTeams.push(teamInfo?.name || t('team_id_fallback', { id: teamId }));
                }
            }

            if (problematicTeams.length > 0) return { canDelete: false, teams: problematicTeams };
            return { canDelete: true };
        } catch (err) {
            console.error('Güvenlik kontrolü başarısız:', err);
            return { canDelete: false, error: true };
        } finally {
            setLoading(false);
        }
    };

    const executeDeleteAccount = async () => {
        try {
            setLoading(true);
            const result = await settingsService.deleteAccount(currentUserId);
            if (!result.success) {
                showAlert(t('alert_err_title'), result.message || t('err_delete_fail'), 'error');
                return;
            }
            closeConfirm();
            showAlert(
                t('alert_delete_title'),
                t('alert_delete_msg'),
                'warning',
                () => {
                    if (logout) logout();
                    navigate('/');
                }
            );
        } catch (err) {
            console.error('Silme hatası:', err);
            showAlert(t('alert_err_title'), t('err_action_fail'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = async () => {
        const check = await checkAdminConstraints();

        if (check.error) {
            showAlert(t('alert_sys_error_title'), t('alert_sys_error_msg'), 'error');
            return;
        }

        if (!check.canDelete) {
            showAlert(
                t('alert_blocked_title'),
                t('alert_blocked_msg', { teams: check.teams.join('\n • ') }),
                'warning'
            );
            return;
        }

        askConfirm(
            t('confirm_delete_title'),
            t('confirm_delete_msg'),
            executeDeleteAccount,
            'warning'
        );
    };

    return (
        <div className="st-content-section">
            <div className="st-header-box">
                <h2>{t('title')}</h2>
                <p>{t('subtitle')}</p>
            </div>

            <div className="st-card">
                <div className="security-section-label">
                    <i className="ti ti-key" />
                    <h4>{t('change_password')}</h4>
                </div>
                <div className="st-form-grid">
                    <div className="st-input-group">
                        <label>{t('current_password')}</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={pwForm.currentPassword}
                            onChange={handlePwChange}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="st-input-group">
                        <label>{t('new_password')}</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={pwForm.newPassword}
                            onChange={handlePwChange}
                            placeholder={t('pw_placeholder_min')}
                        />
                    </div>
                </div>
                {pwMsg.text && (
                    <p style={{ fontSize: '0.82rem', color: pwMsg.ok ? 'var(--green)' : 'var(--red-alt)', marginBottom: '8px' }}>
                        {pwMsg.text}
                    </p>
                )}
                <button className="st-btn-save security-btn" onClick={handlePasswordSave} disabled={pwLoading}>
                    <i className={`ti ${pwLoading ? 'ti-loader-2' : 'ti-device-floppy'}`} />
                    {pwLoading ? tBtn('saving') : t('change_password')}
                </button>
            </div>

            <div className="security-row-grid">
                <div className="st-card">
                    <div className="security-toggle-row">
                        <div>
                            <h4>
                                {t('two_factor')}
                                <span className="coming-soon-tag">{t('coming_soon')}</span>
                            </h4>
                            <p>{t('two_factor_sub')}</p>
                            <div className={`two-fa-status${twoFA ? ' active' : ''}`}>
                                {twoFA ? t('two_fa_protected') : t('two_fa_not_set')}
                            </div>
                        </div>
                        <label className="st-switch">
                            <input
                                type="checkbox"
                                checked={twoFA}
                                onChange={() => setTwoFA(v => !v)}
                                disabled
                            />
                            <span className="st-slider" />
                        </label>
                    </div>
                </div>

                <div className="st-card">
                    <div className="security-toggle-row">
                        <div>
                            <h4>
                                {t('stealth_mode')}
                                <span className="coming-soon-tag">{t('coming_soon')}</span>
                            </h4>
                            <p>{t('stealth_mode_sub')}</p>
                        </div>
                        <label className="st-switch">
                            <input type="checkbox" disabled />
                            <span className="st-slider" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="st-danger-zone">
                <div className="danger-header">
                    <h4>{t('danger_zone')}</h4>
                    <p>{t('delete_account_sub')}</p>
                </div>
                <button
                    className="st-btn-delete"
                    onClick={handleDeleteClick}
                    disabled={loading}
                >
                    {loading ? (
                        <><i className="ti ti-loader-2" style={{ animation: 'spin .7s linear infinite' }} /> {t('security_check')}</>
                    ) : (
                        <><i className="ti ti-trash" /> {t('delete_account')}</>
                    )}
                </button>
            </div>

            <Confirm {...confirmConfig} onClose={closeConfirm} />
            <Alert   {...alertConfig}   onClose={closeAlert}   />
        </div>
    );
};

export default Security;
