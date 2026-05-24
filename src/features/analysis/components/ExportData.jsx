import React, { useState } from 'react';
import './ExportData.css';
import { restFetch } from '../../../api/api';

const ExportModal = ({ isOpen, onClose, teamId, teamName }) => {
    const [format, setFormat] = useState('csv');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleDownload = async () => {
        if (!teamId) { setError('Takım seçili değil.'); return; }
        setLoading(true);
        setError('');
        try {
            const result = await restFetch(`/expenses?teamId=${teamId}&pageSize=500`);
            const expenses = result?.data ?? [];
            if (!expenses.length) { setError('Bu takımda henüz harcama kaydı yok.'); return; }

            const headers = ['Tarih', 'Başlık', 'Kategori', 'Tüccar', 'Ödeme Yöntemi', 'Tutar', 'Para Birimi', 'Durum', 'Oluşturan'];
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
            anchor.download = `${teamName || 'Rapor'}_Harcamalar.csv`;
            anchor.click();
            URL.revokeObjectURL(url);
            onClose();
        } catch (err) {
            setError('Rapor oluşturulamadı: ' + (err?.message || 'Hata'));
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
                        <span>Rapor Oluştur</span>
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
                            <span>Flowtera finansal raporu</span>
                            <span>{new Date().toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="doc-line" />
                        <div className="doc-line short" />
                        <div className="doc-line" />
                    </div>

                    <div className="ex-options-grid">
                        {[
                            { value: 'csv', icon: 'ti-file-text', label: 'CSV Dosyası' },
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
                    <button className="ex-btn cancel" onClick={onClose} disabled={loading}>İptal</button>
                    <button className="ex-btn download" onClick={handleDownload} disabled={loading}>
                        {loading
                            ? <><i className="ti ti-loader-2" /> Hazırlanıyor...</>
                            : <><i className="ti ti-download" /> İndir</>
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ExportModal;
