import React from 'react';
import '../auth.css/SelectSubs.css';

const SelectSubscription = ({ plans, selectedPlanId, onSelectPlan, onContinue, loading }) => {
  return (
    <section className="select-subs-frame">
      <header className="select-subs-header">
        <h3>Plan Secimi</h3>
        <p>Ihtiyacina uygun paketi sec, sonra dogrulama ile devam et.</p>
      </header>

      <div className="select-subs-grid">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <button
              type="button"
              key={plan.id}
              className={`select-subs-card ${plan.popular ? 'popular' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectPlan(plan)}
            >
              {plan.popular ? <span className="select-subs-badge">Populer</span> : null}
              <div className="select-subs-icon">
                <i className={`ti ${plan.icon}`}></i>
              </div>

              <div className="select-subs-plan">{plan.name}</div>
              <p className="select-subs-desc">{plan.description}</p>

              <div className="select-subs-price">
                {plan.price === 0 ? 'Ucretsiz' : `${plan.price} ${plan.currency} / ay`}
              </div>

              <ul className="select-subs-features">
                {plan.features.slice(0, 5).map((feature, index) => (
                  <li key={`${plan.id}-${index}`} className={!feature.included ? 'disabled' : ''}>
                    <i className={`ti ${feature.included ? 'ti-check' : 'ti-x'}`}></i>
                    {feature.text}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="select-subs-actions">
        <button type="button" className="auth-submit-btn" disabled={!selectedPlanId || loading} onClick={onContinue}>
          Plani Sec
        </button>
      </div>
    </section>
  );
};

export default SelectSubscription;
