import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import { authService } from '../../services/authService';
import Mail from '../../components/Mail';
import SelectSubscription from '../../section/SelectSubscription';
import PhoneNumber from '../../../../components/overlays/phone/PhoneNumber';
import './Signup.css';

const initialForm = {
  firstName: '',
  lastName:  '',
  email:     '',
  phone:     '',
  birthDate: '',
  address:   '',
  password:  '',
};

const initialCheckboxes = {
  termsAccepted: false,
  kvkkAccepted:  false,
};

function SignupPage() {
  const { t } = useTranslation('auth.signup');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep]                     = useState('form');
  const [formData, setFormData]             = useState(initialForm);
  const [formErrors, setFormErrors]         = useState({});
  const [plans, setPlans]                   = useState([]);
  const [selectedPlan, setSelectedPlan]     = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [statusMessage, setStatusMessage]   = useState('');
  const [errorMessage, setErrorMessage]     = useState('');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [checkboxes, setCheckboxes]         = useState(initialCheckboxes);

  useEffect(() => {
    authService.getPlans().then(setPlans);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePhoneChange = (formattedValue) => {
    setFormData((prev) => ({ ...prev, phone: formattedValue }));
    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }));
  };

  const handleCheckboxChange = (name) => {
    setCheckboxes((prev) => ({ ...prev, [name]: !prev[name] }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const goToPlanStep = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const validation = authService.validateSignupForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const duplicateCheck = await authService.validateSignupAgainstUsers(validation.normalized);
    if (!duplicateCheck.valid) {
      if (duplicateCheck.fields) setFormErrors((prev) => ({ ...prev, ...duplicateCheck.fields }));
      setErrorMessage(duplicateCheck.message);
      return;
    }

    setFormData(validation.normalized);
    setFormErrors({});
    setStep('plan');
  };

  const handleStartVerification = async () => {
    if (!selectedPlan) {
      setErrorMessage(t('err_select_plan'));
      return;
    }

    setErrorMessage('');
    setStatusMessage('');
    setIsSubmitting(true);

    try {
      const flow    = authService.isFreePlan(selectedPlan) ? 'free' : 'paid';
      const payload = { ...formData, plan: selectedPlan, flow };

      const started = await authService.startEmailVerification(payload);
      if (!started.success) {
        setErrorMessage(started.message);
        return;
      }

      if (started.token && started.user) {
        if (flow === 'paid') {
          setStatusMessage(t('status_payment_redirect'));
          setTimeout(() => navigate('/payment', { state: { fromSubscription: true, planId: selectedPlan.id } }), 400);
        } else {
          login(started.user.id, false);
        }
        return;
      }

      setStatusMessage(started.message);
      setStep('verify');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndContinue = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const verify = await authService.verifyEmailCode(verificationCode);
      if (!verify.success) {
        setErrorMessage(verify.message || t('err_verify_fail'));
        return;
      }

      if (verify.requiresPayment) {
        setStatusMessage(t('status_email_verified'));
        setTimeout(() => navigate('/payment', { state: { fromSubscription: true, planId: selectedPlan?.id } }), 400);
        return;
      }

      if (verify.userDraft?.id) {
        login(verify.userDraft.id, false);
      } else {
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await authService.startEmailVerification({
        ...formData,
        plan: selectedPlan,
        flow: authService.isFreePlan(selectedPlan) ? 'free' : 'paid',
      });
      if (result.success) setStatusMessage(result.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = {
    form:   t('step_form_title'),
    plan:   t('step_plan_title'),
    verify: t('step_verify_title'),
  };

  const stepDescs = {
    form:   t('step_form_desc'),
    plan:   t('step_plan_desc'),
    verify: t('step_verify_desc'),
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
          <div className="auth-top-nav">
            <Link to="/" className="auth-back-home">
              <i className="ti ti-home"></i>
            </Link>
          </div>

          <div className="auth-card-header">
            <h1>{stepTitles[step]}</h1>
            <p>{stepDescs[step]}</p>
          </div>

          <div className="signup-progress">
            <span className={step === 'form'   ? 'active' : step === 'plan' || step === 'verify' ? 'done' : ''}></span>
            <span className={step === 'plan'   ? 'active' : step === 'verify' ? 'done' : ''}></span>
            <span className={step === 'verify' ? 'active' : ''}></span>
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

          {step === 'form' && (
            <form className="auth-form signup-form" onSubmit={goToPlanStep}>
              <div className="signup-grid">
                <div className="auth-field">
                  <label htmlFor="firstName">{t('label_first_name')}</label>
                  <div className="auth-input-wrap">
                    <i className="ti ti-user auth-input-icon"></i>
                    <input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t('placeholder_first_name')} />
                  </div>
                  {formErrors.firstName && <small className="field-error">{formErrors.firstName}</small>}
                </div>

                <div className="auth-field">
                  <label htmlFor="lastName">{t('label_last_name')}</label>
                  <div className="auth-input-wrap">
                    <i className="ti ti-user auth-input-icon"></i>
                    <input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={t('placeholder_last_name')} />
                  </div>
                  {formErrors.lastName && <small className="field-error">{formErrors.lastName}</small>}
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="email">{t('label_email')}</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-mail auth-input-icon"></i>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder={t('placeholder_email')} />
                </div>
                {formErrors.email && <small className="field-error">{formErrors.email}</small>}
              </div>

              <div className="auth-field phone-field">
                <label htmlFor="phone">{t('label_phone')}</label>
                <PhoneNumber
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  error={formErrors.phone}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="birthDate">{t('label_birth_date')}</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-calendar-user auth-input-icon"></i>
                  <input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
                </div>
                {formErrors.birthDate && <small className="field-error">{formErrors.birthDate}</small>}
              </div>

              <div className="auth-field">
                <label htmlFor="address">{t('label_address')}</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-map-pin auth-input-icon"></i>
                  <input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder={t('placeholder_address')} />
                </div>
                {formErrors.address && <small className="field-error">{formErrors.address}</small>}
              </div>

              <div className="auth-field">
                <label htmlFor="password">{t('label_password')}</label>
                <div className="auth-input-wrap">
                  <i className="ti ti-lock auth-input-icon"></i>
                  <input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder={t('placeholder_password')} />
                </div>
                {formErrors.password && <small className="field-error">{formErrors.password}</small>}
              </div>

              <div className="auth-checkboxes">
                <label className={`auth-checkbox-label ${checkboxes.termsAccepted ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checkboxes.termsAccepted}
                    onChange={() => handleCheckboxChange('termsAccepted')}
                    required
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    <Link to="/terms" target="_blank" className="auth-link">{t('terms_link_text')}</Link>{t('terms_accept')}
                  </span>
                </label>
                {formErrors.termsAccepted && <small className="field-error">{formErrors.termsAccepted}</small>}

                <label className={`auth-checkbox-label ${checkboxes.kvkkAccepted ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checkboxes.kvkkAccepted}
                    onChange={() => handleCheckboxChange('kvkkAccepted')}
                    required
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    <Link to="/kvkk" target="_blank" className="auth-link">{t('kvkk_link_text')}</Link>{t('kvkk_accept')}
                  </span>
                </label>
                {formErrors.kvkkAccepted && <small className="field-error">{formErrors.kvkkAccepted}</small>}
              </div>

              <button
                className="auth-submit-btn"
                type="submit"
                disabled={!checkboxes.termsAccepted || !checkboxes.kvkkAccepted}
              >
                {t('next_btn')} <i className="ti ti-arrow-right"></i>
              </button>
            </form>
          )}

          {step === 'plan' && (
            <div className="signup-step-two">
              <SelectSubscription
                plans={plans}
                selectedPlanId={selectedPlan?.id}
                onSelectPlan={setSelectedPlan}
                onContinue={handleStartVerification}
                loading={isSubmitting}
              />
              <button type="button" className="signup-back-btn" onClick={() => setStep('form')}>
                <i className="ti ti-arrow-left"></i> {t('back_to_form')}
              </button>
            </div>
          )}

          {step === 'verify' && (
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
                <i className="ti ti-arrow-left"></i> {t('back_to_plan')}
              </button>
            </div>
          )}

          {step === 'form' && (
            <div className="auth-switch">
              {t('have_account')} <Link to="/login">{t('login_link')}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
