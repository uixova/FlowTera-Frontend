import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
    pendingUser,
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemoLogin = searchParams.get('demo') === '1';
  const demoAttempted = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAuthError(null);
  }, [setAuthError]);

  useEffect(() => {
    if (!isDemoLogin || demoAttempted.current || loading) return;
    demoAttempted.current = true;
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL || 'demo@flowtera.app';
    const demoPwd   = import.meta.env.VITE_DEMO_PASSWORD || '';
    if (!demoPwd) return;
    setIsSubmitting(true);
    loginWithCredentials(demoEmail, demoPwd, false).then((result) => {
      if (result.success && result.redirecting) navigate('/home', { replace: true });
      setIsSubmitting(false);
    });
  }, [isDemoLogin, loading, loginWithCredentials, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsSubmitting(true);

    const result = await loginWithCredentials(email, password, rememberMe);

    if (result.success && !result.redirecting) {
      setStatus('Bilgiler doğrulandı. E-posta kodunu girerek devam et.');
    }
    setIsSubmitting(false);
  };

  const handleVerifyLogin = async () => {
    setAuthError(null);
    const safeCode = verificationCode.replace(/\D/g, '').slice(0, 6);
    if (safeCode.length !== 6) {
      setAuthError('6 haneli kod gerekli.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await authService.verifyLoginOtp(pendingUser?.email || email, safeCode);
      if (!result.success) {
        setAuthError(result.message || 'Kod hatalı.');
        return;
      }
      const remember = pendingUser?.rememberMe ?? false;
      if (remember) localStorage.setItem('auth_token', result.token);
      else          sessionStorage.setItem('auth_token', result.token);
      login(result.user.id, remember);
      navigate('/home');
    } catch {
      setAuthError('Doğrulama hatası. Lütfen tekrar dene.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingUser || !password) return;
    setStatus('');
    setAuthError(null);
    setIsSubmitting(true);
    const result = await authService.resendLoginOtp(pendingUser.email || email, password);
    if (result.success) setStatus(result.message || 'Yeni kod gönderildi.');
    else                setAuthError(result.message || 'Kod gönderilemedi.');
    setIsSubmitting(false);
  };

  if (loading) return null;

  const isVerifyStep = authStep === 'verify';

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
            <h1>{isVerifyStep ? 'E-posta Doğrula' : 'Tekrar Hoş Geldin'}</h1>
            <p>
              {isVerifyStep
                ? `${pendingUser?.email || email} adresine kod gönderildi.`
                : 'Finansal akışını yönetmek için giriş yap.'}
            </p>
          </div>

          {isDemoLogin && isSubmitting && (
            <div className="auth-success">
              <i className="ti ti-rocket"></i>
              Demo hesabına giriş yapılıyor...
            </div>
          )}

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

          {!isVerifyStep ? (
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
                  <Link to="/forgot-password" className="auth-forgot">Şifremi Unuttum</Link>
                </label>
                <div className="auth-input-wrap">
                  <i className="ti ti-lock auth-input-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
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
                    tabIndex={-1}
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
                  <>Giriş Yap <i className="ti ti-arrow-right"></i></>
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

          {!isVerifyStep && (
            <>
              <div className="auth-divider"><span>VEYA</span></div>
              <div className="auth-switch">
                Hesabın yok mu? <Link to="/signup">Ücretsiz Başla</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
