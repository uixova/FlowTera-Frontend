import React, { useState, useRef, useEffect } from 'react';
import '../teams.css/CreateTeam.css';

const CreateTeamPanel = ({ isOpen, onClose, currentUser }) => {
  // Kullanıcının planına göre maksimum üye sınırı (Default 5)
  const planMaxMembers = currentUser?.subscription?.maxMembersPerTeam || 5;

  // Form Initial State
  const initialFormState = {
    teamName: '',
    currency: 'USD',
    workspaceType: 'Corporate',
    privacy: 'private',
    maxExpenseLimit: 1000,
    memberLimit: Math.min(5, planMaxMembers)
  };

  const [formData, setFormData] = useState(initialFormState);
  const [preview, setPreview] = useState('https://via.placeholder.com/160?text=TEAM');
  const fileInputRef = useRef(null);

  // Panel kapandığında formu sıfırla, açıldığında plan limitini kontrol et
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setPreview('https://via.placeholder.com/160?text=TEAM');
    } else {
        // Modal her açıldığında üye limitini kullanıcının planına göre güncelle
        setFormData(prev => ({
            ...prev,
            memberLimit: Math.min(prev.memberLimit, planMaxMembers)
        }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, planMaxMembers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sayısal değerleri number tipine çevirerek kaydet
    const finalValue = (name === 'maxExpenseLimit' || name === 'memberLimit') ? Number(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // Logo değiştiğinde önizleme güncelleme
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Güvenlik: Kullanıcı inputla limiti manuel delmeye çalışırsa engelle
    if (formData.memberLimit > planMaxMembers) {
        alert(`Your plan allows max ${planMaxMembers} members!`);
        return;
    }

    // gerçek api ile entegrasyon yapılana kadar konsola basıyoruz
    console.log("Team Created with Data:", {
        ...formData,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString(),
        logo: preview
    });
    
    onClose();
  };

  return (
    <>
      <div className={`tm-panel-overlay ${isOpen ? 'is-active' : ''}`} onClick={onClose} />
      <div className={`tm-create-panel ${isOpen ? 'is-open' : ''}`}>
        <div className="tm-panel-header">
          <div className="header-content">
            <h2>Create Workspace</h2>
            <span className={`plan-badge ${currentUser?.subscription?.plan || 'free'}`}>
                {currentUser?.subscription?.plan || 'Free'}
            </span>
          </div>
          <button type="button" className="tm-panel-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tm-panel-form">
          <div className="tm-panel-body">
            {/* Branding Section */}
            <div className="tm-branding-section">
              <div className="tm-preview-wrapper large" onClick={() => fileInputRef.current?.click()}>
                <img src={preview} alt="Team Logo" />
                <div className="tm-upload-overlay">
                  <i className="ti ti-camera"></i>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                hidden 
                onChange={handleLogoChange} 
              />
              <p className="tm-help-text">Click to upload workspace logo</p>
            </div>

            {/* Basic Info */}
            <div className="tm-input-group">
              <label>Organization Name</label>
              <input 
                type="text" 
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                placeholder="Enter organization name"
                required 
              />
            </div>

            {/* Dynamic Limits Section */}
            <div className="tm-panel-section highlight">
              <label className="section-label">Limits & Budget</label>
              <hr />
              <div className="tm-grid-row">
                <div className="tm-input-group">
                  <label>Max Monthly Expense ({formData.currency})</label>
                  <input 
                    type="number" 
                    name="maxExpenseLimit"
                    value={formData.maxExpenseLimit}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="tm-input-group">
                  <label>Member Limit (Max: {planMaxMembers})</label>
                  <input 
                    type="number" 
                    name="memberLimit"
                    value={formData.memberLimit}
                    onChange={handleChange}
                    max={planMaxMembers}
                    min="1"
                  />
                  {formData.memberLimit >= planMaxMembers && (
                    <span className="limit-warning">Plan max limit reached!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Currency & Workspace Type */}
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

            {/* Privacy Options */}
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

          <div className="tm-panel-footer">
            <button type="button" className="tm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="tm-btn-submit">Create Workspace</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateTeamPanel;