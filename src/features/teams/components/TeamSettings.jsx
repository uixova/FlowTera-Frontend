import React, { useState, useRef, useEffect, useCallback } from 'react'; 
import '../teams.css/Settings.css';
import { teamsService } from '../services/teamsService';

const TeamSettings = ({ onBack, currentUser }) => {
  const [planMaxMembers, setPlanMaxMembers] = useState(5);
  const [loading, setLoading] = useState(true);
  const selectedTeamId = localStorage.getItem('tm_selected_id');

  // 1. FormData State Güncellendi
  const [formData, setFormData] = useState({
    teamName: '',
    category: 'Software Development', // Yeni
    workspaceType: 'Corporate',
    status: 'active',
    privacy: 'private',
    maxExpenseLimit: 0,
    memberLimit: 1,
    autoApproved: false, // Yeni
    autoApprovedLimit: 0, // Yeni
    currency: 'USD' // Create panelindeki ile uyum için eklendi
  });

  const [preview, setPreview] = useState('https://via.placeholder.com/160?text=LOGO');
  const fileInputRef = useRef(null);

  const loadTeamData = useCallback(async () => {
    if (!selectedTeamId) return;

    try {
      setLoading(true);
      const data = await teamsService.getTeamSettings(selectedTeamId);

      if (data) {
        const activeLimit = data.adminPlanLimit || currentUser?.subscription?.maxMembersPerTeam || 5;
        setPlanMaxMembers(activeLimit);

        // 2. Servisten gelen veriyi yeni alanlarla eşleştiriyoruz
        setFormData({
          teamName: data.name || '', 
          category: data.category || 'Software Development', // Veride yoksa default
          workspaceType: data.settings?.workspaceType || 'Corporate',
          status: data.settings?.status || 'active',
          privacy: data.settings?.privacy || 'private', 
          maxExpenseLimit: data.settings?.maxExpenseLimit || 0,
          memberLimit: data.settings?.memberLimit || 1,
          autoApproved: data.settings?.autoApproved || false, // Yeni
          autoApprovedLimit: data.settings?.autoApprovedLimit || 0, // Yeni
          currency: data.settings?.currency || 'USD'
        });
        
        setPreview(data.image || 'https://via.placeholder.com/160?text=LOGO');
      }
    } catch (err) {
      console.error("Veri yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId, currentUser]); 

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    
    // Sayısal alanları dönüştür
    if (['maxExpenseLimit', 'memberLimit', 'autoApprovedLimit'].includes(name)) {
      finalValue = Number(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Settings Updated:", { id: selectedTeamId, ...formData });
    alert("Settings updated successfully!");
  };

  if (loading) return null;

  return (
    <div className="tm-page-layout">
      <div className="tm-container">
        <div className="tm-page-header">
          <div className="tm-header-left">
            <h1>Team Settings</h1>
            <span className="current-id-badge">ID: {selectedTeamId}</span>
          </div>
          <button className="tm-back-btn" onClick={onBack}>Back to Team</button>
        </div>

        <form id="editTeamForm" onSubmit={handleUpdate}>
          <div className="tm-setup-grid">
            <aside className="tm-setup-sidebar">
              <div className="tm-sticky-card">
                <div className="tm-preview-wrapper" onClick={() => fileInputRef.current.click()}>
                  <img src={preview} alt="Team Logo" />
                  <div className="tm-upload-overlay"><span style={{fontSize: '24px'}}>+</span></div>
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                  if (e.target.files[0]) setPreview(URL.createObjectURL(e.target.files[0]));
                }} />
                <button type="button" className="tm-upload-btn" onClick={() => fileInputRef.current.click()}>Change Logo</button>
                <span className="tm-preview-label">Organization Branding</span>
              </div>
            </aside>

            <main className="tm-setup-main">
              {/* General Configuration */}
              <section className="tm-form-section">
                <h3 className="section-title">General Configuration</h3>
                <div className="tm-grid-row">
                    <div className="tm-input-group">
                        <label>Organization Name</label>
                        <input type="text" name="teamName" value={formData.teamName} onChange={handleChange} required />
                    </div>
                    {/* YENİ: Kategori Seçimi */}
                    <div className="tm-input-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="Software Development">Software Development</option>
                            <option value="Marketing & Ads">Marketing & Ads</option>
                            <option value="Logistics">Logistics</option>
                            <option value="Finance">Finance</option>
                        </select>
                    </div>
                </div>
                
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>Workspace Type</label>
                    <select name="workspaceType" value={formData.workspaceType} onChange={handleChange}>
                      <option value="Corporate">Corporate</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                  <div className="tm-input-group">
                    <label>System Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Automation & Limits (YENİLENMİŞ BÖLÜM) */}
              <section className="tm-form-section limit-section-box">
                <h3 className="section-title">Automation & Limits</h3>
                
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>Monthly Spending Limit ({formData.currency})</label>
                    <input type="number" name="maxExpenseLimit" value={formData.maxExpenseLimit} onChange={handleChange} />
                  </div>
                  <div className="tm-input-group">
                    <label>Member Capacity (Max: {planMaxMembers})</label>
                    <input type="number" name="memberLimit" value={formData.memberLimit} onChange={handleChange} max={planMaxMembers} min="1" />
                  </div>
                </div>

                {/* YENİ: Auto Approval Checkbox ve Limit */}
                <div className="tm-automation-settings">
                    <div className="tm-checkbox-wrapper">
                        <label className="tm-custom-checkbox">
                            <input type="checkbox" name="autoApproved" checked={formData.autoApproved} onChange={handleChange} />
                            <span className="checkmark"></span>
                            <span className="checkbox-text">Enable Auto-Approval</span>
                        </label>
                    </div>

                    {formData.autoApproved && (
                        <div className="tm-input-group animate-in">
                            <label>Auto-Approve Limit ({formData.currency})</label>
                            <input 
                                type="number" name="autoApprovedLimit" 
                                value={formData.autoApprovedLimit} onChange={handleChange} 
                                placeholder="Threshold for auto approval"
                            />
                        </div>
                    )}
                </div>
              </section>

              {/* Privacy Settings */}
              <section className="tm-form-section">
                <h3 className="section-title">Privacy Settings</h3>
                <div className="tm-radio-vertical">
                  <label className={`tm-radio-option ${formData.privacy === 'private' ? 'selected' : ''}`}>
                    <input type="radio" name="privacy" value="private" checked={formData.privacy === 'private'} onChange={handleChange} />
                    <i className="ti ti-lock option-icon"></i> 
                    <div className="option-text">
                      <strong>Private Organization</strong>
                      <span>Only invited members can access data.</span>
                    </div>
                  </label>

                  <label className={`tm-radio-option ${formData.privacy === 'internal' ? 'selected' : ''}`}>
                    <input type="radio" name="privacy" value="internal" checked={formData.privacy === 'internal'} onChange={handleChange} />
                    <i className="ti ti-world option-icon"></i> 
                    <div className="option-text">
                      <strong>Internal (Domain Only)</strong>
                      <span>Verified email domains can join.</span>
                    </div>
                  </label>
                </div>
              </section>

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