import React, { useState, useRef, useEffect, useCallback } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import '../teams.css/CreateTeam.css';

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

const CreateTeamPanel = ({ isOpen, onClose, currentUser }) => {
  const planMaxMembers = currentUser?.subscription?.maxMembersPerTeam || 5;

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [preview, setPreview] = useState(PLACEHOLDER_IMAGE);
  const fileInputRef = useRef(null);

  const resetForm = useCallback(() => {
    setFormData({
      ...INITIAL_FORM_STATE,
      memberLimit: Math.min(INITIAL_FORM_STATE.memberLimit, planMaxMembers)
    });
    setPreview(PLACEHOLDER_IMAGE);
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
  }, [isOpen, planMaxMembers]); // resetForm'u eklemeye gerek yok, dışarıdaki bağımlılıklara göre çalışıyor

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;

    if (type === 'checkbox') {
      finalValue = checked;
    } else if (name === 'maxExpenseLimit' || name === 'memberLimit' || name === 'autoApprovedLimit') {
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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.memberLimit > planMaxMembers) {
      alert(`Your plan allows max ${planMaxMembers} members!`);
      return;
    }

    console.log("Team Created:", {
      ...formData,
      createdBy: currentUser?.id,
      createdAt: new Date().toISOString(),
      logo: preview
    });
    onClose();
  };

  // Sidebar başlığı ve altbilgisi için özel içerikler
  const sidebarTitle = (
    <div className="header-content">
      <h2>Create Workspace</h2>
      <span className={`plan-badge ${currentUser?.subscription?.plan || 'free'}`}>
        {currentUser?.subscription?.plan || 'Free'}
      </span>
    </div>
  );

  // Footer kısmında iptal ve oluştur butonları
  const sidebarFooter = (
    <div className="tm-panel-footer-alt"> 
      <button type="button" className="tm-btn-cancel" onClick={onClose}>Cancel</button>
      <button type="submit" form="create-team-form" className="tm-btn-submit">Create Workspace</button>
    </div>
  );

  return (
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
            <p className="tm-help-text">Click to upload workspace logo</p>
          </div>

          {/* Basic Info */}
          <div className="tm-input-group">
            <label>Organization Name</label>
            <input 
              type="text" name="teamName" value={formData.teamName} 
              onChange={handleChange} placeholder="Enter organization name" required 
            />
          </div>

          <div className="tm-input-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Software Development">Software Development</option>
              <option value="Marketing & Ads">Marketing & Ads</option>
              <option value="Logistics">Logistics</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          {/* Limits Section */}
          <div className="tm-panel-section highlight">
            <label className="section-label">Limits & Budget</label>
            <div className="tm-grid-row">
              <div className="tm-input-group">
                <label>Max Monthly Expense ({formData.currency})</label>
                <input type="number" name="maxExpenseLimit" value={formData.maxExpenseLimit} onChange={handleChange} min="0" />
              </div>
              <div className="tm-input-group">
                <label>Member Limit (Max: {planMaxMembers})</label>
                <input type="number" name="memberLimit" value={formData.memberLimit} onChange={handleChange} max={planMaxMembers} min="1" />
                {formData.memberLimit >= planMaxMembers && <span className="limit-warning">Plan max limit reached!</span>}
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
                <label htmlFor="autoApproved">Enable Auto Approval</label>
              </div>
            </div>

            {formData.autoApproved && (
              <div className="tm-input-group animate-in">
                <label>Auto Approval Limit ({formData.currency})</label>
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
              <label>Currency</label>
              <select name="currency" value={formData.currency} onChange={handleChange}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="TRY">TRY (₺)</option>
              </select>
            </div>
            <div className="tm-input-group">
              <label>Workspace Type</label>
              <select name="workspaceType" value={formData.workspaceType} onChange={handleChange}>
                <option value="Corporate">Corporate</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
          </div>

          {/* Privacy */}
          <div className="tm-panel-section">
            <label className="section-label">Privacy Settings</label>
            <div className="tm-radio-vertical">
              <label className={`tm-radio-option ${formData.privacy === 'private' ? 'selected' : ''}`}>
                <input type="radio" name="privacy" value="private" checked={formData.privacy === 'private'} onChange={handleChange} />
                <i className="ti ti-lock"></i>
                <div className="option-text">
                  <strong>Private</strong>
                  <span>Only invited members can access</span>
                </div>
              </label>
              <label className={`tm-radio-option ${formData.privacy === 'internal' ? 'selected' : ''}`}>
                <input type="radio" name="privacy" value="internal" checked={formData.privacy === 'internal'} onChange={handleChange} />
                <i className="ti ti-world"></i>
                <div className="option-text">
                  <strong>Internal</strong>
                  <span>Open to anyone in your organization</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </form>
    </ActionSidebar>
  );
};

export default CreateTeamPanel;