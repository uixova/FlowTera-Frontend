import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../../../context/AuthContext'; 
import { authService } from '../../services/authService'; 
import Mail from '../../components/Mail';
import './Login.css'; 

const LoginPage = () => {
  const { 
    loginWithCredentials, 
    login, 
    loading, 
    authStep, 
    setAuthStep, 
    authError, 
    setAuthError, 
    pendingUser 
  } = useAuth(); 
  
  const navigate = useNavigate(); 

  // Yerel form state'leri 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sayfa yüklendiğinde eski hataları temizle
  useEffect(() => {
    setAuthError(null);
  }, [setAuthError]);

  // Kimlik Bilgileri Gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsSubmitting(true);

    const result = await loginWithCredentials(email, password, rememberMe);
    
    if (result.success) {
      setStatus('Bilgiler doğrulandı. E-posta kodunu girerek devam et.');
    }
    setIsSubmitting(false);
  };

  // Kod Doğrulam
  const handleVerifyLogin = () => {
    setAuthError(null);
    const verify = authService.verifyLoginCode(verificationCode);
    
    if (verify.success) {
      login(verify.userId, verify.rememberMe);
      navigate('/home');
    } else {
      setAuthError(verify.message);
    }
  };

  const handleResendCode = async () => {
    if (!pendingUser) return;
    setStatus('');
    setIsSubmitting(true);
    try {
      const resend = authService.startLoginVerification({
        email: pendingUser.email,
        userId: pendingUser.id,
        rememberMe
      });
      setStatus(resend.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="auth-page"> 
      <div className="auth-orb orb-green"></div>
      <div className="auth-orb orb-blue"></div>
      <div className="auth-grid-overlay"></div>

      <div className="auth-card-wrap">
        <Link to="/" className="auth-logo">
          <img src="/Logo.png" alt="FlowTera" className="auth-logo-img" />
          <span className="auth-logo-name">FlowTera</span>
        </Link>

        <div className="auth-card">
          <div className="auth-top-nav">
            <Link to="/" className="auth-back-home">
              <i className="ti ti-home"></i> 
            </Link>
          </div>
          
          <div className="auth-card-header">
            <h1>Tekrar Hoş Geldin</h1>
            <p>Finansal akışını yönetmek için giriş yap.</p>
          </div>

          {authError && (
            <div className="auth-error">
              <i className="ti ti-alert-circle"></i>
              {authError}
            </div>
          )}

          {status && (
            <div className="auth-success">
              <i className="ti ti-circle-check"></i>
              {status}
            </div>
          )}

          {authStep === 'credentials' ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="email">E-POSTA ADRESİ</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-mail auth-input-icon"></i>
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    placeholder="isim@sirket.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">
                  ŞİFRE
                  <Link to="/forgot-password" size="0.65rem" className="auth-forgot">
                    Şifremi Unuttum
                  </Link>
                </label>
                <div className="auth-input-wrap">
                  <i className="ti ti-lock auth-input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="auth-remember">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="auth-checkmark"></span>
                  Beni Hatırla
                </label>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="auth-spinner"></div>
                ) : (
                  <>
                    Giriş Yap <i className="ti ti-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="login-verify-wrap">
              <Mail
                email={pendingUser?.email || email}
                code={verificationCode}
                onCodeChange={setVerificationCode}
                onConfirm={handleVerifyLogin}
                onResend={handleResendCode}
                loading={isSubmitting}
                hintVisible
              />
              <button
                type="button"
                className="login-verify-back"
                onClick={() => {
                  setAuthStep('credentials');
                  setVerificationCode('');
                  setStatus('');
                  setAuthError(null);
                }}
              >
                <i className="ti ti-arrow-left"></i> Bilgilere geri dön
              </button>
            </div>
          )}

          <div className="auth-divider">
            <span>VEYA</span>
          </div>

          <div className="auth-switch">
            Hesabın yok mu? <Link to="/signup">Ücretsiz Başla</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;