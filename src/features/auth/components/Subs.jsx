import React from 'react';
import { useTranslation } from 'react-i18next';
import planData from '../../../data/plan.json';

const Subs = () => {
  const { t } = useTranslation('auth.subscription');
  const { t: tPlan } = useTranslation('settings.plan');
  const plans = [...planData].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="pricing-grid">
      {plans.length > 0 ? (
        plans.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'highlighted' : ''}`}>
            {plan.popular && <div className="pricing-badge">{t('popular_badge')}</div>}
            
            <div className="pricing-icon">
              <i className={`ti ${plan.icon}`}></i>
            </div>
            
            <div className="pricing-plan">{tPlan(plan.nameKey || plan.badge, { defaultValue: plan.name })}</div>
            <p className="pricing-desc" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {plan.description}
            </p>

            <div className="pricing-price">
              <span className="price-currency">{plan.currency === 'USD' ? '$' : '₺'}</span>
              <span className="price-amount">{plan.price}</span>
              <span className="price-period">{t('period_monthly')}</span>
            </div>

            <ul className="pricing-features">
              {plan.features.map((f, i) => (
                <li key={i} className={!f.included ? 'feature-disabled' : ''} style={{ opacity: f.included ? 1 : 0.4 }}>
                  <i className={`ti ${f.included ? 'ti-check' : 'ti-x'}`}></i>
                  {f.textKey ? tPlan(f.textKey, { defaultValue: f.text }) : f.text}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>{t('no_plans')}</p>
      )}
    </div>
  );
};

export default Subs;