import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../../context/SubscriptionContext';
import './UserPlan.css';

const UserPlan = ({ user }) => {
    const navigate = useNavigate();

    // Merkezi context'ten verileri çekiyoruz
    const { currentPlan, loading } = useSubscription();

    if (loading) return <div className="st-loader">Yükleniyor...</div>;
    if (!user) return null;
    if (!currentPlan) return <div className="st-loader">Plan bilgisi yüklenemedi.</div>;

    // Kullanım verileri
    const currentUsage    = user.subscription?.usage?.ocr || 0;
    // Plandaki limiti JSON'dan çekiyoruz
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
                <h2>Abonelik ve Limitler</h2>
                <p>Mevcut planınızı yönetin ve kullanım detaylarınızı inceleyin.</p>
            </div>

            <div className="plan-management-container">
                {/* Sol Sütun: Mevcut Aktif Plan Bilgisi */}
                <div className="current-plan-card">
                    <span className="plan-active-badge">
                        <i className="ti ti-circle-check" />
                        Aktif Plan
                    </span>

                    <div className="plan-brand">
                        <div className="plan-icon-wrap">
                            <i className={`ti ${currentPlan.icon || 'ti-crown'}`} />
                        </div>
                        <div className="plan-brand-text">
                            <h3>{currentPlan.name.toUpperCase()}</h3>
                            <span className="plan-tier-tag">{currentPlan.badge} Tier</span>
                        </div>
                    </div>

                    <div className="plan-price-row">
                        <span className="plan-price-symbol">$</span>
                        <span className="plan-price-amount">{currentPlan.price}</span>
                        <span className="plan-price-period">/{currentPlan.currency === 'USD' ? 'ay' : 'mo'}</span>
                    </div>

                    <div className="plan-limits">
                        <div className="plan-limit-row">
                            <span className="plan-limit-label">
                                <i className="ti ti-users-group" />
                                Takım Limiti
                            </span>
                            <span className="plan-limit-val">
                                {(currentPlan.promise || currentPlan.Promise)?.teamLimit || '—'}
                            </span>
                        </div>
                        <div className="plan-limit-row">
                            <span className="plan-limit-label">
                                <i className="ti ti-user" />
                                Üye Limiti
                            </span>
                            <span className="plan-limit-val">
                                {(currentPlan.promise || currentPlan.Promise)?.TeamMemberLimit || '—'}
                            </span>
                        </div>
                    </div>

                    <button className="upgrade-btn" onClick={() => navigate('/subscription')}>
                        <i className="ti ti-sparkles" />
                        Planı Yükselt / Değiştir
                        <i className="ti ti-arrow-right" />
                    </button>
                </div>

                {/* Sağ Sütun: Kullanım Barı ve Özellik Listesi */}
                <div className="usage-and-features">
                    {/* OCR Kullanım Barı */}
                    <div className="st-card">
                        <div className="usage-card-inner">
                            <div className="usage-label-row">
                                <span className="usage-label">
                                    <i className="ti ti-scan" />
                                    Aylık OCR Kullanımı
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

                    {/* Dinamik Özellik Listesi (JSON'daki included durumuna göre) */}
                    <div className="st-card">
                        <div className="features-card-inner">
                            <div className="features-card-header">
                                <h4>Plan Özellikleriniz</h4>
                                <span className="features-count-tag">
                                    {includedFeatures.length} aktif
                                </span>
                            </div>

                            <ul className="feature-list">
                                {/* Önce dahil olan (included: true) özellikleri gösteriyoruz */}
                                {includedFeatures.map((feature, idx) => (
                                    <li key={`inc-${idx}`} className="feature-item included">
                                        <i className="ti ti-circle-check" />
                                        {feature.text}
                                    </li>
                                ))}

                                {/* Sonra kilitli (included: false) özellikleri sönük gösteriyoruz */}
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