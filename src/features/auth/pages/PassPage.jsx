import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useModal } from '../../../hooks/useModal';
import Alert from '../../../components/modals/Alert';
import '../auth.css/Pass.css';

const PassPage = () => {
  const [form, setForm] = useState({ email: '', phone: '', channel: 'email' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { alertConfig, showAlert, closeAlert } = useModal();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.requestPasswordResetLink(form);
      if (!result.success) {
        setError(result.message);
        return;
      }

      showAlert(
        'Baglanti Gonderildi',
        `${result.message} Hedef: ${result.destination}`,
        'success',
        () => {
          window.location.href = '/';
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb orb-green"></div>
      <div className="auth-orb orb-blue"></div>
      <div className="auth-grid-overlay"></div>

      <div className="auth-card-wrap pass-wrap">
        <Link to="/" className="auth-logo">
          <img src="/Logo.png" alt="FlowTera" className="auth-logo-img" />
          <span className="auth-logo-name">FlowTera</span>
        </Link>

        <div className="auth-card pass-card">
          <div className="auth-card-header">
            <h1>Sifre Sifirlama</h1>
            <p>E-posta ve telefon bilgini dogrula, sifirlama linkini gonderelim.</p>
          </div>

          {error ? (
            <div className="auth-error">
              <i className="ti ti-alert-circle"></i>
              {error}
            </div>
          ) : null}

          <form className="auth-form pass-form" onSubmit={handleSubmit}>
            <div className="pass-channel">
              <button
                type="button"
                className={form.channel === 'email' ? 'active' : ''}
                onClick={() => setForm((prev) => ({ ...prev, channel: 'email' }))}
              >
                E-posta ile Gonder
              </button>
              <button
                type="button"
                className={form.channel === 'sms' ? 'active' : ''}
                onClick={() => setForm((prev) => ({ ...prev, channel: 'sms' }))}
              >
                SMS ile Gonder
              </button>
            </div>

            {form.channel === 'email' ? (
              <div className="auth-field">
                <label htmlFor="email">E-POSTA ADRESI</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-mail auth-input-icon"></i>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="isim@sirket.com"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="auth-field">
                <label htmlFor="phone">TELEFON NUMARASI</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-phone auth-input-icon"></i>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+90 5xx xxx xx xx"
                    required
                  />
                </div>
              </div>
            )}

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Gonderiliyor...' : 'Sifirlama Linki Gonder'}
            </button>
          </form>

          <div className="auth-switch">
            Hesabini hatirladin mi? <Link to="/login">Giris ekranina don</Link>
          </div>
        </div>
      </div>
      <Alert {...alertConfig} onClose={closeAlert} />
    </div>
  );
};

export default PassPage;
