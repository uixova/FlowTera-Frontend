import React, { useState, useMemo } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import './CreateReport.css';
import { restFetch } from '../../../api/api';

const CreateReport = ({ isOpen, onClose, teams = [], selectedTeamId }) => {

    const activeTeamName = useMemo(() => {
        const team = teams.find(t => String(t.id) === String(selectedTeamId));
        return team ? team.name : 'Seçili Takım';
    }, [teams, selectedTeamId]);

    const [reportConfig, setReportConfig] = useState({
        name: '',
        startDate: '',
        endDate: '',
        includeDocs: true,
    });
    const [generating, setGenerating] = useState(false);
    const [genError,   setGenError]   = useState('');

    const setQuickDate = (days) => {
        const end   = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
        setReportConfig(prev => ({ ...prev, startDate: start, endDate: end }));
    };

    const handleGenerateReport = async () => {
        if (!selectedTeamId) return;
        setGenerating(true);
        setGenError('');
        try {
            const params = new URLSearchParams({ teamId: selectedTeamId, pageSize: '500' });
            if (reportConfig.startDate) params.set('startDate', reportConfig.startDate);
            if (reportConfig.endDate)   params.set('endDate',   reportConfig.endDate);

            const result = await restFetch(`/expenses?${params}`);
            const expenses = (result?.data ?? []);

            if (!expenses.length) {
                setGenError('Bu tarih aralığında harcama bulunamadı.');
                return;
            }

            const reportName = reportConfig.name || `Rapor_${reportConfig.startDate || 'Tum'}_${reportConfig.endDate || 'Zaman'}`;
            const headers    = ['Tarih', 'Başlık', 'Kategori', 'Tüccar', 'Tutar', 'Para Birimi', 'Durum', 'Oluşturan'];
            const rows = expenses.map((e) => [
                new Date(e.date).toLocaleDateString('tr-TR'),
                `"${(e.title  || '').replace(/"/g, '""')}"`,
                `"${(e.category || '').replace(/"/g, '""')}"`,
                `"${(e.merchant || '').replace(/"/g, '""')}"`,
                e.amount,
                e.currency,
                e.status,
                `"${(e.createdBy?.name || e.createdById || '').replace(/"/g, '""')}"`,
            ]);

            const csv     = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
            const blob    = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
            const url     = URL.createObjectURL(blob);
            const anchor  = document.createElement('a');
            anchor.href   = url;
            anchor.download = `${reportName}.csv`;
            anchor.click();
            URL.revokeObjectURL(url);
            onClose();
        } catch (err) {
            setGenError('Rapor oluşturulamadı: ' + (err?.message || 'Hata'));
        } finally {
            setGenerating(false);
        }
    };

    const footer = (
        <button
            className="generate-report-btn"
            onClick={handleGenerateReport}
            disabled={generating || !selectedTeamId}
        >
            <i className={`ti ${generating ? 'ti-loader-2' : 'ti-file-download'}`} />
            {generating ? 'Hazırlanıyor...' : 'CSV Raporu İndir'}
        </button>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={<h2>Dijital Rapor Hazırlayıcı</h2>}
            footer={footer}
            width="500px"
        >
            <div className="report-wrapper">

                {genError && (
                    <div className="mail-info-banner" style={{ borderColor: '#f87171', background: 'rgba(239,68,68,0.08)' }}>
                        <div className="banner-icon"><i className="ti ti-alert-triangle" /></div>
                        <p style={{ color: '#f87171' }}>{genError}</p>
                    </div>
                )}

                <div className="mail-info-banner">
                    <div className="banner-icon">
                        <i className="ti ti-file-download" />
                    </div>
                    <p>
                        Seçilen tarih aralığındaki harcamalar <strong>CSV</strong> formatında indirilir.
                        Takım: <strong>{activeTeamName}</strong>
                    </p>
                </div>

                <div className="report-info-card">
                    <div className="info-icon">
                        <i className="ti ti-briefcase" />
                    </div>
                    <div className="info-text">
                        <span>Seçili Takım</span>
                        <strong>{activeTeamName}</strong>
                    </div>
                </div>

                <div className="report-section">
                    <label className="section-label">Rapor İsmi</label>
                    <div className="input-with-icon">
                        <i className="ti ti-file-text" />
                        <input
                            type="text"
                            placeholder="Rapor başlığı giriniz..."
                            value={reportConfig.name}
                            onChange={(e) =>
                                setReportConfig(prev => ({ ...prev, name: e.target.value }))
                            }
                        />
                    </div>
                </div>

                <div className="report-section">
                    <div className="section-header">
                        <label className="section-label">Zaman Aralığı</label>
                        <div className="quick-dates">
                            <span onClick={() => setQuickDate(7)}>7G</span>
                            <span onClick={() => setQuickDate(30)}>30G</span>
                            <span onClick={() => setQuickDate(90)}>90G</span>
                        </div>
                    </div>
                    <div className="report-grid-2">
                        <div className="date-input-box">
                            <small>Başlangıç</small>
                            <input
                                type="date"
                                value={reportConfig.startDate}
                                onChange={(e) =>
                                    setReportConfig(prev => ({ ...prev, startDate: e.target.value }))
                                }
                            />
                        </div>
                        <div className="date-input-box">
                            <small>Bitiş</small>
                            <input
                                type="date"
                                value={reportConfig.endDate}
                                onChange={(e) =>
                                    setReportConfig(prev => ({ ...prev, endDate: e.target.value }))
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="report-section">
                    <label className="section-label">İçerik Tercihleri</label>
                    <div
                        className={`option-item${reportConfig.includeDocs ? ' active' : ''}`}
                        onClick={() =>
                            setReportConfig(prev => ({ ...prev, includeDocs: !prev.includeDocs }))
                        }
                    >
                        <div className="option-info">
                            <i className="ti ti-camera" />
                            <div>
                                <p>Fatura Kanıtlarını Ekle</p>
                                <small>Tüm döküman görselleri PDF sonuna eklenir.</small>
                            </div>
                        </div>
                        <div className="custom-switch" />
                    </div>
                </div>

            </div>
        </ActionSidebar>
    );
};

export default CreateReport;