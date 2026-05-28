import i18n from '../../../locales/i18n';
import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import Loader from '../../../components/ui/Loader';
import { expenseService } from '../../expenses/services/expenseService';
import { useI18n } from '../../../utils/i18nHelpers';
import './OCR.css';

// S3'e yükle — promise döner, hata olursa null (fatura kayıt edilir ama görsel olmadan)
async function uploadToS3(file, teamId) {
    try {
        return await expenseService.uploadReceiptFile(file, teamId);
    } catch {
        return null;
    }
}

const CATEGORY_VALUES = [
    'Food', 'Transport', 'Accommodation', 'Health', 'Entertainment',
    'Office', 'Education', 'Technology', 'Shopping', 'Utilities',
    'Finance', 'Events', 'Marketing', 'Legal', 'Other',
];

const CURRENCIES = ['USD','EUR','TRY','GBP','JPY','CHF','CAD','AUD','CNY','INR'];

const METHOD_VALUES = [
    'Cash', 'Credit Card', 'Bank Transfer', 'Debit Card',
    'Mobile Payment', 'Check', 'Other',
];

const EMPTY_FORM = { merchant: '', amount: '', currency: 'USD', date: '', time: '', category: 'Other', paymentMethod: '' };

const OCRSidebar = ({ isOpen, onClose, selectedTeamId, onApply }) => {
    const { t } = useTranslation('expenses.create');
    const { tCategory, tPayment } = useI18n();
    const [preview,      setPreview]      = useState(null);
    const [isPdf,        setIsPdf]        = useState(false);
    const [fileName,     setFileName]     = useState('');
    const [status,       setStatus]       = useState('idle');  // idle | scanning | done
    const [errorMsg,     setErrorMsg]     = useState('');
    const [form,         setForm]         = useState(EMPTY_FORM);
    const [confidence,   setConfidence]   = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMsg,    setSubmitMsg]    = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const fileRef = useRef(null);

    const reset = useCallback(() => {
        setPreview(null);
        setIsPdf(false);
        setFileName('');
        setStatus('idle');
        setErrorMsg('');
        setForm(EMPTY_FORM);
        setConfidence(null);
        setSubmitMsg('');
        setSelectedFile(null);
        if (fileRef.current) fileRef.current.value = '';
    }, []);

    const handleClose = () => { reset(); onClose(); };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const pdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        setIsPdf(pdf);
        setFileName(file.name);
        setSelectedFile(file);
        setPreview(pdf ? null : URL.createObjectURL(file));
        setErrorMsg('');
        setSubmitMsg('');

        if (!selectedTeamId) {
            setErrorMsg(t('ocr_no_team'));
            setStatus('done');
            return;
        }

        try {
            setStatus('scanning');
            const parsed = await expenseService.analyzeReceiptDirect(file);

            setForm({
                merchant:      parsed.merchant || '',
                amount:        parsed.amount != null ? String(parsed.amount) : '',
                currency:      parsed.currency || 'USD',
                date:          parsed.date || new Date().toISOString().split('T')[0],
                time:          parsed.time  || '',
                category:      parsed.category || 'Other',
                paymentMethod: parsed.payment_method || '',
            });
            setConfidence(parsed.confidence ?? null);
            setStatus('done');
        } catch {
            setErrorMsg(t('ocr_error'));
            setForm(EMPTY_FORM);
            setStatus('done');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        if (onApply) {
            onApply({
                merchant:      form.merchant,
                amount:        form.amount,
                currency:      form.currency,
                date:          form.date,
                time:          form.time,
                category:      form.category,
                paymentMethod: form.paymentMethod,
            });
        }
        handleClose();
    };

    const handleSubmit = async () => {
        if (!selectedTeamId || !form.amount) return;
        try {
            setSubmitLoading(true);
            setSubmitMsg('');

            // Fatura görselini S3'e yükle (arka planda, başarısız olsa da devam et)
            const receiptKey = selectedFile ? await uploadToS3(selectedFile, selectedTeamId) : null;

            const titleVal    = form.merchant || `${t('invoice_prefix')} - ${form.date || new Date().toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}`;
            const merchantVal = form.merchant || titleVal;
            const result = await expenseService.createExpense({
                title:         titleVal,
                merchant:      merchantVal,
                amount:        parseFloat(form.amount) || 0,
                currency:      form.currency,
                date:          form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
                category:      form.category,
                paymentMethod: form.paymentMethod || 'Other',
                receipt:       receiptKey,   // S3 key — null ise DB'de null kalır
                teamId:        selectedTeamId,
            });
            if (result.success) {
                handleClose();
            } else {
                setSubmitMsg(t('ocr_create_fail'));
            }
        } catch {
            setSubmitMsg(t('ocr_create_fail'));
        } finally {
            setSubmitLoading(false);
        }
    };

    const footer = status === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {submitMsg && <span style={{ color: 'var(--color-danger, #e55)', fontSize: '13px', textAlign: 'center' }}>{submitMsg}</span>}
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                    className="st-btn-save ocr-btn-secondary"
                    style={{ flex: 1 }}
                    onClick={reset}
                    disabled={submitLoading}
                >
                    <i className="ti ti-refresh"></i> {t('rescan', { ns: 'common.buttons' })}
                </button>
                {onApply && (
                    <button
                        className="st-btn-save ocr-btn-secondary"
                        style={{ flex: 2 }}
                        onClick={handleApply}
                        disabled={submitLoading}
                    >
                        <i className="ti ti-forms"></i> {t('forward_form', { ns: 'common.buttons' })}
                    </button>
                )}
                <button
                    className="st-btn-save"
                    style={{ flex: 2 }}
                    onClick={handleSubmit}
                    disabled={submitLoading || !form.amount}
                >
                    {submitLoading
                        ? <><i className="ti ti-loader-2"></i> {t('saving', { ns: 'common.buttons' })}</>
                        : <><i className="ti ti-send"></i> {t('submit', { ns: 'common.buttons' })}</>
                    }
                </button>
            </div>
        </div>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={handleClose}
            title={<h2 className="ocr-sidebar-title">{t('ocr_title')}</h2>}
            footer={footer}
            width="520px"
            preventOverlayClose={true}
        >
            <div className="ocr-wrapper">

                {/* Hidden file input lives outside conditionals so ref never unmounts */}
                <input
                    ref={fileRef}
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp,.pdf"
                    onChange={handleFileChange}
                />

                {/* Görsel yükleme alanı */}
                {status === 'idle' && (
                    <div
                        className="ocr-dropzone hm-card-style"
                        onClick={() => fileRef.current?.click()}
                    >
                        <i className="ti ti-cloud-upload"></i>
                        <h3 className="dropzone-title">
                            {t('ocr_drop_title')} <span>{t('ocr_drop_browse')}</span>
                        </h3>
                        <small className="dropzone-subtitle">{t('ocr_drop_hint')}</small>
                    </div>
                )}

                {/* File preview — image rendered as img, PDF shown as icon placeholder */}
                {(preview || isPdf) && status !== 'idle' && (
                    <div className="ocr-preview-container hm-card-style">
                        {isPdf ? (
                            <div className="ocr-pdf-placeholder">
                                <i className="ti ti-file-type-pdf"></i>
                                <span>{fileName}</span>
                            </div>
                        ) : (
                            <img src={preview} alt="Fatura Önizleme" draggable={false} />
                        )}
                    </div>
                )}

                {/* Taranıyor */}
                {status === 'scanning' && (
                    <div className="ocr-scanning-state hm-card-style">
                        <Loader type="dots" />
                        <span>{t('ocr_scanning')}</span>
                    </div>
                )}

                {/* Hata banner */}
                {errorMsg && status === 'done' && (
                    <div className="ocr-info-banner hm-card-style" style={{ borderLeftColor: 'var(--color-danger, #e55)' }}>
                        <div className="ocr-banner-icon"><i className="ti ti-alert-triangle"></i></div>
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Başarı banner */}
                {status === 'done' && !errorMsg && (
                    <div className="ocr-info-banner hm-card-style">
                        <div className="ocr-banner-icon"><i className="ti ti-sparkles"></i></div>
                        <span>
                            {t('ocr_success')}
                            {confidence != null && confidence > 0 && (
                                <> · {t('ocr_confidence')}: <strong>%{Math.round(confidence * 100)}</strong></>
                            )}
                        </span>
                    </div>
                )}

                {/* Sonuç formu */}
                {status === 'done' && (
                    <div className="ocr-results-form hm-card-style">
                        <div className="st-form-grid">

                            <div className="st-input-group full-width">
                                <label>{t('ocr_merchant')}</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-building-store input-icon"></i>
                                    <input
                                        type="text"
                                        name="merchant"
                                        value={form.merchant}
                                        onChange={handleChange}
                                        placeholder={t('ocr_merchant_ph')}
                                    />
                                </div>
                            </div>

                            <div className="st-input-group">
                                <label>{t('ocr_amount')}</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-receipt-2 input-icon"></i>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={form.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="st-input-group">
                                <label>{t('ocr_currency')}</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-currency-dollar input-icon"></i>
                                    <select
                                        name="currency"
                                        value={form.currency}
                                        onChange={handleChange}
                                    >
                                        {CURRENCIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="st-input-group">
                                <label>{t('ocr_date')}</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-calendar input-icon"></i>
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="st-input-group">
                                <label>{t('ocr_time')}</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-clock input-icon"></i>
                                    <input
                                        type="time"
                                        name="time"
                                        value={form.time}
                                        onChange={handleChange}
                                        placeholder={t('ocr_time_ph')}
                                    />
                                </div>
                            </div>

                            <div className="st-input-group full-width">
                                <label>{t('ocr_category')}</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-category input-icon"></i>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                    >
                                        {CATEGORY_VALUES.map(val => (
                                            <option key={val} value={val}>{tCategory(val)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="st-input-group full-width">
                                <label>{t('ocr_method')}</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-credit-card input-icon"></i>
                                    <select
                                        name="paymentMethod"
                                        value={form.paymentMethod}
                                        onChange={handleChange}
                                    >
                                        <option value="">{t('ocr_method_none')}</option>
                                        {METHOD_VALUES.map(val => (
                                            <option key={val} value={val}>{tPayment(val)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </ActionSidebar>
    );
};

export default OCRSidebar;
