import React, { useState, useRef, useEffect } from 'react';
import '../teams.css/CreateTeam.css';

const CreateTeamPanel = ({ isOpen, onClose }) => {
  // 1. State'i en sade haliyle başlatıyoruz
  const [formData, setFormData] = useState({
    teamName: '',
    currency: 'USD',
    workspaceType: 'Corporate',
    privacy: 'private'
  });

  const [preview, setPreview] = useState('https://via.placeholder.com/160?text=TEAM');
  const fileInputRef = useRef(null);

  // Panel kapandığında formu sıfırla
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        teamName: '',
        currency: 'USD',
        workspaceType: 'Corporate',
        privacy: 'private'
      });
      setPreview('https://via.placeholder.com/160?text=TEAM');
    }
    /// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit Data:", formData);
    onClose();
  };

  // Eğer açık değilse hiçbir şey render etme (Alternatif yöntem)
  // if (!isOpen && !preview.includes('blob')) return null;

  return (
    <>
      <div className={`tm-panel-overlay ${isOpen ? 'is-active' : ''}`} onClick={onClose} />
      <div className={`tm-create-panel ${isOpen ? 'is-open' : ''}`}>
        <div className="tm-panel-header">
          <h2>Create Workspace</h2>
          <button type="button" className="tm-panel-close" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tm-panel-form">
          <div className="tm-panel-body">
            <div className="tm-branding-section">
              <div className="tm-preview-wrapper large" onClick={() => fileInputRef.current?.click()}>
                <img src={preview} alt="Team Logo" />
                <div className="tm-upload-overlay" onClick={() => fileInputRef.current?.click()}>
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
            </div>

            <div className="tm-input-group">
              <label>Organization Name</label>
              <input 
                type="text" 
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                placeholder="Organization Name"
                required 
              />
            </div>

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
                <label>Type</label>
                <select name="workspaceType" value={formData.workspaceType} onChange={handleChange}>
                  <option value="Corporate">Corporate</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>

            <div className="tm-panel-section">
              <label className="section-label">Privacy Settings</label>
              <div className="tm-radio-vertical">
                <label className={`tm-radio-option ${formData.privacy === 'private' ? 'selected' : ''}`}>
                  <input type="radio" name="privacy" value="private" checked={formData.privacy === 'private'} onChange={handleChange} />
                  <i className="ti ti-lock"></i>
                  <div className="option-text">
                    <strong>Private</strong>
                    <span>Invited members only</span>
                  </div>
                </label>
                <label className={`tm-radio-option ${formData.privacy === 'internal' ? 'selected' : ''}`}>
                  <input type="radio" name="privacy" value="internal" checked={formData.privacy === 'internal'} onChange={handleChange} />
                  <i className="ti ti-world"></i>
                  <div className="option-text">
                    <strong>Internal</strong>
                    <span>Your domain only</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="tm-panel-footer">
            <button type="button" className="tm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="tm-btn-submit">Create Team</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateTeamPanel;