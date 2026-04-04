import React, { useState } from 'react';
import '../settings.css/Security.css';

const Security = () => {
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="st-content-section">
      <div className="st-header-box">
        <h2>Gizlilik & Güvenlik</h2>
        <p>Hesap şifrenizi, kimlik doğrulama ve gizlilik verilerinizi yönetin.</p>
      </div>

      {/* Password Change Card */}
      <div className="st-card security-card">
        <div className="security-header">
            <i className="ti ti-key"></i>
            <h4>Şifreni Değiştir</h4>
        </div>
        <div className="st-form-grid">
          <div className="st-input-group">
            <label>Güncel Şifren</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div className="st-input-group">
            <label>Yeni Şifren</label>
            <input type="password" placeholder="Min. 8 Karakter" />
          </div>
        </div>
        <button className="st-btn-save security-btn">Şifreyi Güncelle</button>
      </div>

      {/* 2FA & Privacy Settings */}
      <div className="security-row-grid">
        <div className="st-card security-mini-card">
            <div className="security-toggle-header">
                <div className="info">
                    <h4>İki Faktörlü Kimlik Doğrulama (Yakında)</h4>
                    <p>Ekstra bir güvenlik katmanı ekleyin.</p>
                </div>
                <label className="st-switch">
                  <input 
                    type="checkbox" 
                    checked={twoFA} 
                    onChange={() => setTwoFA(!twoFA)} 
                    disabled
                  />
                  <span className="st-slider"></span>
                </label>
            </div>
            <div className={`two-fa-status ${twoFA ? 'active' : ''}`}>
                {twoFA ? 'Doğrulayıcı ile Korunuyor' : 'Ayarlanmadı'}
            </div>
        </div>

        <div className="st-card security-mini-card">
            <div className="security-toggle-header">
                <div className="info">
                    <h4>Gizli Mod (Yakında)</h4>
                    <p>Seyahat detaylarınızı raporlardan gizleyin.</p>
                </div>
                <label className="st-switch">
                  <input type="checkbox" disabled />
                  <span className="st-slider"></span>
                </label>
            </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="st-danger-zone">
        <div className="danger-header">
            <h4>Tehlike Bölge</h4>
            <p>Hesabınızı sildikten sonra geri dönüş yok. Lütfen emin olun.</p>
        </div>
        <button className="st-btn-delete">Flowtera Hesabımı Sil</button>
      </div>
    </div>
  );
};

export default Security;