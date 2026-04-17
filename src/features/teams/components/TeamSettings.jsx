import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Loader from '../../../components/common/Loader';
import '../teams.css/Settings.css';
import { teamsService } from '../services/teamsService';
import { useAuth } from '../../../context/AuthContext';
import { useModal } from '../../../hooks/useModal';
import Alert from '../../../components/modals/Alert';
import Confirm from '../../../components/modals/Confirm';

const TeamSettings = ({ team, onBack }) => {
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const { currentUser: authUser, loading: authLoading } = useAuth();
  const [planMaxMembers, setPlanMaxMembers] = useState(5);
  const [loading, setLoading] = useState(true); 
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const selectedTeamId = localStorage.getItem('tm_selected_id');

  const canManageMembers = useMemo(() => {
    if (authLoading || !authUser || String(authUser?.isDeleted) === 'true') return false;
    const roleObj = authUser?.role?.find(r => String(r.teamId) === String(selectedTeamId));
    if (!roleObj) return false;
    // team_settings deny-list'te varsa → erişim kapalı (rol ne olursa olsun)
    if (Array.isArray(roleObj.permissions) && roleObj.permissions.includes('team_settings')) return false;
    return true;
  } , [authLoading, authUser, selectedTeamId]);

  const { 
    alertConfig, showAlert, closeAlert,
    confirmConfig, askConfirm, closeConfirm 
  } = useModal();

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
    currency: 'USD' 
  });

  const [preview, setPreview] = useState(team?.image || 'https://via.placeholder.com/160?text=LOGO');
  const [logoFile, setLogoFile] = useState(null);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef(null);

  const loadTeamData = useCallback(async () => {
    if (!selectedTeamId) return;
    try {
      setLoading(true);
      const [data, members] = await Promise.all([
        teamsService.getTeamSettings(selectedTeamId),
        teamsService.getTeamMembers(selectedTeamId)
      ]);

      if (data) {
        const activeLimit = data.adminPlanLimit || authUser?.subscription?.maxMembersPerTeam || 5;
        setPlanMaxMembers(activeLimit);
        setTeamMembersCount(members?.length || 0);
        setFormData({
          teamName: data.name || '', 
          category: data.category || 'Software Development', 
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

  // authLoading bekleniyor, yetki yoksa loading kapatılıyor
  useEffect(() => {
    if (authLoading) return;
    if (canManageMembers) {
      loadTeamData();
    } else {
      setLoading(false); // Yetki yoksa sonsuz loader engellendi
    }
  }, [loadTeamData, canManageMembers, authLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (['maxExpenseLimit', 'memberLimit', 'autoApprovedLimit'].includes(name)) {
      finalValue = value === '' ? '' : Number(value);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const updatePayload = {
        name: formData.teamName,
        category: formData.category,
        settings: {
          workspaceType: formData.workspaceType,
          status: formData.status,
          privacy: formData.privacy,
          maxExpenseLimit: formData.maxExpenseLimit,
          memberLimit: formData.memberLimit,
          autoApproved: formData.autoApproved,
          autoApprovedLimit: formData.autoApprovedLimit,
          currency: formData.currency
        }
      };
      if (logoFile) updatePayload.imageFile = logoFile;
      const result = await teamsService.updateTeamSettings(selectedTeamId, updatePayload);
      if (result.success) {
        showAlert(
          "Başarılı", 
          formData.status === 'maintenance' ? "Takım Bakım Moduna Alındı!" : "Ayarlar ve Logo Güncellendi.",
          "success"
        );
        setLogoFile(null);
      }
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      showAlert("Hata", "Güncelleme sırasında bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteTeam = async () => {
    try {
      setLoading(true);
      const result = await teamsService.deleteTeam(selectedTeamId);
      if (result.success) {
        closeConfirm();
        showAlert(
          "Silme İşlemi Başlatıldı",
          "Takımınız 14 gün içinde kalıcı olarak silinecektir.",
          "warning"
        );
        setTimeout(() => onBack(), 2000);
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      showAlert("Hata", "Takım silinirken bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (teamMembersCount > 1) {
      showAlert(
        "Organizasyon Dolu",
        `Takımda şu an siz hariç ${teamMembersCount - 1} üye daha bulunuyor. Önce tüm üyeleri çıkarmalısınız.`,
        "warning"
      );
      return;
    }
    if (formData.status !== 'maintenance') {
      askConfirm(
        "Güvenli Silme Gereksinimi",
        "Takımı silmeden önce 'Bakım Modu'na almanız önerilir. Yine de devam etmek istiyor musunuz?",
        () => askConfirm(
          "Son Onay",
          `"${formData.teamName}" organizasyonu kalıcı olarak silinecektir. Emin misiniz?`,
          executeDeleteTeam,
          "danger"
        ),
        "warning"
      );
      return;
    }
    askConfirm(
      "Takımı Silmek İstediğinize Emin Misiniz?",
      `"${formData.teamName}" organizasyonu ve tüm bağlı veriler silinecektir.`,
      executeDeleteTeam,
      "danger"
    );
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLogoError('Sadece JPG, PNG veya WEBP resimleri kabul edilir.');
      setLogoFile(null);
      e.target.value = '';
      return;
    }
    setLogoError('');
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Auth veya data yükleniyorsa loader göster
  if (authLoading || loading) {
    return (
      <div className="full-screen-loader">
        <Loader type="butterfly" />
      </div>
    );
  }

  // Yetki yoksa erişim engeli (loader olmadan, anında göster)
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
              <section className="tm-form-section">
                <h3 className="section-title">Genel Konfigürasyon</h3>
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>Organizasyon Adı</label>
                    <input type="text" name="teamName" value={formData.teamName} onChange={handleChange} required />
                  </div>
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

              <section className="tm-form-section limit-section-box">
                <h3 className="section-title">Otomasyon ve Limitler</h3>
                <div className="tm-grid-row">
                  <div className="tm-input-group">
                    <label>Aylık Harcama Limiti ({formData.currency})</label>
                    <input type="number" name="maxExpenseLimit" value={formData.maxExpenseLimit} onChange={handleChange} />
                  </div>
                  <div className="tm-input-group">
                    <label>Üye Kapasitesi (Max: {planMaxMembers})</label>
                    <input type="number" name="memberLimit" value={formData.memberLimit === 0 ? '' : formData.memberLimit} onChange={handleChange} max={planMaxMembers} min="1" />
                  </div>
                </div>
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
                      <input type="number" name="autoApprovedLimit" value={formData.autoApprovedLimit} onChange={handleChange} placeholder="Otomatik onay limiti" />
                    </div>
                  )}
                </div>
              </section>

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
                      <strong>Takım İçi (Sadece Alan Adı)</strong>
                      <span>Doğrulanmış e-posta alan adları katılabilir.</span>
                    </div>
                  </label>
                </div>
              </section>

              <div className="tm-setup-footer">
                <button type="button" className="tm-btn-delete" onClick={handleDeleteClick}>Takımı Sil</button>
                <div className="tm-footer-right">
                  <button type="button" className="tm-btn-ghost" onClick={onBack}>İptal Et</button>
                  <button type="submit" className="tm-btn-primary">Ayarları Güncelle</button>
                </div>
              </div>
            </main>
          </div>
        </form>
      </div>

      <Alert {...alertConfig} onClose={closeAlert} />
      <Confirm {...confirmConfig} onClose={closeConfirm} />
    </div>
  );
};

export default TeamSettings;