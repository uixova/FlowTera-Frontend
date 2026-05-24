import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Security.css';
import { useModal } from '../../../hooks/useModal';
import Confirm from '../../../components/overlays/Confirm';
import Alert from '../../../components/overlays/Alert';
import { useAuth } from '../../../context/AuthContext';
import { teamsService } from '../../teams/services/teamsService';
import { settingsService } from '../services/settingService';

const Security = () => {
    const [twoFA,     setTwoFA]     = useState(false);
    const [loading,   setLoading]   = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg,     setPwMsg]     = useState({ text: '', ok: true });
    const [pwForm,    setPwForm]    = useState({ currentPassword: '', newPassword: '' });
    const navigate                  = useNavigate();
    const { logout, currentUser, currentUserId } = useAuth();

    const handlePwChange = (e) => {
        const { name, value } = e.target;
        setPwForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSave = async () => {
        if (!currentUserId || !pwForm.currentPassword || !pwForm.newPassword) return;
        setPwLoading(true);
        setPwMsg({ text: '', ok: true });
        const result = await settingsService.updatePassword(currentUserId, pwForm);
        setPwLoading(false);
        setPwMsg({ text: result.success ? 'Şifre güncellendi.' : (result.message || 'Hata oluştu.'), ok: result.success });
        if (result.success) setPwForm({ currentPassword: '', newPassword: '' });
    };

    // Modal Hook Entegrasyonu
    const {
        alertConfig,   showAlert,   closeAlert,
        confirmConfig, askConfirm,  closeConfirm,
    } = useModal();

    //! Kullanıcının Tek Admin Olduğu Takımları Bulur
    const checkAdminConstraints = async () => {
        try {
            setLoading(true);

            // Kullanıcının "Admin" rolüne sahip olduğu takımları filtrele
            const adminTeams = currentUser?.role
                ?.filter(r => r.roleName === 'Admin')
                .map(r => r.teamId) || [];

            // Eğer hiçbir takımda admin değilse direkt geçebilir
            if (adminTeams.length === 0) return { canDelete: true };

            const problematicTeams = [];

            // Admin olduğu her takım için diğer üyelerin rollerini kontrol et
            for (const teamId of adminTeams) {
                const members = await teamsService.getTeamMembers(teamId);

                // Takımda kendisi dışında "Admin" var mı?
                const otherAdmins = members.filter(
                    m => m.roleName === 'Admin' && String(m.id) !== String(currentUser.id)
                );

                // Eğer başka admin yoksa, bu takım engellemeye takılır
                if (otherAdmins.length === 0) {
                    const teamInfo = await teamsService.getTeamSettings(teamId);
                    problematicTeams.push(teamInfo?.name || `Takım ID: ${teamId}`);
                }
            }

            if (problematicTeams.length > 0) return { canDelete: false, teams: problematicTeams };
            return { canDelete: true };
        } catch (err) {
            console.error('Güvenlik kontrolü başarısız:', err);
            return { canDelete: false, error: true };
        } finally {
            setLoading(false);
        }
    };

    // HESAP SİLME LOGIC
    const executeDeleteAccount = async () => {
        try {
            setLoading(true);

            const result = await settingsService.deleteAccount(currentUserId);
            if (!result.success) {
                showAlert('Hata', result.message || 'Hesap silinemedi.', 'error');
                return;
            }

            // 2. Onay modalını kapat
            closeConfirm();

            // 3. Alert göster ve "Tamam"a basınca ana sayfaya uçur
            showAlert(
                'Hesap Silme Talebi Alındı',
                'Hesabınız dondurulmuştur. 14 gün boyunca giriş yapmazsanız kalıcı olarak silinecektir. Şimdi oturumunuz kapatılıyor...',
                'warning',
                () => {
                    if (logout) logout(); // LocalStorage temizliği
                    navigate('/'); // Ana sayfaya yönlendir
                }
            );
        } catch (err) {
            console.error('Silme hatası:', err);
            showAlert('Hata', 'İşlem gerçekleştirilemedi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = async () => {
        // Önce Adminlik durumlarını kontrol et
        const check = await checkAdminConstraints();

        if (check.error) {
            showAlert('Sistem Hatası', 'Güvenlik kontrolleri şu an yapılamıyor.', 'error');
            return;
        }

        if (!check.canDelete) {
            showAlert(
                'Hesap Silme Engellendi',
                `Şu takımların tek Admini sizsiniz: \n\n • ${check.teams.join('\n • ')} \n\n Devam etmek için bu takımları silmeli veya başka bir üyeye Admin yetkisi devretmelisiniz.`,
                'warning'
            );
            return;
        }

        // Eğer engel yoksa son onayı sor
        askConfirm(
            'HESABINI SİLMEK İSTEDİĞİNDEN EMİN MİSİN?',
            'Bu işlem geri alınamaz. Hesabınız 14 gün süreyle dondurulacak ve ardından kalıcı olarak silinecektir.',
            executeDeleteAccount,
            'warning' // Tehlikeli durması için warning tipi
        );
    };

    return (
        <div className="st-content-section">
            <div className="st-header-box">
                <h2>Gizlilik & Güvenlik</h2>
                <p>Hesap şifrenizi, kimlik doğrulama ve gizlilik verilerinizi yönetin.</p>
            </div>

            {/* Şifre Değiştirme */}
            <div className="st-card">
                <div className="security-section-label">
                    <i className="ti ti-key" />
                    <h4>Şifreni Değiştir</h4>
                </div>
                <div className="st-form-grid">
                    <div className="st-input-group">
                        <label>Güncel Şifren</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={pwForm.currentPassword}
                            onChange={handlePwChange}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="st-input-group">
                        <label>Yeni Şifren</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={pwForm.newPassword}
                            onChange={handlePwChange}
                            placeholder="Min. 8 karakter"
                        />
                    </div>
                </div>
                {pwMsg.text && (
                    <p style={{ fontSize: '0.82rem', color: pwMsg.ok ? 'var(--green)' : 'var(--red-alt)', marginBottom: '8px' }}>
                        {pwMsg.text}
                    </p>
                )}
                <button className="st-btn-save security-btn" onClick={handlePasswordSave} disabled={pwLoading}>
                    <i className={`ti ${pwLoading ? 'ti-loader-2' : 'ti-device-floppy'}`} />
                    {pwLoading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                </button>
            </div>

            {/* 2FA ve Gizli Mod */}
            <div className="security-row-grid">
                <div className="st-card">
                    <div className="security-toggle-row">
                        <div>
                            <h4>
                                İki Faktörlü Kimlik
                                <span className="coming-soon-tag">Yakında</span>
                            </h4>
                            <p>Hesabınıza ekstra bir güvenlik katmanı ekleyin.</p>
                            <div className={`two-fa-status${twoFA ? ' active' : ''}`}>
                                {twoFA ? 'Doğrulayıcı ile Korunuyor' : 'Ayarlanmadı'}
                            </div>
                        </div>
                        <label className="st-switch">
                            <input
                                type="checkbox"
                                checked={twoFA}
                                onChange={() => setTwoFA(v => !v)}
                                disabled
                            />
                            <span className="st-slider" />
                        </label>
                    </div>
                </div>

                <div className="st-card">
                    <div className="security-toggle-row">
                        <div>
                            <h4>
                                Gizli Mod
                                <span className="coming-soon-tag">Yakında</span>
                            </h4>
                            <p>Seyahat detaylarınızı raporlardan gizleyin.</p>
                        </div>
                        <label className="st-switch">
                            <input type="checkbox" disabled />
                            <span className="st-slider" />
                        </label>
                    </div>
                </div>
            </div>

            {/* Tehlike Bölgesi */}
            <div className="st-danger-zone">
                <div className="danger-header">
                    <h4>Tehlike Bölgesi</h4>
                    <p>Hesabınızı sildikten sonra geri dönüş yok. Lütfen emin olun.</p>
                </div>
                <button
                    className="st-btn-delete"
                    onClick={handleDeleteClick}
                    disabled={loading}
                >
                    {loading ? (
                        <><i className="ti ti-loader-2" style={{ animation: 'spin .7s linear infinite' }} /> Güvenlik Kontrolü...</>
                    ) : (
                        <><i className="ti ti-trash" /> Flowtera Hesabımı Sil</>
                    )}
                </button>
            </div>

            {/* Modalları Sayfaya Ekledik */}
            <Confirm {...confirmConfig} onClose={closeConfirm} />
            <Alert   {...alertConfig}   onClose={closeAlert}   />
        </div>
    );
};

export default Security;