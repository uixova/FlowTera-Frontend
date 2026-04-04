import React, { useState, useRef, useEffect, useCallback } from 'react'; 
import Loader from '../../../components/common/Loader';
import '../teams.css/Settings.css';
import { teamsService } from '../services/teamsService';
import { useAuth } from '../../../hooks/useAuth';

const TeamSettings = ({ team, onBack }) => {
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const { roleNameForTeam, currentUser: authUser, loading: authLoading } = useAuth();
  const [planMaxMembers, setPlanMaxMembers] = useState(5);
  const [loading, setLoading] = useState(true);
  const selectedTeamId = localStorage.getItem('tm_selected_id');
  const canManageMembers = !authLoading && !!authUser && String(authUser?.isDeleted) !== 'true' && roleNameForTeam(selectedTeamId) === 'Admin';

  // FormData State Güncellendi
  const [formData, setFormData] = useState({
    teamName: team?.name || '',
    category: 'Software Development',
    workspaceType: 'Corporate',
    status: 'active',
    privacy: 'private',
    maxExpenseLimit: 0,
    memberLimit: 1,
    autoApproved: false, 
    autoApprovedLimit: 0, 
    currency: 'USD' // Create panelindeki ile uyum için eklendi
  });

  const [preview, setPreview] = useState(team?.image || 'https://via.placeholder.com/160?text=LOGO');
  const [logoFile, setLogoFile] = useState(null);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef(null);

  const loadTeamData = useCallback(async () => {
    if (!selectedTeamId) return;

    try {
      setLoading(true);
      const data = await teamsService.getTeamSettings(selectedTeamId);

      if (data) {
        const activeLimit = data.adminPlanLimit || authUser?.subscription?.maxMembersPerTeam || 5;
        setPlanMaxMembers(activeLimit);

        // Servisten gelen veriyi yeni alanlarla eşleştiriyoruz
        setFormData({
          teamName: data.name || '', 
          category: data.category || 'Software Development', // Veride yoksa default
          workspaceType: data.settings?.workspaceType || 'Corporate',
          status: data.settings?.status || 'active',
          privacy: data.settings?.privacy || 'private', 
          maxExpenseLimit: data.settings?.maxExpenseLimit || 0,
          memberLimit: data.settings?.memberLimit || 1,
          autoApproved: data.settings?.autoApproved || false, 
          autoApprovedLimit: data.settings?.autoApprovedLimit || 0,
          currency: data.settings?.currency || 'USD'
        });
        
        setPreview(data.image || 'https://via.placeholder.com/160?text=LOGO');
      }
    } catch (err) {
      console.error("Data Download Error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId, authUser]); 

  useEffect(() => {
    if (canManageMembers) loadTeamData();
  }, [loadTeamData, canManageMembers]);

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
    console.log("Settings Updated:", { id: selectedTeamId, ...formData, logoFile });
    alert("Settings updated successfully!");
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLogoError('Only JPG, PNG or WEBP images are allowed.');
      setLogoFile(null);
      e.target.value = '';
      return;
    }

    setLogoError('');
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  if (authLoading || loading) {
    return (
      <div className="full-screen-loader">
        <Loader type="butterfly" />
      </div>
    );
  }

  if (!canManageMembers) {
    return (
      <div className="tm-page-layout">
        <div className="tm-container">
          <div className="tm-page-header">
            <div className="tm-header-left">
              <h1>Takım Ayarları</h1>
              <span className="current-id-badge">ID: {selectedTeamId}</span>
            </div>
            <button className="tm-back-btn" onClick={onBack}>Takıma Dön</button>
          </div>
          <div style={{ padding: '20px 0', color: '#ff4757', fontWeight: 700 }}>
            Bu takımın ayarlarını düzenleme izniniz yok.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tm-page-layout">
      <div className="tm-container">
        <div className="tm-page-header">
          <div className="tm-header-left">
            <h1>Takım Ayarları</h1>
            <span className="current-id-badge">ID: {selectedTeamId}</span>
          </div>
          <button className="tm-back-btn" onClick={onBack}>Takıma Dön</button>
        </div>

        <form id="editTeamForm" onSubmit={handleUpdate}>
          <div className="tm-setup-grid">
            <aside className="tm-setup-sidebar">
              <div className="tm-sticky-card">
                <div className="tm-preview-wrapper" onClick={() => fileInputRef.current.click()}>
                  <img src={preview} alt="Team Logo" />
                  <div className="tm-upload-overlay"><span style={{fontSize: '24px'}}>+</span></div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={handleLogoSelect}
                />
                <button type="button" className="tm-upload-btn" onClick={() => fileInputRef.current.click()}>Logoyu Güncelle</button>
                {logoError && <span className="tm-upload-error">{logoError}</span>}
                <span className="tm-preview-label">Organizasyon Simgesi</span>
              </div>
            </aside>

            <main className="tm-setup-main">
              {/* General Configuration */}
              <section className="tm-form-section">
                <h3 className="section-title">Genel Konfigürasyon</h3>
                <div className="tm-grid-row">
                    <div className="tm-input-group">
                        <label>Organizasyon Adı</label>
                        <input type="text" name="teamName" value={formData.teamName} onChange={handleChange} required />
                    </div>
                    {/* YENİ: Kategori Seçimi */}
                    <div className="tm-input-group">
                        <label>Kategori</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="Software Development">Yazılım Geliştirme</option>
                            <option value="Marketing & Ads">Pazarlama & Ads</option>
                            <option value="Logistics">Lojistik</option>
                            <option value="Finance">Finans</option>
                        </select>
                    </div>
                </div>
                
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>Takım Türü</label>
                    <select name="workspaceType" value={formData.workspaceType} onChange={handleChange}>
                      <option value="Corporate">Kurumsal</option>
                      <option value="Personal">Bireysel</option>
                    </select>
                  </div>
                  <div className="tm-input-group">
                    <label>Sistem Durumu</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">Aktif</option>
                      <option value="maintenance">Bakım</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Automation & Limits (YENİLENMİŞ BÖLÜM) */}
              <section className="tm-form-section limit-section-box">
                <h3 className="section-title">Otomasyon ve Limitler</h3>
                
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>Aylık Harcama Limiti ({formData.currency})</label>
                    <input type="number" name="maxExpenseLimit" value={formData.maxExpenseLimit} onChange={handleChange} />
                  </div>
                  <div className="tm-input-group">
                    <label>Üye Kapasitesi (Max: {planMaxMembers})</label>
                    <input type="number" name="memberLimit" value={formData.memberLimit} onChange={handleChange} max={planMaxMembers} min="1" />
                  </div>
                </div>

                {/* Auto Approval Checkbox ve Limit */}
                <div className="tm-automation-settings">
                    <div className="tm-checkbox-wrapper">
                        <label className="tm-custom-checkbox">
                            <input type="checkbox" name="autoApproved" checked={formData.autoApproved} onChange={handleChange} />
                            <span className="checkmark"></span>
                            <span className="checkbox-text">Otomatik Onayı Etkinleştir</span>
                        </label>
                    </div>

                    {formData.autoApproved && (
                        <div className="tm-input-group animate-in">
                            <label>Otomatik Onay Limiti ({formData.currency})</label>
                            <input 
                                type="number" name="autoApprovedLimit" 
                                value={formData.autoApprovedLimit} onChange={handleChange} 
                                placeholder="Otomatik onay limiti"
                            />
                        </div>
                    )}
                </div>
              </section>

              {/* Privacy Settings */}
              <section className="tm-form-section">
                <h3 className="section-title">Gizlilik Ayarları</h3>
                <div className="tm-radio-vertical">
                  <label className={`tm-radio-option ${formData.privacy === 'private' ? 'selected' : ''}`}>
                    <input type="radio" name="privacy" value="private" checked={formData.privacy === 'private'} onChange={handleChange} />
                    <i className="ti ti-lock option-icon"></i> 
                    <div className="option-text">
                      <strong>Özel Organizasyon</strong>
                      <span>Sadece davetli üyeler verilere erişebilir.</span>
                    </div>
                  </label>

                  <label className={`tm-radio-option ${formData.privacy === 'internal' ? 'selected' : ''}`}>
                    <input type="radio" name="privacy" value="internal" checked={formData.privacy === 'internal'} onChange={handleChange} />
                    <i className="ti ti-world option-icon"></i> 
                    <div className="option-text">
                      <strong>İç (Sadece Alan Alanı)</strong>
                      <span>Doğrulanmış e-posta alan adları katılabilir.</span>
                    </div>
                  </label>
                </div>
              </section>

              <div className="tm-setup-footer">
                <button type="button" className="tm-btn-delete">Takımı Sil</button>
                <div className="tm-footer-right">
                  <button type="button" className="tm-btn-ghost" onClick={onBack}>İptal Et</button>
                  <button type="submit" className="tm-btn-primary">Ayarları Güncelle</button>
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