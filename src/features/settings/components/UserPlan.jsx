import React from 'react';
import '../settings.css/UserPlan.css';

const UserPlan = ({ user }) => {
  if (!user) return null;

  const currentPlan = user.subscription?.plan || "Free";

  const plans = [
    { name: 'Starter', price: '0', features: ['3 Trips / Mo', 'Basic Reporting', 'Mobile App'] },
    { name: 'Pro', price: '19', features: ['Unlimited Trips', 'Advanced Analytics', 'Multi-Currency', 'OCR Support'] },
    { name: 'Enterprise', price: '49', features: ['Team Management', 'Custom Branding', 'Priority Support', 'API Access'] }
  ];

  return (
    <div className="st-content-section">
      <div className="st-header-box">
        <h2>Subscriptions</h2>
        <p>Manage your billing, plan limits and upgrade your experience.</p>
      </div>

      {/* Mevcut Plan Özeti */}
      <div className="st-card current-plan-card">
        <div className="plan-badge">CURRENT PLAN</div>
        <div className="plan-info-main">
          <div className="plan-text">
            <h3>{currentPlan.toUpperCase()}</h3>
            <p>Your next billing date is <strong>June 15, 2026</strong></p>
          </div>
          <div className="plan-price-display">
            {currentPlan === 'Pro' ? '$19' : currentPlan === 'Enterprise' ? '$49' : '$0'}<span>/mo</span>
          </div>
        </div>
        <div className="plan-progress-area">
            <div className="progress-header">
                <span>Monthly OCR Usage</span>
                <span>85%</span>
            </div>
            <div className="progress-bar">
                <div className="progress-fill" style={{width: '85%'}}></div>
            </div>
        </div>
      </div>

      {/* Plan Seçenekleri */}
      <div className="plan-grid-modern">
        {plans.map((p) => (
          <div key={p.name} className={`plan-option-card ${currentPlan.toLowerCase() === p.name.toLowerCase() ? 'active' : ''}`}>
            {currentPlan.toLowerCase() === p.name.toLowerCase() && <div className="active-tag">Current</div>}
            <h4>{p.name}</h4>
            <div className="option-price">${p.price}<span>/mo</span></div>
            <ul className="option-features">
              {p.features.map((f, i) => (
                <li key={i}><i className="ti ti-check"></i> {f}</li>
              ))}
            </ul>
            <button className={`plan-btn ${currentPlan.toLowerCase() === p.name.toLowerCase() ? 'disabled' : ''}`}>
                {currentPlan.toLowerCase() === p.name.toLowerCase() ? 'Manage Plan' : 'Upgrade Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPlan;