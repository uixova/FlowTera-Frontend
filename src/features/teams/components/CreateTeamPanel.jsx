import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './CreateTeamPanel.css';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { useSubscription } from '../../../context/SubscriptionContext';

import { useModal } from '../../../hooks/useModal';
import Alert from '../../../components/overlays/Alert';
import { teamsService } from '../services/teamsService';

const INITIAL_FORM_STATE = {
  teamName: '',
  category: 'Software Development',
  currency: 'USD',
  workspaceType: 'Corporate',
  privacy: 'private',
  maxExpenseLimit: 1000,
  memberLimit: 5,
  autoApproved: false,
  autoApprovedLimit: 500
};

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/160?text=TEAM';

const CreateTeamPanel = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation('teams.create');
  const { t: tModals } = useTranslation('common.modals');

  const { currentPlan } = useSubscription();
  const { alertConfig, showAlert, closeAlert } = useModal();

  const planMaxMembers = useMemo(() => {
    return currentPlan?.maxMembersPerTeam || 5;
  }, [currentPlan]);

  const hasAutomation = useMemo(() => {
    return currentPlan?.feature_keys?.includes('automation');
  }, [currentPlan]);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [preview, setPreview] = useState(PLACEHOLDER_IMAGE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  // Formu sıfırlayan fonksiyon, modal kapandığında veya açıldığında çağrılır
  const resetForm = useCallback(() => {
    setFormData({
      ...INITIAL_FORM_STATE,
      memberLimit: Math.min(INITIAL_FORM_STATE.memberLimit, planMaxMembers)
    });
    setPreview(PLACEHOLDER_IMAGE);
    setIsSubmitting(false);
  }, [planMaxMembers]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    } else {
      setFormData(prev => ({
        ...prev,
        memberLimit: Math.min(prev.memberLimit, planMaxMembers)
      }));
    }
  }, [isOpen, planMaxMembers, resetForm]);

  // Form inputlarını yöneten genel değişiklik fonksiyonu
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    if (['maxExpenseLimit', 'memberLimit', 'autoApprovedLimit'].includes(name)) {
      const val = value === '' ? '' : Number(value);
      setFormData(prev => ({ ...prev, [name]: val }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Logo önizlemesi için dosya inputu değişiklik handler'ı
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.memberLimit > planMaxMembers) {
      showAlert(
        t('plan_limit_title'),
        t('plan_limit_msg', { max: planMaxMembers }),
        "warning"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name:              formData.teamName,
        category:          formData.category,
        currency:          formData.currency,
        workspaceType:     formData.workspaceType,
        planId:            currentPlan?.id || null,
        settings: {
          privacy:           formData.privacy,
          maxExpenseLimit:   formData.maxExpenseLimit,
          memberLimit:       formData.memberLimit,
          autoApproved:      formData.autoApproved,
          autoApprovedLimit: formData.autoApprovedLimit,
        },
      };
      const result = await teamsService.createTeam(payload);
      if (!result.success) {
        showAlert(tModals('error'), result.message || t('err_generic'), "error");
        return;
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      showAlert(tModals('error'), t('err_create'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sidebarTitle = (
    <div className="header-content">
      <h2>{t('panel_title')}</h2>
      {currentPlan?.name && (
        <span className={`plan-badge ${currentPlan.badge}`}>
          {currentPlan.name.toUpperCase()}
        </span>
      )}
    </div>
  );

  const sidebarFooter = (
    <div className="tm-panel-footer-alt"> 
      <button type="button" className="tm-btn-cancel" onClick={onClose} style={{flex: 1}}>{t('cancel_btn')}</button>
      <button type="submit" form="create-team-form" className="tm-btn-submit" style={{flex: 2}}>
        {isSubmitting ? t('creating') : t('btn_create')}
      </button>
    </div>
  );

  return (
    <>
      <ActionSidebar 
        isOpen={isOpen} 
        onClose={onClose} 
        title={sidebarTitle} 
        footer={sidebarFooter}
        width="460px"
      >
        <form id="create-team-form" onSubmit={handleSubmit} className="tm-panel-form-internal">
          <div className="tm-panel-body-no-scroll">
            
            <div className="tm-branding-section">
              <div className="tm-preview-wrapper large" onClick={() => fileInputRef.current?.click()}>
                <img src={preview} alt="Team Logo" />
                <div className="tm-upload-overlay">
                  <i className="ti ti-camera"></i>
                </div>
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={handleLogoChange} />
              <p className="tm-help-text">{t('logo_help')}</p>
            </div>

            <div className="tm-input-group">
              <label>{t('org_name_label')}</label>
              <input
                type="text" name="teamName" value={formData.teamName}
                onChange={handleChange} placeholder={t('org_name_placeholder')} required
              />
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

            <div className="tm-panel-section highlight">
              <label className="section-label">{t('limits_section')}</label>
              <div className="tm-grid-row">
                <div className="tm-input-group">
                  <label>{t('max_expense_label')} ({formData.currency})</label>
                  <input type="number" name="maxExpenseLimit" value={formData.maxExpenseLimit} onChange={handleChange} min="0" />
                </div>
                <div className="tm-input-group">
                  <label>{t('member_limit_label', { max: planMaxMembers })}</label>
                  <input
                    type="number"
                    name="memberLimit"
                    value={formData.memberLimit === 0 ? '' : formData.memberLimit}
                    onChange={handleChange}
                    max={planMaxMembers}
                    min="1"
                  />
                  {formData.memberLimit >= planMaxMembers && <span className="limit-warning">{t('limit_reached')}</span>}
                </div>
              </div>
            </div>

            <div className={`tm-panel-section automation-box ${!hasAutomation ? 'feature-locked' : ''}`}>
              <div className="tm-checkbox-group">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="autoApproved"
                    name="autoApproved"
                    checked={formData.autoApproved}
                    onChange={handleChange}
                    disabled={!hasAutomation}
                  />
                  <label htmlFor="autoApproved" style={{ opacity: !hasAutomation ? 0.6 : 1 }}>
                    {t('auto_approve_label')}
                    {!hasAutomation && (
                      <span className="lock-badge" style={{ marginLeft: '8px', fontSize: '10px', background: '#333', padding: '2px 6px', borderRadius: '4px', color: '#0ed45a' }}>
                        <i className="ti ti-lock"></i> PRO
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {!hasAutomation && (
                <p className="limit-warning" style={{ marginTop: '10px', fontSize: '11px' }}>
                  {t('plan_no_feature', { plan: currentPlan?.name })}
                </p>
              )}

              {formData.autoApproved && hasAutomation && (
                <div className="tm-input-group animate-in">
                  <label>{t('auto_approve_limit')} ({formData.currency})</label>
                  <input type="number" name="autoApprovedLimit" value={formData.autoApprovedLimit} onChange={handleChange} min="0" />
                </div>
              )}
            </div>

            <div className="tm-grid-row">
              <div className="tm-input-group">
                <label>{t('currency_label')}</label>
                <select name="currency" value={formData.currency} onChange={handleChange}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>
              <div className="tm-input-group">
                <label>{t('team_type_label')}</label>
                <select name="workspaceType" value={formData.workspaceType} onChange={handleChange}>
                  <option value="Corporate">{t('type_corporate')}</option>
                  <option value="Personal">{t('type_personal')}</option>
                </select>
              </div>
            </div>

            <div className="tm-panel-section">
              <label className="section-label">{t('privacy_section')}</label>
              <div className="tm-radio-vertical">
                <label className={`tm-radio-option ${formData.privacy === 'private' ? 'selected' : ''}`}>
                  <input type="radio" name="privacy" value="private" checked={formData.privacy === 'private'} onChange={handleChange} />
                  <i className="ti ti-lock"></i>
                  <div className="option-text">
                    <strong>{t('privacy_private_title')}</strong>
                    <span>{t('privacy_private_desc')}</span>
                  </div>
                </label>
                <label className={`tm-radio-option ${formData.privacy === 'internal' ? 'selected' : ''}`}>
                  <input type="radio" name="privacy" value="internal" checked={formData.privacy === 'internal'} onChange={handleChange} />
                  <i className="ti ti-world"></i>
                  <div className="option-text">
                    <strong>{t('privacy_internal_title')}</strong>
                    <span>{t('privacy_internal_desc')}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </form>
      </ActionSidebar>

      <Alert {...alertConfig} onClose={closeAlert} />
    </>
  );
};

export default CreateTeamPanel;