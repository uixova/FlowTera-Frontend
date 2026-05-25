import React, { useState, useRef, useCallback } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import Loader from '../../../components/ui/Loader';
import { expenseService } from '../../expenses/services/expenseService';
import './OCR.css';

const CATEGORIES = [
    { value: 'Food',          label: 'Yiyecek & İçecek'   },
    { value: 'Transport',     label: 'Ulaşım'              },
    { value: 'Accommodation', label: 'Konaklama'           },
    { value: 'Health',        label: 'Sağlık'              },
    { value: 'Entertainment', label: 'Eğlence'             },
    { value: 'Office',        label: 'Ofis Malzemeleri'    },
    { value: 'Education',     label: 'Eğitim'              },
    { value: 'Technology',    label: 'Teknoloji'           },
    { value: 'Shopping',      label: 'Alışveriş'           },
    { value: 'Utilities',     label: 'Faturalar'           },
    { value: 'Finance',       label: 'Finans & Sigorta'    },
    { value: 'Events',        label: 'Etkinlik & Toplantı' },
    { value: 'Marketing',     label: 'Pazarlama & Reklam'  },
    { value: 'Legal',         label: 'Hukuk & Danışmanlık' },
    { value: 'Other',         label: 'Diğer'               },
];

const CURRENCIES = ['USD','EUR','TRY','GBP','JPY','CHF','CAD','AUD','CNY','INR'];

const METHODS = [
    { value: 'Cash',           label: 'Nakit'           },
    { value: 'Credit Card',    label: 'Kredi Kartı'     },
    { value: 'Bank Transfer',  label: 'Banka Transferi' },
    { value: 'Debit Card',     label: 'Banka Kartı'     },
    { value: 'Mobile Payment', label: 'Mobil Ödeme'     },
    { value: 'Check',          label: 'Çek'             },
    { value: 'Other',          label: 'Diğer'           },
];

const EMPTY_FORM = { merchant: '', amount: '', currency: 'USD', date: '', time: '', category: 'Other', paymentMethod: '' };

const OCRSidebar = ({ isOpen, onClose, selectedTeamId, onApply }) => {
    const [preview,      setPreview]      = useState(null);
    const [isPdf,        setIsPdf]        = useState(false);
    const [fileName,     setFileName]     = useState('');
    const [status,       setStatus]       = useState('idle');  // idle | scanning | done
    const [errorMsg,     setErrorMsg]     = useState('');
    const [form,         setForm]         = useState(EMPTY_FORM);
    const [confidence,   setConfidence]   = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMsg,    setSubmitMsg]    = useState('');
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
        if (fileRef.current) fileRef.current.value = '';
    }, []);

    const handleClose = () => { reset(); onClose(); };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const pdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        setIsPdf(pdf);
        setFileName(file.name);
        setPreview(pdf ? null : URL.createObjectURL(file));
        setErrorMsg('');
        setSubmitMsg('');

        if (!selectedTeamId) {
            setErrorMsg('Takım seçili değil. Lütfen önce bir takım seçin.');
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
            setErrorMsg('Fatura analiz edilemedi. Verileri manuel olarak düzenleyin veya farklı bir görsel deneyin.');
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
            const result = await expenseService.createExpense({
                title:         form.merchant || `Fatura - ${form.date || new Date().toLocaleDateString('tr-TR')}`,
                amount:        parseFloat(form.amount) || 0,
                currency:      form.currency,
                date:          form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
                category:      form.category,
                paymentMethod: form.paymentMethod || 'Other',
                teamId:        selectedTeamId,
            });
            if (result.success) {
                handleClose();
            } else {
                setSubmitMsg('Gider oluşturulamadı. Tekrar deneyin.');
            }
        } catch {
            setSubmitMsg('Gider oluşturulamadı. Tekrar deneyin.');
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
                    <i className="ti ti-refresh"></i> Yeniden Tara
                </button>
                {onApply && (
                    <button
                        className="st-btn-save ocr-btn-secondary"
                        style={{ flex: 2 }}
                        onClick={handleApply}
                        disabled={submitLoading}
                    >
                        <i className="ti ti-forms"></i> Forma Aktar
                    </button>
                )}
                <button
                    className="st-btn-save"
                    style={{ flex: 2 }}
                    onClick={handleSubmit}
                    disabled={submitLoading || !form.amount}
                >
                    {submitLoading
                        ? <><i className="ti ti-loader-2"></i> Kaydediliyor...</>
                        : <><i className="ti ti-send"></i> Gönder</>
                    }
                </button>
            </div>
        </div>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={handleClose}
            title={<h2 className="ocr-sidebar-title">Akıllı OCR Tarama</h2>}
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
                            Fişinizi buraya bırakın ya da <span>göz atın</span>
                        </h3>
                        <small className="dropzone-subtitle">JPG, PNG, WEBP veya PDF · Maks 20MB</small>
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
                        <span>Yapay zeka faturayı analiz ediyor...</span>
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
                            Yapay zeka verileri otomatik çıkardı. Lütfen kontrol edin.
                            {confidence != null && confidence > 0 && (
                                <> · Güven: <strong>%{Math.round(confidence * 100)}</strong></>
                            )}
                        </span>
                    </div>
                )}

                {/* Sonuç formu */}
                {status === 'done' && (
                    <div className="ocr-results-form hm-card-style">
                        <div className="st-form-grid">

                            <div className="st-input-group full-width">
                                <label>İşletme / Mağaza</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-building-store input-icon"></i>
                                    <input
                                        type="text"
                                        name="merchant"
                                        value={form.merchant}
                                        onChange={handleChange}
                                        placeholder="Otomatik doldurulamadı — manuel girin"
                                    />
                                </div>
                            </div>

                            <div className="st-input-group">
                                <label>Toplam Tutar</label>
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
                                <label>Para Birimi</label>
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
                                <label>İşlem Tarihi</label>
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
                                <label>İşlem Saati</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-clock input-icon"></i>
                                    <input
                                        type="time"
                                        name="time"
                                        value={form.time}
                                        onChange={handleChange}
                                        placeholder="Saat bulunamadı"
                                    />
                                </div>
                            </div>

                            <div className="st-input-group full-width">
                                <label>Kategori</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-category input-icon"></i>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="st-input-group full-width">
                                <label>Ödeme Şekli</label>
                                <div className="input-wrapper">
                                    <i className="ti ti-credit-card input-icon"></i>
                                    <select
                                        name="paymentMethod"
                                        value={form.paymentMethod}
                                        onChange={handleChange}
                                    >
                                        <option value="">— Tespit edilemedi —</option>
                                        {METHODS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
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
