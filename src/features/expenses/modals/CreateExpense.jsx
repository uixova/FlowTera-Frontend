import React, { useState, useEffect, useRef } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { useTeam } from '../../../context/TeamContext';
import { expenseService } from '../services/expenseService';
import './CreateExpense.css';

const CATEGORIES = [
    { value: 'Food',          label: 'Yiyecek & İçecek'  },
    { value: 'Transport',     label: 'Ulaşım'             },
    { value: 'Accommodation', label: 'Konaklama'          },
    { value: 'Health',        label: 'Sağlık'             },
    { value: 'Entertainment', label: 'Eğlence'            },
    { value: 'Office',        label: 'Ofis Malzemeleri'   },
    { value: 'Education',     label: 'Eğitim'             },
    { value: 'Technology',    label: 'Teknoloji'          },
    { value: 'Shopping',      label: 'Alışveriş'          },
    { value: 'Utilities',     label: 'Faturalar'          },
    { value: 'Finance',       label: 'Finans & Sigorta'   },
    { value: 'Events',        label: 'Etkinlik & Toplantı'},
    { value: 'Marketing',     label: 'Pazarlama & Reklam' },
    { value: 'Legal',         label: 'Hukuk & Danışmanlık'},
    { value: 'Other',         label: 'Diğer'              },
];

const METHODS = [
    { value: 'Cash',           label: 'Nakit'           },
    { value: 'Credit Card',    label: 'Kredi Kartı'     },
    { value: 'Bank Transfer',  label: 'Banka Transferi' },
    { value: 'Debit Card',     label: 'Banka Kartı'     },
    { value: 'Mobile Payment', label: 'Mobil Ödeme'     },
    { value: 'Check',          label: 'Çek'             },
    { value: 'Other',          label: 'Diğer'           },
];

const CURRENCIES = [
    { value: 'USD', label: 'USD  $' },
    { value: 'EUR', label: 'EUR  €' },
    { value: 'TRY', label: 'TRY  ₺' },
    { value: 'GBP', label: 'GBP  £' },
];

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', TRY: '₺', GBP: '£' };

const CreateExpense = ({ isOpen, onClose, editData, onSuccess, onDelete, prefill }) => {
    const isEdit = !!editData;

    const { selectedTeamId } = useTeam();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl,   setPreviewUrl]   = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const currencyRef = useRef(null);

    const [form, setForm] = useState({
        title: '',
        category: 'Food',
        merchant: '',
        paymentMethod: 'Cash',
        amount: '',
        currency: 'USD',
        date: '',
        time: '',
        isReported: true,
    });

    // Form reset / fill on open
    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && editData) {
            setForm({
                title:         editData.title         || '',
                category:      editData.category      || 'Food',
                merchant:      editData.merchant      || '',
                paymentMethod: editData.paymentMethod || 'Cash',
                amount:        editData.amount        || '',
                currency:      editData.currency      || 'USD',
                date:          editData.date          || '',
                isReported:    editData.isReported    ?? true,
            });
            setPreviewUrl(editData.receipt || null);
        } else if (prefill) {
            setForm({
                title:         prefill.merchant       || '',
                category:      prefill.category       || 'Food',
                merchant:      prefill.merchant       || '',
                paymentMethod: prefill.paymentMethod  || 'Cash',
                amount:        prefill.amount         || '',
                currency:      prefill.currency       || 'USD',
                date:          prefill.date           || '',
                time:          prefill.time           || '',
                isReported:    true,
            });
            setPreviewUrl(null);
        } else {
            setForm({ title: '', category: 'Food', merchant: '', paymentMethod: 'Cash', amount: '', currency: 'USD', date: '', time: '', isReported: true });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
        setCurrencyOpen(false);
    }, [isOpen, isEdit, editData, prefill]);

    // Dışarı tıklayınca currency popup'ı kapat
    useEffect(() => {
        if (!currencyOpen) return;
        const handler = (e) => {
            if (currencyRef.current && !currencyRef.current.contains(e.target)) {
                setCurrencyOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [currencyOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let receiptKey = isEdit ? (editData.receipt || null) : null;
            if (selectedFile) {
                receiptKey = await expenseService.uploadReceiptFile(selectedFile, selectedTeamId);
            }

            const now = new Date();
            // Capture live exchange rates at creation time for historical accuracy
            let exchangeRates = { USD: 1 };
            try {
                const raw = localStorage.getItem('tm_saved_rates');
                if (raw) exchangeRates = JSON.parse(raw);
            } catch { /* use default */ }

            // edit → keep DB date | prefill → combine OCR date + time | else → now
            let resolvedDate;
            if (isEdit) {
                resolvedDate = editData.date;
            } else if (form.date) {
                const timeStr = form.time ? `T${form.time}:00` : 'T00:00:00';
                resolvedDate  = new Date(`${form.date}${timeStr}`).toISOString();
            } else {
                resolvedDate = now.toISOString();
            }

            const payload = {
                ...form,
                teamId:         selectedTeamId,
                currencySymbol: CURRENCY_SYMBOLS[form.currency] || form.currency,
                exchangeRates,
                status:         isEdit ? editData.status : 'pending',
                date:           resolvedDate,
                desc:           isEdit ? editData.desc   : '',
                icon:           isEdit ? editData.icon   : 'ti-receipt',
                receipt:        receiptKey,
            };

            if (isEdit) {
                await expenseService.updateExpense(editData.id, payload);
            } else {
                await expenseService.createExpense(payload);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch {
            console.error('İşlem başarısız:');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCurrencySymbol = CURRENCY_SYMBOLS[form.currency] || '';

    const displayDate = isEdit
        ? new Date(editData.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
        : form.date
            ? new Date(form.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
            : new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    const sidebarTitle = (
        <div className="ex-panel-title">
            <div className="ex-panel-title-icon">
                <i className={`ti ${isEdit ? 'ti-edit' : 'ti-plus'}`} />
            </div>
            <span className="ex-panel-title-text">
                {isEdit ? 'Gideri Güncelle' : 'Yeni Harcama Ekle'}
            </span>
        </div>
    );

    const sidebarFooter = (
        <div className="ex-panel-footer-alt">
            {isEdit && onDelete && (
                <button
                    type="button"
                    className="ex-panel-btn delete"
                    onClick={onDelete}
                    disabled={isSubmitting}
                >
                    <i className="ti ti-trash" />
                    Sil
                </button>
            )}
            <button
                type="button"
                className="ex-panel-btn cancel"
                onClick={onClose}
                disabled={isSubmitting}
            >
                <i className="ti ti-x" />
                İptal
            </button>
            <button
                type="submit"
                form="newExpenseForm"
                className="ex-panel-btn save"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <><i className="ti ti-loader-2 ex-spin" /> Kaydediliyor...</>
                ) : (
                    <><i className={`ti ${isEdit ? 'ti-device-floppy' : 'ti-check'}`} /> {isEdit ? 'Değişiklikleri Kaydet' : 'Gider Oluştur'}</>
                )}
            </button>
        </div>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={sidebarTitle}
            footer={sidebarFooter}
            width="460px"
        >
            <div className="ex-panel-body-internal">

                <div className="ex-modal-info-bar">
                    <div className="info-item">
                        <i className="ti ti-calendar-event" />
                        <span>{displayDate}</span>
                    </div>
                    <div className="info-item">
                        <i className="ti ti-shield-check" />
                        <span>{isEdit ? editData.status : 'Beklemede'}</span>
                    </div>
                </div>

                <form id="newExpenseForm" onSubmit={handleSubmit} className="ex-panel-form">

                    <div className="ex-input-group">
                        <label>Detay / Başlık</label>
                        <input
                            className="ex-field-input"
                            name="title"
                            type="text"
                            placeholder="Sunucu bakımı, müşteri yemeği..."
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="ex-input-row">
                        <div className="ex-input-group">
                            <label>Kategori</label>
                            <select
                                className="ex-field-input"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Kategori seç</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="ex-input-group">
                            <label>İşletme</label>
                            <input
                                className="ex-field-input"
                                name="merchant"
                                type="text"
                                placeholder="Amazon, Starbucks..."
                                value={form.merchant}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="ex-input-group">
                        <label>Ödeme Yöntemi</label>
                        <select
                            className="ex-field-input"
                            name="paymentMethod"
                            value={form.paymentMethod}
                            onChange={handleChange}
                        >
                            <option value="" disabled>Yöntem seç</option>
                            {METHODS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="ex-input-group">
                        <label>Miktar ve Para Birimi</label>

                        <div className="ex-amount-wrapper">
                            <input
                                className="ex-amount-input"
                                name="amount"
                                type="number"
                                placeholder={`${selectedCurrencySymbol} 0.00`}
                                step="0.01"
                                value={form.amount}
                                onChange={handleChange}
                                required
                            />

                            <div className="ex-currency-wrap">
                                <select
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                    className="ex-currency-select"
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>

                                <i className="ti ti-chevron-down ex-currency-arrow" />
                            </div>
                        </div>
                    </div>

                    <div className="ex-input-group">
                        <label>Fatura / Belge</label>
                        <div
                            className="ex-upload-zone"
                            onClick={() => document.getElementById('exInpReceipt').click()}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Fatura" className="ex-upload-preview" />
                            ) : (
                                <>
                                    <i className="ti ti-file-upload ex-upload-icon" />
                                    <span className="ex-upload-text">
                                        {isEdit && editData?.receipt ? 'Dosyayı Değiştir' : 'Fatura ekle veya sürükle'}
                                    </span>
                                    <span className="ex-upload-hint">PDF, JPG, PNG · Maks 5MB</span>
                                </>
                            )}
                            <input
                                type="file"
                                id="exInpReceipt"
                                hidden
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="ex-toggle-row">
                        <div className="ex-toggle-text">
                            <span className="ex-toggle-title">Aylık rapora eklensin mi?</span>
                            <span className="ex-toggle-sub">Aktif edilirse bu gider raporlara yansır</span>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                name="isReported"
                                checked={form.isReported}
                                onChange={handleChange}
                            />
                            <span className="slider round" />
                        </label>
                    </div>

                </form>
            </div>
        </ActionSidebar>
    );
};

export default CreateExpense;