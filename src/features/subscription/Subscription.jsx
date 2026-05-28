import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../context/SubscriptionContext';
import Loader from '../../components/ui/Loader';
import './Subscription.css';

const MotionDiv = motion.div;

const Subscription = () => {
    const { t } = useTranslation('subscription');
    const { t: tPlan } = useTranslation('settings.plan');
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
                <h1>{t('title')}</h1>
                <p>{t('subtitle')}</p>
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
                            {plan.popular && <div className="popular-badge">{t('popular_badge')}</div>}
                            {isCurrent && <div className="current-badge">{t('current_badge')}</div>}

                            <div className="plan-header">
                                <div className="icon-box">
                                    <i className={`ti ${plan.icon}`}></i>
                                </div>
                                <h2>{tPlan(plan.nameKey || `name_${plan.badge}`, { defaultValue: plan.name })}</h2>
                                <p className="plan-desc">{tPlan(plan.descriptionKey || `desc_${plan.badge}`, { defaultValue: plan.description })}</p>
                                <div className="plan-price">
                                    <span className="amount">
                                        {plan.price === 0
                                            ? t('free_label')
                                            : `${plan.price}${plan.currency === 'USD' ? '$' : plan.currency}`}
                                    </span>
                                    {plan.price > 0 && <span className="period">{t('period_monthly')}</span>}
                                </div>
                            </div>

                            <ul className="feature-list">
                                {plan.features.map((feat, idx) => (
                                    <li key={idx} className={!feat.included ? 'disabled' : ''}>
                                        <i className={`ti ${feat.included ? 'ti-check check' : 'ti-x xmark'}`}></i>
                                        <span className="feature-text">{tPlan(feat.textKey || feat.text, { defaultValue: feat.text })}</span>
                                    </li>
                                ))}
                                <li className="promise-item">
                                    <i className="ti ti-users check"></i>
                                    <span>{t('team_member_info', { teamLimit: plan.Promise?.teamLimit, memberLimit: plan.Promise?.TeamMemberLimit })}</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => handlePlanSelect(plan.id, isCurrent)}
                                className={`plan-btn ${isCurrent ? 'current-btn' : ''}`}
                                disabled={isCurrent}
                            >
                                {isCurrent ? t('in_use') : tPlan(plan.ctaKey || `cta_${plan.badge}`, { defaultValue: plan.cta })}
                            </button>
                        </MotionDiv>
                    );
                })}
            </div>
        </MotionDiv>
    );
};

export default Subscription;
