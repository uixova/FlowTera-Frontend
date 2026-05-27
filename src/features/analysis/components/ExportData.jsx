import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ExportData.css';
import { restFetch } from '../../../api/api';
import { isDemoMode } from '../../../utils/demo';

const ExportModal = ({ isOpen, onClose, teamId, teamName }) => {
    const { t } = useTranslation('analysis.export');
    const [format, setFormat] = useState('csv');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleDownload = async () => {
        if (isDemoMode()) { setError(t('err_demo')); return; }
        if (!teamId) { setError(t('err_no_team')); return; }
        setLoading(true);
        setError('');
        try {
            const result = await restFetch(`/expenses?teamId=${teamId}&pageSize=500`);
            const expenses = result?.data ?? [];
            if (!expenses.length) { setError(t('err_no_data')); return; }

            const headers = [
                t('col_date'), t('col_title'), t('col_category'),
                t('col_merchant'), t('col_payment'), t('col_amount'),
                t('col_currency'), t('col_status'), t('col_creator'),
            ];
            const rows = expenses.map((e) => [
                new Date(e.date).toLocaleDateString('tr-TR'),
                `"${(e.title         || '').replace(/"/g, '""')}"`,
                `"${(e.category      || '').replace(/"/g, '""')}"`,
                `"${(e.merchant      || '').replace(/"/g, '""')}"`,
                `"${(e.paymentMethod || '').replace(/"/g, '""')}"`,
                e.amount,
                e.currency,
                e.status,
                `"${(e.createdBy?.name || e.createdById || '').replace(/"/g, '""')}"`,
            ]);

            const csv    = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob   = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
            const url    = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href  = url;
            anchor.download = `${teamName || t('filename_report')}_${t('filename_expenses')}.csv`;
            anchor.click();
            URL.revokeObjectURL(url);
            onClose();
        } catch (err) {
            setError(t('err_generate') + ': ' + (err?.message || 'Error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>

                <div className="ex-header">
                    <div className="ex-title">
                        <div className="ex-title-icon">
                            <i className="ti ti-file-export" />
                        </div>
                        <span>{t('title')}</span>
                    </div>
                    <button className="ex-close" onClick={onClose}>
                        <i className="ti ti-x" />
                    </button>
                </div>

                <div className="ex-body">
                    {error && (
                        <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>
                            <i className="ti ti-alert-triangle" /> {error}
                        </div>
                    )}

                    <div className="ex-document-preview">
                        <div className="ex-doc-header">
                            <span>{t('financial_report')}</span>
                            <span>{new Date().toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="doc-line" />
                        <div className="doc-line short" />
                        <div className="doc-line" />
                    </div>

                    <div className="ex-options-grid">
                        {[
                            { value: 'csv', icon: 'ti-file-text', label: t('csv_label') },
                        ].map(opt => (
                            <label key={opt.value} className="ex-option">
                                <input
                                    type="radio"
                                    name="exportFormat"
                                    value={opt.value}
                                    checked={format === opt.value}
                                    onChange={(e) => setFormat(e.target.value)}
                                />
                                <div className="ex-option-card">
                                    <i className={`ti ${opt.icon}`} />
                                    <span>{opt.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="ex-footer">
                    <button className="ex-btn cancel" onClick={onClose} disabled={loading}>{t('cancel_btn')}</button>
                    <button className="ex-btn download" onClick={handleDownload} disabled={loading}>
                        {loading
                            ? <><i className="ti ti-loader-2" /> {t('preparing')}</>
                            : <><i className="ti ti-download" /> {t('download_btn')}</>
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ExportModal;
