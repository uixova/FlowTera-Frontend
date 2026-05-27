import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../../context/SubscriptionContext';
import './UserPlan.css';

const UserPlan = ({ user }) => {
    const { t } = useTranslation('settings.plan');
    const navigate = useNavigate();
    const { currentPlan, loading } = useSubscription();

    if (loading) return <div className="st-loader">{t('loading')}</div>;
    if (!user) return null;
    if (!currentPlan) return <div className="st-loader">{t('load_error')}</div>;

    const currentUsage    = user.subscription?.usage?.ocr || 0;
    const totalLimit      = currentPlan.ocrLimit || 0;
    const usagePercentage = totalLimit > 0
        ? Math.min(Math.round((currentUsage / totalLimit) * 100), 100)
        : 0;

    const fillClass = usagePercentage >= 90 ? 'critical' : usagePercentage >= 75 ? 'warn' : '';

    const includedFeatures = currentPlan.features?.filter(f =>  f.included) || [];
    const lockedFeatures   = currentPlan.features?.filter(f => !f.included) || [];

    return (
        <div className="st-content-section">
            <div className="st-header-box">
                <h2>{t('title')}</h2>
                <p>{t('subtitle')}</p>
            </div>

            <div className="plan-management-container">
                <div className="current-plan-card">
                    <span className="plan-active-badge">
                        <i className="ti ti-circle-check" />
                        {t('active_badge')}
                    </span>

                    <div className="plan-brand">
                        <div className="plan-icon-wrap">
                            <i className={`ti ${currentPlan.icon || 'ti-crown'}`} />
                        </div>
                        <div className="plan-brand-text">
                            <h3>{currentPlan.name.toUpperCase()}</h3>
                            <span className="plan-tier-tag">{currentPlan.badge} {t('tier_label')}</span>
                        </div>
                    </div>

                    <div className="plan-price-row">
                        <span className="plan-price-symbol">$</span>
                        <span className="plan-price-amount">{currentPlan.price}</span>
                        <span className="plan-price-period">/{t('period_monthly')}</span>
                    </div>

                    <div className="plan-limits">
                        <div className="plan-limit-row">
                            <span className="plan-limit-label">
                                <i className="ti ti-users-group" />
                                {t('team_limit_label')}
                            </span>
                            <span className="plan-limit-val">
                                {(currentPlan.promise || currentPlan.Promise)?.teamLimit || '—'}
                            </span>
                        </div>
                        <div className="plan-limit-row">
                            <span className="plan-limit-label">
                                <i className="ti ti-user" />
                                {t('member_limit_label')}
                            </span>
                            <span className="plan-limit-val">
                                {(currentPlan.promise || currentPlan.Promise)?.TeamMemberLimit || '—'}
                            </span>
                        </div>
                    </div>

                    <button className="upgrade-btn" onClick={() => navigate('/subscription')}>
                        <i className="ti ti-sparkles" />
                        {t('upgrade_btn')}
                        <i className="ti ti-arrow-right" />
                    </button>
                </div>

                <div className="usage-and-features">
                    <div className="st-card">
                        <div className="usage-card-inner">
                            <div className="usage-label-row">
                                <span className="usage-label">
                                    <i className="ti ti-scan" />
                                    {t('ocr_usage')}
                                </span>
                                <span className="usage-count">{currentUsage} / {totalLimit || '—'}</span>
                            </div>
                            <div className="usage-bar-track">
                                <div
                                    className={`usage-bar-fill ${fillClass}`}
                                    style={{ width: `${usagePercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="st-card">
                        <div className="features-card-inner">
                            <div className="features-card-header">
                                <h4>{t('features_title')}</h4>
                                <span className="features-count-tag">
                                    {t('features_active', { count: includedFeatures.length })}
                                </span>
                            </div>

                            <ul className="feature-list">
                                {includedFeatures.map((feature, idx) => (
                                    <li key={`inc-${idx}`} className="feature-item included">
                                        <i className="ti ti-circle-check" />
                                        {feature.text}
                                    </li>
                                ))}
                                {lockedFeatures.map((feature, idx) => (
                                    <li key={`lck-${idx}`} className="feature-item locked">
                                        <i className="ti ti-lock" />
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPlan;
