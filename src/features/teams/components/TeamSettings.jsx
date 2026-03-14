import React, { useState, useRef } from 'react'; 
import '../teams.css/Settings.css';

const TeamSettings = ({ teamId, onBack }) => {
  // Debugging: Team ID'sini konsola yazdır
  console.log("Current Team ID:", teamId);

  // Form verileri için state
  const [formData, setFormData] = useState({
    teamName: 'Main Development Team',
    workspaceType: 'Corporate',
    status: 'active',
    privacy: 'private'
  });
  
  // Logo önizlemesi için state ve ref
  const [preview, setPreview] = useState('https://via.placeholder.com/160?text=LOGO');
  const fileInputRef = useRef(null);

  // Form input değişikliklerini yönetmek için genel bir handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Logo dosyası seçildiğinde önizleme güncelleme
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="tm-page-layout">
      <div className="tm-container">
        <div className="tm-page-header">
          <div className="tm-header-left">
            <h1>Team Settings</h1>
          </div>
          <button className="tm-back-btn" onClick={onBack}>
            Back to Team
          </button>
        </div>

        <form id="editTeamForm" onSubmit={(e) => e.preventDefault()}>
          <div className="tm-setup-grid">
            {/* Sol taraf - Logo ve temel bilgiler */}
            <aside className="tm-setup-sidebar">
              <div className="tm-sticky-card">
                <div className="tm-preview-wrapper">
                  <img src={preview} alt="Team Logo" />
                  <div className="tm-upload-overlay" onClick={() => fileInputRef.current.click()}>
                    <span style={{fontSize: '24px'}}>+</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
                <button type="button" className="tm-upload-btn" onClick={() => fileInputRef.current.click()}>
                  Change Logo
                </button>
                <span className="tm-preview-label">Organization Branding</span>
              </div>
            </aside>

            {/* Sağ taraf - Ayar formları */}
            <main className="tm-setup-main">
              <section className="tm-form-section">
                <h3 className="section-title">General Configuration</h3>
                <div className="tm-input-group">
                  <label htmlFor="teamName">Organization Name</label>
                  <input 
                    type="text" 
                    name="teamName"
                    value={formData.teamName} 
                    onChange={handleChange}
                  />
                </div>
                {/* İki kolonlu grid yapısı */}
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label htmlFor="workspaceType">Workspace Type</label>
                    <div className="tm-select-wrapper">
                      <select name="workspaceType" value={formData.workspaceType} onChange={handleChange}>
                        <option value="Corporate">Corporate</option>
                        <option value="Personal">Personal</option>
                        <option value="Education">Education</option>
                      </select>
                    </div>
                  </div>
                  <div className="tm-input-group">
                    <label htmlFor="status">System Status</label>
                    <div className="tm-select-wrapper">
                      <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* İkinci bölüm - Gizlilik Ayarları */}
              <section className="tm-form-section">
                <h3 className="section-title">Privacy Settings</h3>
                <div className="tm-radio-vertical">
                  <label className={`tm-radio-option ${formData.privacy === 'private' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="private" 
                      checked={formData.privacy === 'private'} 
                      onChange={handleChange} 
                    />
                    <div className="option-text">
                      <strong>Private Organization</strong>
                      <span>Only invited members can access and view team data.</span>
                    </div>
                  </label>

                  <label className={`tm-radio-option ${formData.privacy === 'internal' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="internal" 
                      checked={formData.privacy === 'internal'} 
                      onChange={handleChange} 
                    />
                    <div className="option-text">
                      <strong>Internal (Domain Only)</strong>
                      <span>Anyone within your verified email domain can join.</span>
                    </div>
                  </label>
                </div>
              </section>

              {/* Alt kısım - Eylem butonları */}
              <div className="tm-setup-footer">
                <button type="button" className="tm-btn-delete">Delete Team</button>
                <div className="tm-footer-right">
                  <button type="button" className="tm-btn-ghost" onClick={onBack}>Cancel</button>
                  <button type="submit" className="tm-btn-primary">Update Settings</button>
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