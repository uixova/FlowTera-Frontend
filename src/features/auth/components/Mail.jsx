import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import './Mail.css';

const Mail = ({
  email,
  code,
  onCodeChange,
  onConfirm,
  onResend,
  loading,
  hintVisible = true
}) => {
  const { t } = useTranslation('auth.mail');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (event) => {
    onCodeChange(authService.sanitizeVerificationCodeInput(event.target.value));
  };

  const handleResendClick = () => {
    if (countdown === 0 && !loading) {
      onResend();
      setCountdown(60);
    }
  };

  return (
    <section className="mail-verify-panel" aria-live="polite">
      <div className="mail-verify-head">
        <h3>{t('verify_email')}</h3>
        <p>
          {t('verify_subtitle')}
          {hintVisible ? t('test_hint') : ''}
        </p>
      </div>

      <div className="mail-code-row">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={handleChange}
          placeholder="* * * * * *"
          aria-label={t('code_aria')}
        />
        <button type="button" onClick={onConfirm} disabled={loading || code.length !== 6}>
          {t('confirm_btn')}
        </button>
      </div>

      <div className="mail-verify-footer">
        <span>{email}</span>
        <button
          type="button"
          onClick={handleResendClick}
          disabled={loading || countdown > 0}
        >
          {countdown > 0 ? t('resend_countdown', { count: countdown }) : t('resend_btn')}
        </button>
      </div>
    </section>
  );
};

export default Mail;
