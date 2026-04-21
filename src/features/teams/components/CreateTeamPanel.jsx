import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { useSubscription } from '../../../context/SubscriptionContext';
import { useAuth } from '../../../context/AuthContext';
import '../teams.css/CreateTeam.css';
import { useModal } from '../../../hooks/useModal';
import Alert from '../../../components/modals/Alert';

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
  const { currentUser } = useAuth();
  const { currentPlan } = useSubscription();
  const { alertConfig, showAlert, closeAlert } = useModal();

  // JSON'daki "5 üye" veya "20 üye" stringini sayıya çeviriyoruz
  const planMaxMembers = useMemo(() => {
    const limitStr = currentPlan?.Promise?.TeamMemberLimit || "5";
    return parseInt(limitStr.replace(/[^0-9]/g, '')) || 5;
  }, [currentPlan]);

  const hasAutomation = useMemo(() => {
    return currentPlan?.feature_keys?.includes('automation');
  }, [currentPlan]);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [preview, setPreview] = useState(PLACEHOLDER_IMAGE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
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
        "Plan Limiti Aşıldı", 
        `Mevcut planınız en fazla ${planMaxMembers} üyeye izin veriyor.`, 
        "warning"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Api simülasyonu
      const payload = { 
      ...formData, 
      logo: preview,
      createdBy: currentUser?.uid, 
      planId: currentPlan?.id 
    };
    
    console.log("Team Creating...", payload);
      if (onSuccess) onSuccess();
      onClose(); 
    } catch{
      showAlert("Hata", "Takım oluşturulurken teknik bir sorun oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sidebarTitle = (
    <div className="header-content">
      <h2>Takım Oluştur</h2>
      {currentPlan?.name && (
        <span className={`plan-badge ${currentPlan.badge}`}>
          {currentPlan.name.toUpperCase()}
        </span>
      )}
    </div>
  );

  const sidebarFooter = (
    <div className="tm-panel-footer-alt"> 
      <button type="button" className="tm-btn-cancel" onClick={onClose} style={{flex: 1}}>İptal Et</button>
      <button type="submit" form="create-team-form" className="tm-btn-submit" style={{flex: 2}} >
        {isSubmitting ? 'Oluşturuluyor...' : 'Takımı Oluştur'}
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
              <p className="tm-help-text">Takım logosu yüklemek için tıklayın</p>
            </div>

            <div className="tm-input-group">
              <label>Organizasyon Adı</label>
              <input 
                type="text" name="teamName" value={formData.teamName} 
                onChange={handleChange} placeholder="Organizasyon adını girin" required 
              />
            </div>

            <div className="tm-input-group">
              <label>Kategori</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Software Development">Yazılım Geliştirme</option>
                <option value="Marketing & Ads">Pazarlama & Ads</option>
                <option value="Logistics">Lojistik</option>
                <option value="Finance">Finans</option>
              </select>
            </div>

            <div className="tm-panel-section highlight">
              <label className="section-label">Limitler ve Bütçe</label>
              <div className="tm-grid-row">
                <div className="tm-input-group">
                  <label>Max Aylık Gider ({formData.currency})</label>
                  <input type="number" name="maxExpenseLimit" value={formData.maxExpenseLimit} onChange={handleChange} min="0" />
                </div>
                <div className="tm-input-group">
                  <label>Takım Üye Limiti (Max: {planMaxMembers})</label>
                  <input 
                    type="number" 
                    name="memberLimit" 
                    value={formData.memberLimit === 0 ? '' : formData.memberLimit} 
                    onChange={handleChange} 
                    max={planMaxMembers} 
                    min="1" 
                  />
                  {formData.memberLimit >= planMaxMembers && <span className="limit-warning">Planın maximum limitine ulaşıldı!</span>}
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
                    Otomatik Onayı Etkinleştir
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
                   Bu özellik <strong>{currentPlan?.name}</strong> planınızda bulunmuyor.
                 </p>
              )}

              {formData.autoApproved && hasAutomation && (
                <div className="tm-input-group animate-in">
                  <label>Otomatik Onay Limiti ({formData.currency})</label>
                  <input type="number" name="autoApprovedLimit" value={formData.autoApprovedLimit} onChange={handleChange} min="0" />
                </div>
              )}
            </div>

            <div className="tm-grid-row">
              <div className="tm-input-group">
                <label>Para birimi</label>
                <select name="currency" value={formData.currency} onChange={handleChange}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="TRY">TRY (₺)</option>
                </select>
              </div>
              <div className="tm-input-group">
                <label>Takım Türü</label>
                <select name="workspaceType" value={formData.workspaceType} onChange={handleChange}>
                  <option value="Corporate">Kurumsal</option>
                  <option value="Personal">Bireysel</option>
                </select>
              </div>
            </div>

            <div className="tm-panel-section">
              <label className="section-label">Gizlilik Ayarları</label>
              <div className="tm-radio-vertical">
                <label className={`tm-radio-option ${formData.privacy === 'private' ? 'selected' : ''}`}>
                  <input type="radio" name="privacy" value="private" checked={formData.privacy === 'private'} onChange={handleChange} />
                  <i className="ti ti-lock"></i>
                  <div className="option-text">
                    <strong>Özel</strong>
                    <span>Sadece davetli üyeler erişebilir</span>
                  </div>
                </label>
                <label className={`tm-radio-option ${formData.privacy === 'internal' ? 'selected' : ''}`}>
                  <input type="radio" name="privacy" value="internal" checked={formData.privacy === 'internal'} onChange={handleChange} />
                  <i className="ti ti-world"></i>
                  <div className="option-text">
                    <strong>Bağlantıya Açık</strong>
                    <span>Herkes bağlantı ile katılabilir</span>
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