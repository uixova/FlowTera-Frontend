import React, { useState, useRef, useEffect, useCallback } from 'react'; 
import '../teams.css/Settings.css';

// MERKEZİ VERİ YOLU - Takım verilerini ve kullanıcı verilerini merkezi bir yerden çekiyoruz
import { teamsService } from '../services/teamsService';

const TeamSettings = ({ onBack, currentUser }) => {
  // Plan sınırını state'e çektik ki takımın gerçek adminine göre güncelleyebilelim
  const [planMaxMembers, setPlanMaxMembers] = useState(5);
  const [loading, setLoading] = useState(true); // Veri gelene kadar kontrol için

  //  LocalStorage'dan o anki ID'yi alıyoruz
  const selectedTeamId = localStorage.getItem('tm_selected_id');

  // Form Initial State (Başta boş veya loading durumu için default)
  const [formData, setFormData] = useState({
    teamName: '',
    workspaceType: 'Corporate',
    status: 'active',
    privacy: 'private', // Varsayılan değer
    maxExpenseLimit: 0,
    memberLimit: 1
  });

  // Logo önizleme state'i ve dosya input referansı
  const [preview, setPreview] = useState('https://via.placeholder.com/160?text=LOGO');
  const fileInputRef = useRef(null);

  // Takım verilerini yükleyen fonksiyon (useCallback ile sarmaladık)
  const loadTeamData = useCallback(async () => {
    // Service katmanı asenkron olduğu için async/await kullanıyoruz
    if (!selectedTeamId) {
        console.error("TeamSettings: Seçili ID bulunamadı!");
        return;
    }

    try {
      setLoading(true);
      
      // BÜTÜN İŞİ SERVİSE YIKIYORUZ: Servis bize hem takımı hem admin limitini hazır getirecek
      const data = await teamsService.getTeamSettings(selectedTeamId);

      if (data) {
        console.log("TeamSettings: Veri başarıyla yüklendi:", data);
        
        // Servis katmanında hesapladığımız admin limitini set ediyoruz
        const activeLimit = data.adminPlanLimit || currentUser?.subscription?.maxMembersPerTeam || 5;
        setPlanMaxMembers(activeLimit);

        // Formu mevcut takım verisiyle dolduruyoruz (Eğer settings yoksa default değerler kalır)
        setFormData({
          teamName: data.name || '', 
          workspaceType: data.settings?.workspaceType || 'Corporate',
          status: data.settings?.status || 'active',
          privacy: data.settings?.privacy || 'private', 
          maxExpenseLimit: data.settings?.maxExpenseLimit || 0,
          memberLimit: data.settings?.memberLimit || 1
        });
        
        // Logo önizlemesini de güncelliyoruz (Eğer takımın resmi yoksa placeholder kalır)
        setPreview(data.image || 'https://via.placeholder.com/160?text=LOGO');
      } else {
          console.warn("TeamSettings: Belirtilen ID'ye ait takım bulunamadı:", selectedTeamId);
      }
    } catch (err) {
      console.error("Veri yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId, currentUser]); 

  // Takım verilerini yükleyen efekt (HATA BURADAYDI, ŞİMDİ KURŞUN GEÇİRMEZ)
  useEffect(() => {
    // Hatayı engellemek için işlemi render döngüsünün dışına itiyoruz
    const timer = setTimeout(() => {
        loadTeamData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadTeamData]); // ID değişirse veriyi tazele

  // Form inputlarını yönetmek için genel bir handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sayısal değerleri number tipine çevirerek kaydet
    const finalValue = (name === 'maxExpenseLimit' || name === 'memberLimit') ? Number(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  // Logo önizleme fonksiyonu
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Form submit handler (Şimdilik sadece console.log yapıyor)
  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Submit Data (Update):", { id: selectedTeamId, ...formData });
    alert("Settings updated successfully!");
  };

  // Veri yüklenirken boş ekran yerine bir kontrol (Opsiyonel)
  if (loading) return null;

  return (
    <div className="tm-page-layout">
      <div className="tm-container">
        <div className="tm-page-header">
          <div className="tm-header-left">
            <h1>Team Settings</h1>
            {/* ID BADGE DÜZELTİLDİ: Artık selectedTeamId yazıyor */}
            <span className="current-id-badge">ID: {selectedTeamId || 'Loading...'}</span>
          </div>
          <button className="tm-back-btn" onClick={onBack}>
            Back to Team
          </button>
        </div>

        <form id="editTeamForm" onSubmit={handleUpdate}>
          <div className="tm-setup-grid">
            {/* Sol taraf - Logo */}
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
              {/* Genel Konfigürasyon */}
              <section className="tm-form-section">
                <h3 className="section-title">General Configuration</h3>
                <div className="tm-input-group">
                  <label htmlFor="teamName">Organization Name</label>
                  <input 
                    type="text" 
                    name="teamName" 
                    value={formData.teamName} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>Workspace Type</label>
                    <select name="workspaceType" value={formData.workspaceType} onChange={handleChange}>
                      <option value="Corporate">Corporate</option>
                      <option value="Personal">Personal</option>
                      <option value="Education">Education</option>
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

              {/* Limitler & Kotlar */}
              <section className="tm-form-section limit-section-box">
                <h3 className="section-title">Limits & Quota</h3>
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>Monthly Spending Limit (USD)</label>
                    <input 
                      type="number" 
                      name="maxExpenseLimit" 
                      value={formData.maxExpenseLimit} 
                      onChange={handleChange}
                    />
                    <small className="input-tip">Maximum allowed expenses for this team.</small>
                  </div>

                  <div className="tm-input-group">
                    <label>Member Capacity (Max: {planMaxMembers})</label>
                    <input 
                      type="number" 
                      name="memberLimit" 
                      value={formData.memberLimit} 
                      onChange={handleChange}
                      max={planMaxMembers}
                      min="1"
                    />
                    {formData.memberLimit >= planMaxMembers ? (
                       <small className="input-tip warning">Your plan limit reached!</small>
                    ) : (
                       <small className="input-tip">Max seats available for this workspace.</small>
                    )}
                  </div>
                </div>
              </section>

              {/* Privacy Settings */}
              <section className="tm-form-section">
                <h3 className="section-title">Privacy Settings</h3>
                <div className="tm-radio-vertical">
                  {/* Private Option */}
                  <label className={`tm-radio-option ${formData.privacy === 'private' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="private" 
                      checked={formData.privacy === 'private'} 
                      onChange={handleChange} 
                    />
                    <i className="ti ti-lock option-icon"></i> 
                    <div className="option-text">
                      <strong>Private Organization</strong>
                      <span>Only invited members can access and view team data.</span>
                    </div>
                  </label>

                  {/* Internal Option */}
                  <label className={`tm-radio-option ${formData.privacy === 'internal' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="privacy" 
                      value="internal" 
                      checked={formData.privacy === 'internal'} 
                      onChange={handleChange} 
                    />
                    <i className="ti ti-world option-icon"></i> 
                    <div className="option-text">
                      <strong>Internal (Domain Only)</strong>
                      <span>Anyone within your verified email domain can join.</span>
                    </div>
                  </label>
                </div>
              </section>

              {/* Footer */}
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