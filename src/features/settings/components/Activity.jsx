import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../../../utils/i18nHelpers';
import './Activity.css';

const Activity = ({ logs }) => {
    const { t } = useTranslation('settings.activity');
    const { lang } = useI18n();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // useMemo anında güvenli bir sayfa numarası (1) hesaplar ve DOM'a basar.
    const { currentLogs, totalPages, safePage } = useMemo(() => {
        if (!logs || logs.length === 0) {
            return { currentLogs: [], totalPages: 0, safePage: 1 };
        }
        
        const total = Math.ceil(logs.length / ITEMS_PER_PAGE);
        
        // Eğer dışarıdan gelen logs listesi küçüldüyse veya değiştiyse currentPage'in totalPages'i aşmasını engelle, aşarsa 1'e güvenli düşür.
        const verifiedPage = currentPage > total ? 1 : currentPage;
        
        const startIndex = (verifiedPage - 1) * ITEMS_PER_PAGE;
        const slicedLogs = logs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        
        return { currentLogs: slicedLogs, totalPages: total, safePage: verifiedPage };
    }, [logs, currentPage]);

    // Sayfa değiştirme fonksiyonları 
    const handleNextPage = () => {
        if (safePage < totalPages) setCurrentPage(safePage + 1);
    };

    const handlePrevPage = () => {
        if (safePage > 1) setCurrentPage(safePage - 1);
    };

    return (
        <div className="st-content-section">
            <div className="st-header-box">
                <h2>{t('title')}</h2>
                <p>{t('subtitle')}</p>
            </div>

            <div className="st-card">
                <div className="st-log-list">
                    {currentLogs && currentLogs.length > 0 ? (
                        currentLogs.map((log) => (
                            <div key={log.id} className="st-log-card">
                                <div className="log-icon">
                                    <i className="ti ti-activity" />
                                </div>

                                <div className="log-info">
                                    <p className="log-action">{log.action}</p>
                                    <div className="log-meta-row">
                                        <span className="log-date">
                                            <i className="ti ti-calendar-event" />
                                            {new Date(log.timestamp).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                                        </span>
                                        <span className="log-device">
                                            <i className="ti ti-device-laptop" />
                                            {t('device_label')}
                                        </span>
                                    </div>
                                </div>

                                <span className="log-status-badge">{t('status_success')}</span>
                            </div>
                        ))
                    ) : (
                        <div className="st-empty-logs">
                            <i className="ti ti-ghost" />
                            <p>{t('no_activity')}</p>
                        </div>
                    )}
                </div>

                {/* Sayfalama Kontrolleri */}
                {totalPages > 1 && (
                    <div className="st-pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
                        <button
                            className="st-btn-outline"
                            onClick={handlePrevPage}
                            disabled={safePage === 1}
                            style={{ opacity: safePage === 1 ? 0.5 : 1, cursor: safePage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <i className="ti ti-chevron-left" /> {t('prev_btn')}
                        </button>

                        <span className="st-page-info" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            {t('page_info', { page: safePage, total: totalPages })}
                        </span>

                        <button
                            className="st-btn-outline"
                            onClick={handleNextPage}
                            disabled={safePage === totalPages}
                            style={{ opacity: safePage === totalPages ? 0.5 : 1, cursor: safePage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            {t('next_btn')} <i className="ti ti-chevron-right" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Activity;