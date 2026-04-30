import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../../context/AuthContext'; 
import { authService } from '../services/authService';
import Mail from '../components/Mail';
import '../auth.css/Login.css'; 

const LoginPage = () => {
  const { loginWithCredentials, login, loading } = useAuth(); 
  const navigate = useNavigate(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('credentials');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingLoginUser, setPendingLoginUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setIsSubmitting(true);

    try {
      const result = await loginWithCredentials(email, password);

      if (result.success) {
        setPendingLoginUser(result.user);
        authService.startLoginVerification({
          email: result.user.email,
          userId: result.user.id,
          rememberMe
        });
        setStep('verify');
        setStatus('Bilgiler dogrulandi. E-posta kodunu girerek devam et.');
        setIsSubmitting(false);
      } else {
        setError(result.message || 'E-posta veya şifre hatalı.');
        setIsSubmitting(false);
      }
    } catch {
      setError('Sistem bağlantı hatası.');
      setIsSubmitting(false);
    }
  };

  const handleVerifyLogin = () => {
    setError('');
    const verify = authService.verifyLoginCode(verificationCode);
    if (!verify.success) {
      setError(verify.message);
      return;
    }

    login(verify.userId, verify.rememberMe);
    navigate('/home');
  };

  const handleResendCode = async () => {
    if (!pendingLoginUser) return;
    setStatus('');
    setError('');
    setIsSubmitting(true);
    try {
      const resend = authService.startLoginVerification({
        email: pendingLoginUser.email,
        userId: pendingLoginUser.id,
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

          {error && (
            <div className="auth-error">
              <i className="ti ti-alert-circle"></i>
              {error}
            </div>
          )}

          {status && (
            <div className="auth-success">
              <i className="ti ti-circle-check"></i>
              {status}
            </div>
          )}

          {step === 'credentials' ? (
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
                email={pendingLoginUser?.email || email}
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
                  setStep('credentials');
                  setVerificationCode('');
                  setPendingLoginUser(null);
                  setStatus('');
                }}
              >
                <i className="ti ti-arrow-left"></i> Bilgilere geri don
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