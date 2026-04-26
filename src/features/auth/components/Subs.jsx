import React, { useEffect, useState } from 'react';

const Subs = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/plan.json')
      .then((res) => res.json())
      .then((data) => {
        setPlans(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Planlar yüklenirken patladık amk:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading-spinner">Planlar Yükleniyor...</div>;
  }

  return (
    <div className="pricing-grid">
      {plans.length > 0 ? (
        plans.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'highlighted' : ''}`}>
            {plan.popular && <div className="pricing-badge">Popüler</div>}
            
            <div className="pricing-icon">
              <i className={`ti ${plan.icon}`}></i>
            </div>
            
            <div className="pricing-plan">{plan.name}</div>
            <p className="pricing-desc" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {plan.description}
            </p>

            <div className="pricing-price">
              <span className="price-currency">{plan.currency === 'USD' ? '$' : '₺'}</span>
              <span className="price-amount">{plan.price}</span>
              <span className="price-period">/ay</span>
            </div>

            <ul className="pricing-features">
              {plan.features.map((f, i) => (
                <li key={i} className={!f.included ? 'feature-disabled' : ''} style={{ opacity: f.included ? 1 : 0.4 }}>
                  <i className={`ti ${f.included ? 'ti-check' : 'ti-x'}`}></i> 
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>Görüntülenecek plan bulunamadı.</p>
      )}
    </div>
  );
};

export default Subs;