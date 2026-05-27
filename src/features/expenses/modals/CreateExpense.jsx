import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { useTeam } from '../../../context/TeamContext';
import { expenseService } from '../services/expenseService';
import { useI18n } from '../../../utils/i18nHelpers';
import './CreateExpense.css';

const CATEGORY_VALUES = [
    'Food', 'Transport', 'Accommodation', 'Health', 'Entertainment',
    'Office', 'Education', 'Technology', 'Shopping', 'Utilities',
    'Finance', 'Events', 'Marketing', 'Legal', 'Other',
];

const METHOD_VALUES = [
    'Cash', 'Credit Card', 'Bank Transfer', 'Debit Card',
    'Mobile Payment', 'Check', 'Other',
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

    const { t, i18n } = useTranslation('expenses.create');
    const { tCategory, tPayment } = useI18n();
    const { selectedTeamId } = useTeam();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl,   setPreviewUrl]   = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError,  setSubmitError]  = useState('');
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
        setSubmitError('');
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
        setSubmitError('');
        try {
            let receiptKey = isEdit ? (editData.receipt || null) : null;
            if (selectedFile) {
                try {
                    receiptKey = await expenseService.uploadReceiptFile(selectedFile, selectedTeamId);
                } catch (uploadErr) {
                    console.error('[CreateExpense] S3 upload hatası:', uploadErr);
                    setSubmitError(t('error_upload'));
                    setIsSubmitting(false);
                    return;
                }
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
        } catch (err) {
            console.error('[CreateExpense] İşlem başarısız:', err);
            setSubmitError(t('error_save'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCurrencySymbol = CURRENCY_SYMBOLS[form.currency] || '';

    const dateLocale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    const displayDate = isEdit
        ? new Date(editData.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })
        : form.date
            ? new Date(form.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })
            : new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });

    const sidebarTitle = (
        <div className="ex-panel-title">
            <div className="ex-panel-title-icon">
                <i className={`ti ${isEdit ? 'ti-edit' : 'ti-plus'}`} />
            </div>
            <span className="ex-panel-title-text">
                {isEdit ? t('title_edit') : t('title_new')}
            </span>
        </div>
    );

    const sidebarFooter = (
        <div className="ex-panel-footer-alt">
            {submitError && (
                <div className="ex-submit-error">
                    <i className="ti ti-alert-circle" />
                    <span>{submitError}</span>
                </div>
            )}
            {isEdit && onDelete && (
                <button
                    type="button"
                    className="ex-panel-btn delete"
                    onClick={onDelete}
                    disabled={isSubmitting}
                >
                    <i className="ti ti-trash" />
                    {t('delete', { ns: 'common.buttons' })}
                </button>
            )}
            <button
                type="button"
                className="ex-panel-btn cancel"
                onClick={onClose}
                disabled={isSubmitting}
            >
                <i className="ti ti-x" />
                {t('cancel', { ns: 'common.buttons' })}
            </button>
            <button
                type="submit"
                form="newExpenseForm"
                className="ex-panel-btn save"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <><i className="ti ti-loader-2 ex-spin" /> {t('saving', { ns: 'common.buttons' })}</>
                ) : (
                    <><i className={`ti ${isEdit ? 'ti-device-floppy' : 'ti-check'}`} /> {isEdit ? t('save_changes', { ns: 'common.buttons' }) : t('create_expense', { ns: 'common.buttons' })}</>
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
                        <span>{isEdit ? editData.status : t('status_pending')}</span>
                    </div>
                </div>

                <form id="newExpenseForm" onSubmit={handleSubmit} className="ex-panel-form">

                    <div className="ex-input-group">
                        <label>{t('title', { ns: 'common.forms' })}</label>
                        <input
                            className="ex-field-input"
                            name="title"
                            type="text"
                            placeholder={t('placeholder_title', { ns: 'common.forms' })}
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="ex-input-row">
                        <div className="ex-input-group">
                            <label>{t('category', { ns: 'common.forms' })}</label>
                            <select
                                className="ex-field-input"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                <option value="" disabled>{t('select_category', { ns: 'common.forms' })}</option>
                                {CATEGORY_VALUES.map(val => (
                                    <option key={val} value={val}>{tCategory(val)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="ex-input-group">
                            <label>{t('merchant', { ns: 'common.forms' })}</label>
                            <input
                                className="ex-field-input"
                                name="merchant"
                                type="text"
                                placeholder={t('placeholder_merchant', { ns: 'common.forms' })}
                                value={form.merchant}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="ex-input-group">
                        <label>{t('payment_method', { ns: 'common.forms' })}</label>
                        <select
                            className="ex-field-input"
                            name="paymentMethod"
                            value={form.paymentMethod}
                            onChange={handleChange}
                        >
                            <option value="" disabled>{t('select_method', { ns: 'common.forms' })}</option>
                            {METHOD_VALUES.map(val => (
                                <option key={val} value={val}>{tPayment(val)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="ex-input-group">
                        <label>{t('amount_currency')}</label>

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
                        <label>{t('receipt_label')}</label>
                        <div
                            className="ex-upload-zone"
                            onClick={() => document.getElementById('exInpReceipt').click()}
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt={t('receipt_label')} className="ex-upload-preview" />
                            ) : (
                                <>
                                    <i className="ti ti-file-upload ex-upload-icon" />
                                    <span className="ex-upload-text">
                                        {isEdit && editData?.receipt ? t('receipt_change') : t('receipt_add')}
                                    </span>
                                    <span className="ex-upload-hint">{t('receipt_hint')}</span>
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
                            <span className="ex-toggle-title">{t('report_toggle')}</span>
                            <span className="ex-toggle-sub">{t('report_toggle_sub')}</span>
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