import React from 'react';
import { authService } from '../services/authService';
import '../auth.css/Mail.css';

const Mail = ({
  email,
  code,
  onCodeChange,
  onConfirm,
  onResend,
  loading,
  hintVisible = true
}) => {
  const handleChange = (event) => {
    onCodeChange(authService.sanitizeVerificationCodeInput(event.target.value));
  };

  return (
    <section className="mail-verify-panel" aria-live="polite">
      <div className="mail-verify-head">
        <h3>E-posta Dogrulamasi</h3>
        <p>
          E-postaniza gelen kodu kontrol ediniz ve asagidaki alana giriniz.
          {hintVisible ? ' Test kodu: 000000' : ''}
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
          placeholder="000000"
          aria-label="Dogrulama kodu"
        />
        <button type="button" onClick={onConfirm} disabled={loading || code.length !== 6}>
          Kodu Onayla
        </button>
      </div>

      <div className="mail-verify-footer">
        <span>{email}</span>
        <button type="button" onClick={onResend} disabled={loading}>
          Kodu Tekrar Gonder
        </button>
      </div>
    </section>
  );
};

export default Mail;
