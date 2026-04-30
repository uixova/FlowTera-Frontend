import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Mail from '../components/Mail';
import SelectSubscription from '../section/SelectSubscription';
import '../auth.css/Signup.css';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  address: '',
  password: ''
};

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    authService.getPlans().then(setPlans);
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const goToPlanStep = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const validation = authService.validateSignupForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const duplicateCheck = await authService.validateSignupAgainstUsers(validation.normalized);
    if (!duplicateCheck.valid) {
      setErrorMessage(duplicateCheck.message);
      return;
    }

    setFormData(validation.normalized);
    setFormErrors({});
    setStep('plan');
  };

  const handleStartVerification = async () => {
    if (!selectedPlan) {
      setErrorMessage('Lutfen bir plan sec.');
      return;
    }

    setErrorMessage('');
    setStatusMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        plan: selectedPlan,
        flow: authService.isFreePlan(selectedPlan) ? 'free' : 'paid'
      };

      const started = await authService.startEmailVerification(payload);
      if (!started.success) {
        setErrorMessage(started.message);
        return;
      }

      setStatusMessage(started.message);
      setStep('verify');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndContinue = () => {
    setErrorMessage('');
    const verify = authService.verifyEmailCode(verificationCode);
    if (!verify.success) {
      setErrorMessage(verify.message);
      return;
    }

    if (verify.requiresPayment) {
      setStatusMessage('E-posta dogrulandi. Odeme adimina yonlendiriliyorsun.');
      setTimeout(() => navigate(`/payment?plan=${selectedPlan.id}`), 500);
      return;
    }

    setStatusMessage('Hesabin hazir. Giris ekranina yonlendiriliyorsun.');
    setTimeout(() => navigate('/login'), 800);
  };

  const handleResendCode = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await authService.startEmailVerification({
        ...formData,
        plan: selectedPlan,
        flow: authService.isFreePlan(selectedPlan) ? 'free' : 'paid'
      });
      if (result.success) setStatusMessage(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb orb-green"></div>
      <div className="auth-orb orb-blue"></div>
      <div className="auth-grid-overlay"></div>

      <div className="auth-card-wrap signup-wrap">
        <Link to="/" className="auth-logo">
          <img src="/Logo.png" alt="FlowTera" className="auth-logo-img" />
          <span className="auth-logo-name">FlowTera</span>
        </Link>

        <div className="auth-card signup-card">
          <div className="auth-card-header">
            <h1>
              {step === 'form'
                ? 'Hesap Olustur'
                : step === 'plan'
                ? 'Plan Secimi'
                : 'E-posta Dogrulamasi'}
            </h1>
            <p>
              {step === 'form'
                ? 'Bilgilerini gir, hesabini hazirla ve devam et.'
                : step === 'plan'
                ? 'Plan secimini tamamla, sonra dogrulama ile ilerle.'
                : 'Kayit guvenligi icin kod dogrulamasini tamamla.'}
            </p>
          </div>

          <div className="signup-progress">
            <span className={step === 'form' ? 'active' : ''}>1</span>
            <span className={step === 'plan' ? 'active' : ''}>2</span>
            <span className={step === 'verify' ? 'active' : ''}>3</span>
          </div>

          {errorMessage && (
            <div className="auth-error">
              <i className="ti ti-alert-circle"></i>
              {errorMessage}
            </div>
          )}
          {statusMessage && (
            <div className="auth-success">
              <i className="ti ti-circle-check"></i>
              {statusMessage}
            </div>
          )}

          {step === 'form' ? (
            <form className="auth-form signup-form" onSubmit={goToPlanStep}>
              <div className="signup-grid">
                <div className="auth-field">
                  <label htmlFor="firstName">AD</label>
                  <div className="auth-input-wrap">
                    <i className="ti ti-user auth-input-icon"></i>
                    <input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Adin" />
                  </div>
                  {formErrors.firstName && <small className="field-error">{formErrors.firstName}</small>}
                </div>

                <div className="auth-field">
                  <label htmlFor="lastName">SOYAD</label>
                  <div className="auth-input-wrap">
                    <i className="ti ti-user auth-input-icon"></i>
                    <input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Soyadin" />
                  </div>
                  {formErrors.lastName && <small className="field-error">{formErrors.lastName}</small>}
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="email">E-POSTA</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-mail auth-input-icon"></i>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="isim@sirket.com" />
                </div>
                {formErrors.email && <small className="field-error">{formErrors.email}</small>}
              </div>

              <div className="signup-grid">
                <div className="auth-field">
                  <label htmlFor="phone">TELEFON</label>
                  <div className="auth-input-wrap">
                    <i className="ti ti-phone auth-input-icon"></i>
                    <input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+90 5xx xxx xx xx" />
                  </div>
                  {formErrors.phone && <small className="field-error">{formErrors.phone}</small>}
                </div>

                <div className="auth-field">
                  <label htmlFor="birthDate">DOGUM TARIHI</label>
                  <div className="auth-input-wrap">
                    <i className="ti ti-calendar-user auth-input-icon"></i>
                    <input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
                  </div>
                  {formErrors.birthDate && <small className="field-error">{formErrors.birthDate}</small>}
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="address">ADRES</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-map-pin auth-input-icon"></i>
                  <input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Acik adres bilgisi" />
                </div>
                {formErrors.address && <small className="field-error">{formErrors.address}</small>}
              </div>

              <div className="auth-field">
                <label htmlFor="password">SIFRE</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-lock auth-input-icon"></i>
                  <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Minimum 8 karakter" />
                </div>
                {formErrors.password && <small className="field-error">{formErrors.password}</small>}
              </div>

              <button className="auth-submit-btn" type="submit">Next <i className="ti ti-arrow-right"></i></button>
            </form>
          ) : null}

          {step === 'plan' ? (
            <div className="signup-step-two">
              <SelectSubscription
                plans={plans}
                selectedPlanId={selectedPlan?.id}
                onSelectPlan={setSelectedPlan}
                onContinue={handleStartVerification}
                loading={isSubmitting}
              />

              <button type="button" className="signup-back-btn" onClick={() => setStep('form')}>
                <i className="ti ti-arrow-left"></i> Bilgilere Don
              </button>
            </div>
          ) : null}

          {step === 'verify' ? (
            <div className="signup-step-two">
              <Mail
                email={formData.email}
                code={verificationCode}
                onCodeChange={setVerificationCode}
                onConfirm={handleVerifyAndContinue}
                onResend={handleResendCode}
                loading={isSubmitting}
                hintVisible
              />
              <button type="button" className="signup-back-btn" onClick={() => setStep('plan')}>
                <i className="ti ti-arrow-left"></i> Plana Don
              </button>
            </div>
          ) : null}

          <div className="auth-switch">
            Zaten hesabin var mi? <Link to="/login">Giris Yap</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;