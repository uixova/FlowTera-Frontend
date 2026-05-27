import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Loader from '../../../components/ui/Loader';
import './TeamSettings.css';
import { teamsService } from '../services/teamsService';
import { useAuth } from '../../../context/AuthContext';
import { useTeam } from '../../../context/TeamContext';
import { useModal } from '../../../hooks/useModal';
import Alert from '../../../components/overlays/Alert';
import Confirm from '../../../components/overlays/Confirm';

const TeamSettings = ({ team, onBack, onSuccess }) => {
  const { t } = useTranslation('teams.settings');
  const { t: tBtn } = useTranslation('common.buttons');
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const { currentUser: authUser, loading: authLoading } = useAuth();
  const { selectedTeamId } = useTeam();
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [planMaxMembers, setPlanMaxMembers] = useState(5);
  const [loading, setLoading] = useState(true);
  const [teamMembersCount, setTeamMembersCount] = useState(0);

  const canManageMembers = useMemo(() => {
    if (authLoading || !authUser || String(authUser?.isDeleted) === 'true') return false;
    const roleObj = authUser?.role?.find(r => String(r.teamId) === String(selectedTeamId));
    if (!roleObj) return false;
    if (Array.isArray(roleObj.permissions) && roleObj.permissions.includes('team_settings')) return false;
    return true;
  }, [authLoading, authUser, selectedTeamId]);

  const {
    alertConfig, showAlert, closeAlert,
    confirmConfig, askConfirm, closeConfirm
  } = useModal();

  const [formData, setFormData] = useState({
    teamName: team?.name || '',
    category: 'Software Development',
    workspaceType: 'Corporate',
    status: 'active',
    privacy: 'private',
    maxExpenseLimit: 0,
    memberLimit: 1,
    autoApproved: false,
    autoApprovedLimit: 0,
    currency: 'USD'
  });

  const [preview, setPreview] = useState(team?.image || 'https://via.placeholder.com/160?text=LOGO');
  const [logoFile, setLogoFile] = useState(null);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef(null);

  const loadTeamData = useCallback(async () => {
    if (!selectedTeamId) return;
    try {
      setLoading(true);
      const [data, members] = await Promise.all([
        teamsService.getTeamSettings(selectedTeamId),
        teamsService.getTeamMembers(selectedTeamId)
      ]);

      if (data) {
        const activeLimit = data.adminPlanLimit || 5;
        setAvailableFeatures(data.availableFeatures || []);
        setPlanMaxMembers(activeLimit);
        setTeamMembersCount(members?.length || 0);

        setFormData({
          teamName: data.name || '',
          category: data.category || 'Software Development',
          workspaceType: data.settings?.workspaceType || 'Corporate',
          status: data.settings?.status || 'active',
          privacy: data.settings?.privacy || 'private',
          maxExpenseLimit: data.settings?.maxExpenseLimit || 0,
          memberLimit: data.settings?.memberLimit || 1,
          autoApproved: data.settings?.autoApproved || false,
          autoApprovedLimit: data.settings?.autoApprovedLimit || 0,
          currency: data.settings?.currency || 'USD'
        });
        setPreview(data.image || '/Logo.png');
      }
    } catch (err) {
      console.error('Data Download Error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId]);

  const hasFeature = (featureKey) => availableFeatures.includes(featureKey);

  useEffect(() => {
    if (authLoading) return;
    if (canManageMembers) {
      loadTeamData();
    } else {
      setLoading(false);
    }
  }, [loadTeamData, canManageMembers, authLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (['maxExpenseLimit', 'memberLimit', 'autoApprovedLimit'].includes(name)) {
      finalValue = value === '' ? '' : Number(value);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const updatePayload = {
        name: formData.teamName,
        category: formData.category,
        settings: {
          workspaceType: formData.workspaceType,
          status: formData.status,
          privacy: formData.privacy,
          maxExpenseLimit: formData.maxExpenseLimit,
          memberLimit: formData.memberLimit,
          autoApproved: formData.autoApproved,
          autoApprovedLimit: formData.autoApprovedLimit,
          currency: formData.currency
        }
      };
      if (logoFile) {
        const imgResult = await teamsService.uploadTeamImage(selectedTeamId, logoFile);
        if (imgResult.success && imgResult.url) {
          setPreview(imgResult.url);
          setLogoFile(null);
        }
      }
      const result = await teamsService.updateTeamSettings(selectedTeamId, updatePayload);
      if (result.success) {
        if (onSuccess) await onSuccess();
        await loadTeamData();
        showAlert(
          t('alert_success'),
          formData.status === 'maintenance' ? t('alert_maintenance_msg') : t('alert_update_msg'),
          'success'
        );
        setLogoFile(null);
      } else {
        showAlert(t('alert_err_title'), result.message || t('alert_err_save'), 'error');
      }
    } catch (err) {
      console.error('Güncelleme hatası:', err);
      showAlert(t('alert_err_title'), t('alert_err_update'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteTeam = async () => {
    try {
      setLoading(true);
      const result = await teamsService.deleteTeam(selectedTeamId);
      if (result.success) {
        closeConfirm();
        showAlert(t('alert_delete_started'), t('alert_delete_msg'), 'warning');
        setTimeout(() => onBack(), 2000);
      }
    } catch (err) {
      console.error('Silme hatası:', err);
      showAlert(t('alert_delete_err_title'), t('alert_delete_err_msg'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (teamMembersCount > 1) {
      showAlert(
        t('alert_org_full_title'),
        t('alert_org_full_msg', { count: teamMembersCount - 1 }),
        'warning'
      );
      return;
    }
    if (formData.status !== 'maintenance') {
      askConfirm(
        t('confirm_maintenance_title'),
        t('confirm_maintenance_msg'),
        () => askConfirm(
          t('confirm_final_title'),
          t('confirm_final_msg', { name: formData.teamName }),
          executeDeleteTeam,
          'danger'
        ),
        'warning'
      );
      return;
    }
    askConfirm(
      t('confirm_delete_title'),
      t('confirm_delete_msg', { name: formData.teamName }),
      executeDeleteTeam,
      'danger'
    );
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLogoError(t('err_logo_type'));
      setLogoFile(null);
      e.target.value = '';
      return;
    }
    setLogoError('');
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  if (authLoading || loading) {
    return (
      <div className="full-screen-loader">
        <Loader type="butterfly" />
      </div>
    );
  }

  if (!canManageMembers) {
    return (
      <div className="tm-page-layout">
        <div className="tm-container">
          <div className="tm-page-header">
            <div className="tm-header-left">
              <h1>{t('title')}</h1>
            </div>
            <button className="tm-back-btn" onClick={onBack}>{t('back_to_team')}</button>
          </div>
          <div style={{ padding: '20px 0', color: '#ff4757', fontWeight: 700 }}>
            {t('no_permission')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page-layout">
      <div className="tm-container">
        <div className="tm-page-header">
          <div className="tm-header-left">
            <h1>{t('title')}</h1>
            <span className="current-id-badge">ID: {selectedTeamId}</span>
          </div>
          <button className="tm-back-btn" onClick={onBack}>{t('back_to_team')}</button>
        </div>

        <form id="editTeamForm" onSubmit={handleUpdate}>
          <div className="tm-setup-grid">
            <aside className="tm-setup-sidebar">
              <div className="tm-sticky-card">
                <div className="tm-preview-wrapper" onClick={() => fileInputRef.current.click()}>
                  <img src={preview} alt="Team Logo" />
                  <div className="tm-upload-overlay"><span style={{ fontSize: '24px' }}>+</span></div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={handleLogoSelect}
                />
                <button type="button" className="tm-upload-btn" onClick={() => fileInputRef.current.click()}>{tBtn('upload')}</button>
                {logoError && <span className="tm-upload-error">{logoError}</span>}
                <span className="tm-preview-label">{t('org_icon')}</span>
              </div>
            </aside>

            <main className="tm-setup-main">
              <section className="tm-form-section">
                <h3 className="section-title">{t('general_section')}</h3>
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>{t('team_name')}</label>
                    <input type="text" name="teamName" value={formData.teamName} onChange={handleChange} required />
                  </div>
                  <div className="tm-input-group">
                    <label>{t('category_label')}</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                      <option value="Software Development">{t('cat_software')}</option>
                      <option value="Marketing & Ads">{t('cat_marketing')}</option>
                      <option value="Logistics">{t('cat_logistics')}</option>
                      <option value="Finance">{t('cat_finance')}</option>
                    </select>
                  </div>
                </div>
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>{t('team_type_label')}</label>
                    <select name="workspaceType" value={formData.workspaceType} onChange={handleChange}>
                      <option value="Corporate">{t('type_corporate')}</option>
                      <option value="Personal">{t('type_personal')}</option>
                    </select>
                  </div>
                  <div className="tm-input-group">
                    <label>{t('status_label')}</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">{t('status_active')}</option>
                      <option value="maintenance">{t('status_maintenance')}</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="tm-form-section limit-section-box">
                <h3 className="section-title">{t('limits_section')}</h3>
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>{t('expense_limit_label', { currency: formData.currency })}</label>
                    <input type="number" name="maxExpenseLimit" value={formData.maxExpenseLimit} onChange={handleChange} />
                  </div>
                  <div className="tm-input-group">
                    <label>{t('member_capacity_label', { max: planMaxMembers })}</label>
                    <input type="number" name="memberLimit" value={formData.memberLimit === 0 ? '' : formData.memberLimit} onChange={handleChange} max={planMaxMembers} min="1" />
                  </div>
                </div>
                <div className="tm-automation-settings">
                  <div className={`tm-checkbox-wrapper ${!hasFeature('automation') ? 'feature-locked' : ''}`}>
                    <label className="tm-custom-checkbox">
                      <input
                        type="checkbox"
                        name="autoApproved"
                        checked={formData.autoApproved}
                        onChange={handleChange}
                        disabled={!hasFeature('automation')}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">
                        {t('auto_approve_label')}
                        {!hasFeature('automation') && <span className="lock-badge">{t('auto_approve_premium')}</span>}
                      </span>
                    </label>

                    {!hasFeature('automation') && (
                      <div className="upgrade-notice">
                        {t('upgrade_notice')}
                      </div>
                    )}
                  </div>
                  {formData.autoApproved && hasFeature('automation') && (
                    <div className="tm-input-group animate-in">
                      <label>{t('auto_approve_limit_label', { currency: formData.currency })}</label>
                      <input
                        type="number"
                        name="autoApprovedLimit"
                        value={formData.autoApprovedLimit}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>
              </section>

              <section className="tm-form-section">
                <h3 className="section-title">{t('privacy_section')}</h3>
                <div className="tm-radio-vertical">
                  <label className={`tm-radio-option ${formData.privacy === 'private' ? 'selected' : ''}`}>
                    <input type="radio" name="privacy" value="private" checked={formData.privacy === 'private'} onChange={handleChange} />
                    <i className="ti ti-lock option-icon"></i>
                    <div className="option-text">
                      <strong>{t('privacy_private_title')}</strong>
                      <span>{t('privacy_private_desc')}</span>
                    </div>
                  </label>
                  <label className={`tm-radio-option ${formData.privacy === 'internal' ? 'selected' : ''}`}>
                    <input type="radio" name="privacy" value="internal" checked={formData.privacy === 'internal'} onChange={handleChange} />
                    <i className="ti ti-world option-icon"></i>
                    <div className="option-text">
                      <strong>{t('privacy_internal_title')}</strong>
                      <span>{t('privacy_internal_desc')}</span>
                    </div>
                  </label>
                </div>
              </section>

              <div className="tm-setup-footer">
                <button type="button" className="tm-btn-delete" onClick={handleDeleteClick}>{tBtn('delete_team')}</button>
                <div className="tm-footer-right">
                  <button type="button" className="tm-btn-ghost" onClick={onBack}>{tBtn('cancel')}</button>
                  <button type="submit" className="tm-btn-primary">{tBtn('update')}</button>
                </div>
              </div>
            </main>
          </div>
        </form>
      </div>

      <Alert {...alertConfig} onClose={closeAlert} />
      <Confirm {...confirmConfig} onClose={closeConfirm} />
    </div>
  );
};

export default TeamSettings;
