import React, { useState, useRef } from 'react';
import '../teams.css/CreateTeam.css'

const CreateTeam = ({ onBack }) => {
  const [formData, setFormData] = useState({
    teamName: '',
    currency: 'USD',
    workspaceType: 'Corporate',
    privacy: 'private'
  });

  const [preview, setPreview] = useState('https://via.placeholder.com/160?text=TEAM');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    const fieldName = name || id.replace('tm', '').charAt(0).toLowerCase() + id.replace('tm', '').slice(1);
    
    setFormData(prev => ({
      ...prev,
      [fieldName === 'newTeamName' ? 'teamName' : fieldName]: value
    }));
  };

  // Logo yükleme ve önizleme
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Yeni Takım Verileri:", formData);
    // Burada servise (teamsService.js) istek atılacak
  };

  return (
    <div id="tmCreateTeamPage" className="tm-page-layout">
      <div className="tm-container">
        <div className="tm-page-header">
          <div className="tm-header-left">
            <h1>Create Organization</h1>
          </div>
          <button className="tm-back-btn" onClick={onBack}>
            <i className="ti ti-arrow-back-up"></i> Back
          </button>
        </div>

        <form id="newTeamForm" onSubmit={handleSubmit}>
          <div className="tm-setup-grid">
            {/* Sidebar: Logo Upload */}
            <aside className="tm-setup-sidebar">
              <div className="tm-sticky-card">
                <div className="tm-image-upload-container">
                  <div className="tm-preview-wrapper">
                    <img id="tmImagePreview" src={preview} alt="Team Logo" />
                    <div className="tm-upload-overlay" onClick={() => fileInputRef.current.click()}>
                      <i className="ti ti-camera"></i>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleLogoChange}
                  />
                  <button type="button" className="tm-upload-btn" onClick={() => fileInputRef.current.click()}>
                    Upload Logo
                  </button>
                  <span className="tm-preview-label">Team Branding</span>
                </div>
              </div>
            </aside>

            {/* Main: Form Details */}
            <main className="tm-setup-main">
              <section className="tm-form-section">
                <h3 className="section-title">General Details</h3>
                <div className="tm-input-group">
                  <label htmlFor="tmNewTeamName">Organization Name</label>
                  <input 
                    type="text" 
                    id="tmNewTeamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    placeholder="e.g. Global Tech Solutions" 
                    required 
                  />
                </div>

                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label htmlFor="tmMainCurrency">Default Currency</label>
                    <select id="tmMainCurrency" value={formData.currency} onChange={handleChange}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="TRY">TRY (₺)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="tm-input-group">
                    <label htmlFor="tmWorkspaceType">Workspace Type</label>
                    <select id="tmWorkspaceType" value={formData.workspaceType} onChange={handleChange}>
                      <option value="Corporate">Corporate</option>
                      <option value="Personal">Personal</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="tm-form-section">
                <h3 className="section-title">Privacy</h3>
                <div className="tm-radio-group">
                  <label className="tm-radio-card">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="private" 
                      checked={formData.privacy === 'private'}
                      onChange={handleChange}
                    />
                    <div className="radio-content">
                      <i className="ti ti-lock"></i>
                      <div><strong>Private: </strong><span>Invite only</span></div>
                    </div>
                  </label>
                  <label className="tm-radio-card">
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="internal"
                      checked={formData.privacy === 'internal'}
                      onChange={handleChange}
                    />
                    <div className="radio-content">
                      <i className="ti ti-world"></i>
                      <div><strong>Internal: </strong><span>Domain access</span></div>
                    </div>
                  </label>
                </div>
              </section>

              <div className="tm-setup-footer">
                <button type="button" className="tm-btn-ghost" onClick={onBack}>Discard</button>
                <button type="submit" className="tm-btn-primary" id="tmSaveTeamBtn">Create Workspace</button>
              </div>
            </main>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;