import React, { useState, useRef, useEffect, useCallback } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
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

const CreateTeamPanel = ({ isOpen, onClose, currentUser, onSuccess }) => {
  const { alertConfig, showAlert, closeAlert } = useModal();
  const planMaxMembers = currentUser?.subscription?.maxMembersPerTeam || 5;

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

  // Panel açılıp kapandığında formu yöneten efekt
  useEffect(() => {
    if (!isOpen) {
      // Panel kapandığında state'i sıfırla
      resetForm();
    } else {
      // Panel açıldığında limitleri kontrol et
      setFormData(prev => ({
        ...prev,
        memberLimit: Math.min(prev.memberLimit, planMaxMembers)
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, planMaxMembers]); // dışarıdaki bağımlılıklara göre çalışıyor

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if (['maxExpenseLimit', 'memberLimit', 'autoApprovedLimit'].includes(name)) {
      finalValue = Number(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // Logo önizlemesi için dosya inputu handler'ı
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Form submit handler'ı
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Plan Limit Kontrolü (Bizim Modal ile)
    if (formData.memberLimit > planMaxMembers) {
      showAlert(
        "Plan Limiti Aşıldı", 
        `Mevcut planınız en fazla ${planMaxMembers} üyeye izin veriyor. Lütfen limitinizi düşürün veya planınızı yükseltin.`, 
        "warning"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // API Simülasyonu
      console.log("Team Creating...", { ...formData, logo: preview });
      
      // await teamService.createTeam(formData); 

      // 2. Başarılı İşlem Bildirimi
      if (onSuccess) onSuccess();
      onClose(); 
      
    } catch (err) {
      console.error("Hata:", err);
      showAlert("Hata", "Takım oluşturulurken teknik bir sorun oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sidebar başlığı ve altbilgisi için özel içerikler
  const sidebarTitle = (
    <div className="header-content">
      <h2>Takım Oluştur</h2>
      <span className={`plan-badge ${currentUser?.subscription?.plan || 'free'}`}>
        {currentUser?.subscription?.plan || 'Free'}
      </span>
    </div>
  );

  // Footer kısmında iptal ve oluştur butonları
  const sidebarFooter = (
    <div className="tm-panel-footer-alt" style={{width: '100%', padding: 0, borderTop: 'none'}}> 
      <button type="button" className="tm-btn-cancel" onClick={onClose} style={{flex: 1}}>İptal Et</button>
      <button type="submit" form="create-team-form" className="tm-btn-submit" style={{flex: 2}} >{isSubmitting ? 'Oluşturuluyor...' : 'Takımı Oluştur'}</button>
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
        <div className="tm-panel-body-no-scroll"> {/* Kaydırmayı ActionSidebar body'si halledecek */}
          
          {/* Branding Section */}
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

          {/* Basic Info */}
          <div className="tm-input-group">
            <label>Organizasyon Adı</label>
            <input 
              type="text" name="teamName" value={formData.teamName} 
              onChange={handleChange} placeholder="Organizasyon adını girin" required 
            />
          </div>

          <div className="tm-input-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Software Development">Yazılım Geliştirme</option>
              <option value="Marketing & Ads">Pazarlama & Ads</option>
              <option value="Logistics">Lojistik</option>
              <option value="Finance">Finans</option>
            </select>
          </div>

          {/* Limits Section */}
          <div className="tm-panel-section highlight">
            <label className="section-label">Limitler ve Bütçe</label>
            <div className="tm-grid-row">
              <div className="tm-input-group">
                <label>Max Aylık Gider ({formData.currency})</label>
                <input type="number" name="maxExpenseLimit" value={formData.maxExpenseLimit} onChange={handleChange} min="0" />
              </div>
              <div className="tm-input-group">
                <label>Takım Üye Limiti (Max: {planMaxMembers})</label>
                <input type="number" name="memberLimit" value={formData.memberLimit} onChange={handleChange} max={planMaxMembers} min="1" />
                {formData.memberLimit >= planMaxMembers && <span className="limit-warning">Planın maximum limitine ulaşıldı!</span>}
              </div>
            </div>
          </div>

          {/* Auto Approval Section */}
          <div className="tm-panel-section automation-box">
            <div className="tm-checkbox-group">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" id="autoApproved" name="autoApproved" 
                  checked={formData.autoApproved} onChange={handleChange} 
                />
                <label htmlFor="autoApproved">Otomatik Onayı Etkinleştir</label>
              </div>
            </div>

            {formData.autoApproved && (
              <div className="tm-input-group animate-in">
                <label>Otomatik Onay Limiti ({formData.currency})</label>
                <input 
                  type="number" name="autoApprovedLimit" 
                  value={formData.autoApprovedLimit} onChange={handleChange} min="0"
                />
              </div>
            )}
          </div>

          {/* Currency & Type */}
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

          {/* Privacy */}
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