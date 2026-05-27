import React from 'react';
import { useTranslation } from 'react-i18next';
import './SelectSubscription.css';

const SelectSubscription = ({ plans, selectedPlanId, onSelectPlan, onContinue, loading }) => {
  const { t } = useTranslation('auth.subscription');

  return (
    <section className="select-subs-frame">
      <header className="select-subs-header">
        <h3>{t('select_title')}</h3>
        <p>{t('select_subtitle')}</p>
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
              {plan.popular ? <span className="select-subs-badge">{t('popular_badge')}</span> : null}
              <div className="select-subs-icon">
                <i className={`ti ${plan.icon}`}></i>
              </div>

              <div className="select-subs-plan">{plan.name}</div>
              <p className="select-subs-desc">{plan.description}</p>

              <div className="select-subs-price">
                {plan.price === 0 ? t('free_label') : `${plan.price} ${plan.currency} ${t('period_monthly')}`}
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
          {t('select_btn')}
        </button>
      </div>
    </section>
  );
};

export default SelectSubscription;
