import React, { useState, useRef } from 'react';
import '../teams.css/MemberList.css'

const TeamSettings = ({ onBack }) => {
  const [formData, setFormData] = useState({
    teamName: 'Main Development Team',
    workspaceType: 'Corporate',
    status: 'active'
  });

  // Logo önizleme ve dosya seçimi
  const [preview, setPreview] = useState('https://via.placeholder.com/160?text=LOGO');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    // id'leri state anahtarlarına eşliyoruz
    const keyMap = {
      tmEditTeamName: 'teamName',
      tmWorkspaceType: 'workspaceType',
      tmEditStatus: 'status'
    };
    setFormData(prev => ({ ...prev, [keyMap[id]]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Ayarlar Güncelleniyor:", formData);
    // Burada update servisi çağrılacak
  };

  return (
    <div id="tmSettingsPage" className="tm-page-layout">
      <div className="tm-container">
        <div className="tm-page-header">
          <div className="tm-header-left">
            <h1>Team Settings</h1>
          </div>
          <button className="tm-back-btn" onClick={onBack}>
            <i className="ti ti-arrow-back-up"></i> Back to Team
          </button>
        </div>

        <form id="editTeamForm" onSubmit={handleSubmit}>
          <div className="tm-setup-grid">
            <aside className="tm-setup-sidebar">
              <div className="tm-sticky-card">
                <div className="tm-preview-wrapper">
                  <img id="tmSettingsImagePreview" src={preview} alt="Team Logo" />
                  <div className="tm-upload-overlay" onClick={() => fileInputRef.current.click()}>
                    <i className="ti ti-camera"></i>
                  </div>
                </div>
                <input 
                  type="file" 
                  id="tmSettingsLogoInput" 
                  ref={fileInputRef}
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleLogoChange}
                />
                <button type="button" className="tm-upload-btn" onClick={() => fileInputRef.current.click()}>
                  Change Logo
                </button>
                <span className="tm-preview-label">Organization Branding</span>
              </div>
            </aside>

            <main className="tm-setup-main">
              <section className="tm-form-section">
                <h3 className="section-title">General Configuration</h3>
                <div className="tm-input-group">
                  <label htmlFor="tmEditTeamName">Organization Name</label>
                  <input 
                    type="text" 
                    id="tmEditTeamName" 
                    value={formData.teamName} 
                    onChange={handleChange}
                  />
                </div>
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label htmlFor="tmWorkspaceType">Workspace Type</label>
                    <select id="tmWorkspaceType" value={formData.workspaceType} onChange={handleChange}>
                      <option value="Corporate">Corporate</option>
                      <option value="Personal">Personal</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                  <div className="tm-input-group">
                    <label htmlFor="tmEditStatus">System Status</label>
                    <select id="tmEditStatus" value={formData.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className="tm-setup-footer">
                <button 
                  type="button" 
                  className="tm-btn-delete" 
                  onClick={() => window.confirm('Are you sure you want to delete this team?') && console.log('Silindi')}
                >
                  Delete Team
                </button>
                <div className="tm-footer-right">
                  <button type="button" className="tm-btn-ghost" onClick={onBack}>Cancel</button>
                  <button type="submit" className="tm-btn-primary" id="tmSaveTeamBtn">Update Settings</button>
                </div>
              </div>
            </main>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamSettings;