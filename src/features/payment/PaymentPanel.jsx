import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; 
import { useModal } from '../../hooks/useModal'; 
import { useSubscription } from '../../context/SubscriptionContext'; 
import Alert from '../../components/modals/Alert'; 
import { paymentService } from './services/paymentServices'; 
import './css/PaymentPanel.css';

const MotionDiv = motion.div;

const PaymentPanel = () => {
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const { plans } = useSubscription();
    const { alertConfig, showAlert, closeAlert } = useModal(); 
    
    // URL'den gelen plan ID'sini yakalıyoruz
    const planId = searchParams.get('plan'); 
    
    // Planları eşleştiriyoruz, bulamazsak fallback olarak ilk planı alıyoruz
    const selectedPlan = useMemo(() => {
        return plans.find(p => p.id === planId) || plans[0];
    }, [plans, planId]);

    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        const nativeEvent = e.nativeEvent;

        if (name === 'number') {
            value = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
        } else if (name === 'expiry') {
            value = value.replace(/\D/g, '');
            if (nativeEvent.inputType === 'deleteContentBackward' && value.length === 2) {
                value = value.slice(0, 2);
            } else if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
        } else if (name === 'cvv') {
            value = value.replace(/\D/g, '').slice(0, 3);
        } else if (name === 'name') {
            value = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '').toUpperCase().slice(0, 26);
        }

        setCardData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const result = await paymentService.processPayment(
            cardData, 
            currentUser?.uid || 'guest', 
            selectedPlan?.id
        );

        if (result.success) {
            // Başarılı olduğunda uyarıyı göster ve kullanıcı OK dediğinde sekmeyi kapat
            showAlert(
                "Başarılı", 
                "Paketiniz aktif edildi! Ana sayfanıza dönmek için bu sekmeyi kapatabilirsiniz.", 
                "success", 
                () => window.close()
            );
        } else {
            showAlert("Hata", result.message, "error");
        }
        setLoading(false);
    };

    return (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="payment-page">
            <div className="bg-blur" />
            <div className="payment-container">
                <div className="card-visual-section">
                    <MotionDiv
                        className="credit-card-wrapper"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <div className="card-front">
                            <div className="card-top-row">
                                <div className="card-chip" />
                                <i className={`ti ti-brand-${cardData.number.startsWith('4') ? 'visa' : 'mastercard'} card-type-icon`}></i>
                            </div>
                            <div className="card-number-display">{cardData.number || "•••• •••• •••• ••••"}</div>
                            <div className="card-bottom">
                                <div className="card-info-item">
                                    <span className="label">KART SAHİBİ</span>
                                    <span className="value">{cardData.name.toUpperCase() || "AD SOYAD"}</span>
                                </div>
                                <div className="card-info-item">
                                    <span className="label">S.K.T</span>
                                    <span className="value">{cardData.expiry || "MM/YY"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-back">
                            <div className="magnetic-strip" />
                            <div className="signature-area">
                                <div className="signature-bar"><span>AUTHORIZED SIGNATURE</span></div>
                                <div className="cvv-box">{cardData.cvv || "•••"}</div>
                            </div>
                            <div className="card-back-footer">
                                <div className="tiny-line" />
                                <div className="tiny-line short" />
                            </div>
                        </div>
                    </MotionDiv>
                </div>

                <div className="payment-form-section">
                    <div className="form-header">
                        <h2>Güvenli Ödeme</h2>
                        <div className="plan-info-tag">
                            <span>{selectedPlan?.name}</span>
                            <strong>{selectedPlan?.price} {selectedPlan?.currency}</strong>
                        </div>
                    </div>
                    <p className="secure-text"><i className="ti ti-shield-lock"></i> 256-bit SSL Güvenli Altyapı</p>

                    <form className="payment-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Kart Numarası</label>
                            <div className="input-wrapper">
                                <i className="ti ti-credit-card"></i>
                                <input type="text" name="number" value={cardData.number} placeholder="0000 0000 0000 0000" required onChange={handleInputChange} onFocus={() => setIsFlipped(false)} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Kart Üzerindeki İsim</label>
                            <div className="input-wrapper">
                                <i className="ti ti-user"></i>
                                <input type="text" name="name" value={cardData.name} placeholder="AD SOYAD" required autoComplete="cc-name" onChange={handleInputChange} onFocus={() => setIsFlipped(false)} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-group flex-1">
                                <label>Son Kullanma</label>
                                <input type="text" name="expiry" value={cardData.expiry} placeholder="AA/YY" required onChange={handleInputChange} onFocus={() => setIsFlipped(false)} />
                            </div>
                            <div className="input-group flex-1">
                                <label>CVV</label>
                                <input type="text" name="cvv" value={cardData.cvv} placeholder="•••" required onChange={handleInputChange} onFocus={() => setIsFlipped(true)} onBlur={() => setIsFlipped(false)} />
                            </div>
                        </div>
                        <div className="terms-checkbox">
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">
                                <a href="#/terms" onClick={(e) => e.preventDefault()}>Kullanım Koşulları</a> ve 
                                <a href="#/sales" onClick={(e) => e.preventDefault()}> Mesafeli Satış Sözleşmesi</a>'ni 
                                okudum, onaylıyorum.
                            </label>
                        </div>
                        <button type="submit" className="pay-btn" disabled={loading}>{loading ? "İşleniyor..." : "Ödemeyi Tamamla"}</button>
                    </form>
                </div>
            </div>
            <Alert {...alertConfig} onClose={closeAlert} />
        </MotionDiv>
    );
};

export default PaymentPanel;