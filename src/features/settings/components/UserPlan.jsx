import React from 'react';
import { useSubscription } from '../../../context/SubscriptionContext'; 
import './UserPlan.css';

const UserPlan = ({ user }) => {
    // Merkezi context'ten verileri çekiyoruz
    const { currentPlan, loading } = useSubscription();

    if (loading) return <div className="loading-placeholder">Yükleniyor...</div>;
    if (!user || !currentPlan) return null;

    // Kullanım verileri 
    const currentUsage = user.subscription?.usage?.ocr || 0;
    // Plandaki limiti JSON'dan çekiyoruz 
    const totalLimit = currentPlan.ocrLimit || 0;
    const usagePercentage = totalLimit > 0 
        ? Math.min(Math.round((currentUsage / totalLimit) * 100), 100) 
        : 0;

    return (
        <div className="st-content-section">
            <div className="st-header-box">
                <h2>Abonelik ve Limitler</h2>
                <p>Mevcut planınızı yönetin ve kullanım detaylarınızı inceleyin.</p>
            </div>

            <div className="plan-management-container">
                {/* Sol Sütun: Mevcut Aktif Plan Bilgisi */}
                <div className="st-card current-plan-status">
                    <div className="plan-badge">AKTİF PLAN</div>
                    
                    <div className="plan-main-info">
                        <div className="plan-brand">
                            <i className={`ti ${currentPlan.icon || 'ti-crown'} plan-icon`}></i>
                            <div>
                                <h3>{currentPlan.name.toUpperCase()}</h3>
                                <span className="plan-tier-label">{currentPlan.badge} Tier</span>
                            </div>
                        </div>
                        <div className="plan-price-tag">
                            ${currentPlan.price}<span>/{currentPlan.currency === 'USD' ? 'ay' : 'mo'}</span>
                        </div>
                    </div>
                    
                    <p className="billing-notice">
                        {currentPlan.description} <br/>
                        Şu anki limitiniz: <strong>{currentPlan.Promise?.teamLimit}</strong> ve <strong>{currentPlan.Promise?.TeamMemberLimit}</strong>.
                    </p>

                    <div className="plan-action-group">
                         <button className="upgrade-redirect-btn" onClick={() => window.location.href = '/subscription'}>
                            Planı Yükselt / Değiştir <i className="ti ti-arrow-right"></i>
                         </button>
                    </div>
                </div>

                {/* Sağ Sütun: Kullanım Barı ve Özellik Listesi */}
                <div className="usage-and-features">
                    {/* OCR Kullanım Barı */}
                    <div className="st-card usage-card">
                         <div className="progress-header">
                            <span><i className="ti ti-scan"></i> Aylık OCR Kullanımı</span>
                            <span>{currentUsage} / {totalLimit}</span>
                         </div>
                         <div className="progress-bar">
                            <div 
                                className={`progress-fill ${usagePercentage > 85 ? 'warning' : ''}`} 
                                style={{width: `${usagePercentage}%`}}
                            ></div>
                         </div>
                    </div>

                    {/* Dinamik Özellik Listesi (JSON'daki included durumuna göre) */}
                    <div className="st-card features-list-card">
                        <h4>Plan Özellikleriniz</h4>
                        <ul className="active-feature-items">
                            {/* Önce dahil olan (included: true) özellikleri gösteriyoruz */}
                            {currentPlan.features?.filter(f => f.included).map((feature, index) => (
                                <li key={`active-${index}`}>
                                    <i className="ti ti-circle-check"></i> {feature.text}
                                </li>
                            ))}
                            
                            {/* Sonra kilitli (included false) özellikleri sönük gösteriyoruz */}
                            {currentPlan.features?.filter(f => !f.included).map((feature, index) => (
                                <li key={`locked-${index}`} className="locked-feature">
                                    <i className="ti ti-lock"></i> {feature.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPlan;