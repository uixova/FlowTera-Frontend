import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import Loader from '../../components/common/Loader';
import './css/Subscription.css';

const Subscription = () => {
    const { plans, currentPlan, loading } = useSubscription();

    if (loading) return <Loader />;

    return (
        <div className="subscription-container">
            <header className="sub-header">
                <h1>FlowTera Planları</h1>
                <p>İhtiyaçlarınıza en uygun planı seçin, ekibinizi uçuşa geçirin.</p>
            </header>

            <div className="plans-grid">
                {plans.map((plan) => {
                    const isCurrent = plan.id === currentPlan?.id;

                    return (
                        <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrent ? 'active' : ''}`}>
                            {plan.popular && <div className="popular-badge">En Popüler</div>}
                            {isCurrent && <div className="current-badge">Mevcut Planın</div>}

                            <div className="plan-header">
                                <div className="icon-box">
                                    <i className={`ti ${plan.icon}`}></i>
                                </div>
                                <h2>{plan.name}</h2>
                                <p className="plan-desc">{plan.description}</p>
                                <div className="plan-price">
                                    <span className="amount">
                                        {plan.price === 0 ? "Ücretsiz" : `${plan.price}${plan.currency === 'USD' ? '$' : plan.currency}`}
                                    </span>
                                    {plan.price > 0 && <span className="period">/ay</span>}
                                </div>
                            </div>

                            <ul className="feature-list">
                                {plan.features.map((feat, index) => (
                                    <li key={index} className={!feat.included ? 'disabled' : ''}>
                                        <i className={`ti ${feat.included ? 'ti-check check' : 'ti-x xmark'}`}></i>
                                        <span className="feature-text">{feat.text}</span>
                                    </li>
                                ))}
                                {/* Promise kısmını özelliklerin altına vurgulu ekliyoruz */}
                                <li className="promise-item">
                                    <i className="ti ti-users check"></i>
                                    <span>{plan.Promise.teamLimit} / {plan.Promise.TeamMemberLimit}</span>
                                </li>
                            </ul>

                            <button className={`plan-btn ${isCurrent ? 'current-btn' : ''}`}>
                                {isCurrent ? "Kullanılıyor" : plan.cta}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Subscription;