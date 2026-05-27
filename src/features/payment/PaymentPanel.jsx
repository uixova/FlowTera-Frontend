import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../hooks/useModal';
import { useSubscription } from '../../context/SubscriptionContext';
import Alert from '../../components/overlays/Alert';
import { paymentService } from './services/paymentServices';
import { authService } from '../auth/services/authService';
import './PaymentPanel.css';

const MotionDiv = motion.div;

const PaymentPanel = () => {
    const { t } = useTranslation('subscription.payment');
    const [searchParams] = useSearchParams();
    const { currentUser, login } = useAuth();
    const { plans } = useSubscription();
    const { alertConfig, showAlert, closeAlert } = useModal();

    const planId = searchParams.get('plan');

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
            currentUser?.id || '',
            selectedPlan?.id
        );

        if (result.success) {
            const paidSignup = authService.finalizePaidRegistrationAfterPayment();
            if (paidSignup.success && paidSignup.userDraft?.id) {
                await login(paidSignup.userDraft.id, true);
            } else if (currentUser?.id) {
                await login(currentUser.id);
            }

            showAlert(
                t('success_title'),
                t('success_msg'),
                'success',
                () => { window.location.href = '/home'; }
            );
        } else {
            showAlert(t('error_title'), result.message, 'error');
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
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    >
                        <div className="card-front">
                            <div className="card-top-row">
                                <div className="card-chip" />
                                <i className={`ti ti-brand-${cardData.number.startsWith('4') ? 'visa' : 'mastercard'} card-type-icon`}></i>
                            </div>
                            <div className="card-number-display">{cardData.number || '•••• •••• •••• ••••'}</div>
                            <div className="card-bottom">
                                <div className="card-info-item">
                                    <span className="label">{t('card_holder_label')}</span>
                                    <span className="value">{cardData.name.toUpperCase() || t('card_holder_empty')}</span>
                                </div>
                                <div className="card-info-item">
                                    <span className="label">{t('card_expiry_label')}</span>
                                    <span className="value">{cardData.expiry || t('card_expiry_empty')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-back">
                            <div className="magnetic-strip" />
                            <div className="signature-area">
                                <div className="signature-bar"><span>AUTHORIZED SIGNATURE</span></div>
                                <div className="cvv-box">{cardData.cvv || '•••'}</div>
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
                        <h2>{t('title')}</h2>
                        <div className="plan-info-tag">
                            <span>{selectedPlan?.name}</span>
                            <strong>{selectedPlan?.price} {selectedPlan?.currency}</strong>
                        </div>
                    </div>
                    <p className="secure-text"><i className="ti ti-shield-lock"></i> {t('secure_text')}</p>

                    <form className="payment-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>{t('label_card_number')}</label>
                            <div className="input-wrapper">
                                <i className="ti ti-credit-card"></i>
                                <input type="text" name="number" value={cardData.number} placeholder="0000 0000 0000 0000" required onChange={handleInputChange} onFocus={() => setIsFlipped(false)} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>{t('label_card_name')}</label>
                            <div className="input-wrapper">
                                <i className="ti ti-user"></i>
                                <input type="text" name="name" value={cardData.name} placeholder={t('placeholder_name')} required autoComplete="cc-name" onChange={handleInputChange} onFocus={() => setIsFlipped(false)} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="input-group flex-1">
                                <label>{t('label_expiry')}</label>
                                <input type="text" name="expiry" value={cardData.expiry} placeholder={t('placeholder_expiry')} required onChange={handleInputChange} onFocus={() => setIsFlipped(false)} />
                            </div>
                            <div className="input-group flex-1">
                                <label>{t('label_cvv')}</label>
                                <input type="text" name="cvv" value={cardData.cvv} placeholder="•••" required onChange={handleInputChange} onFocus={() => setIsFlipped(true)} onBlur={() => setIsFlipped(false)} />
                            </div>
                        </div>
                        <div className="terms-checkbox">
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">
                                <a href="#/terms" onClick={(e) => e.preventDefault()}>{t('terms_conditions')}</a>
                                {' '}{t('terms_and')}{' '}
                                <a href="#/sales" onClick={(e) => e.preventDefault()}>{t('terms_sales')}</a>
                                {t('terms_suffix')}
                            </label>
                        </div>
                        <button type="submit" className="pay-btn" disabled={loading}>
                            {loading ? t('loading') : t('submit_btn')}
                        </button>
                    </form>
                </div>
            </div>
            <Alert {...alertConfig} onClose={closeAlert} />
        </MotionDiv>
    );
};

export default PaymentPanel;
