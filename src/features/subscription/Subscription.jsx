import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';
import Loader from '../../components/ui/Loader';
import './Subscription.css';

const MotionDiv = motion.div;

const Subscription = () => {
    const { plans, currentPlan, loading } = useSubscription();
    const navigate = useNavigate();

    if (loading) return <Loader type="butterfly" />;

    const handlePlanSelect = (planId, isCurrent) => {
        if (isCurrent) return;
        navigate(`/payment?plan=${planId}`, { state: { fromSubscription: true } });
    };

    return (
        <MotionDiv 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="subscription-container"
        >
            <header className="sub-header">
                <h1>FlowTera Planları</h1>
                <p>İhtiyaçlarınıza en uygun planı seçin, ekibinizi uçuşa geçirin.</p>
            </header>

            <div className="plans-grid">
                {plans.map((plan, index) => {
                    const isCurrent = plan.id === currentPlan?.id;

                    return (
                        <MotionDiv
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrent ? 'active' : ''}`}
                        >
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
                                {plan.features.map((feat, idx) => (
                                    <li key={idx} className={!feat.included ? 'disabled' : ''}>
                                        <i className={`ti ${feat.included ? 'ti-check check' : 'ti-x xmark'}`}></i>
                                        <span className="feature-text">{feat.text}</span>
                                    </li>
                                ))}
                                <li className="promise-item">
                                    <i className="ti ti-users check"></i>
                                    <span>{plan.Promise?.teamLimit} Takım / {plan.Promise?.TeamMemberLimit} Üye</span>
                                </li>
                            </ul>

                            <button 
                                onClick={() => handlePlanSelect(plan.id, isCurrent)}
                                className={`plan-btn ${isCurrent ? 'current-btn' : ''}`}
                                disabled={isCurrent}
                            >
                                {isCurrent ? "Kullanılıyor" : plan.cta}
                            </button>
                        </MotionDiv>
                    );
                })}
            </div>
        </MotionDiv>
    );
};

export default Subscription;