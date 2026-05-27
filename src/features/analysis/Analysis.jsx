import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './Analysis.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import ExportModal from './components/ExportData';
import AnalysisCharts from './components/Charts';
import Loader from '../../components/ui/Loader';
import { analysisService } from './services/analysisService';
import { useCurrency } from '../../context/CurrencyContext';
import { useTeam } from '../../context/TeamContext';

const VIEW_MODE_KEYS = [
    { key: 'all',      tKey: 'all_data',         icon: 'ti-layers-intersect' },
    { key: 'expenses', tKey: 'expense_analysis',  icon: 'ti-receipt'          },
    { key: 'trips',    tKey: 'trip_analysis',     icon: 'ti-plane-arrival'    },
];

const Analysis = () => {
    const { t } = useTranslation('analysis');
    const { t: tBtn } = useTranslation('common.buttons');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [loading,      setLoading]      = useState(true);
    const [analysisData, setAnalysisData] = useState(null);
    const [viewMode,     setViewMode]     = useState('all');

    const { convert, format, formatMonthYear } = useCurrency();
    const { selectedTeamId, activeTeam }        = useTeam();

    const fetchData = useCallback(async () => {
        if (!selectedTeamId) { setLoading(false); return; }
        setLoading(true);
        try {
            const data = await analysisService.getTeamAnalysis(selectedTeamId, viewMode, convert);
            if (data) setAnalysisData(data);
        } catch (err) {
            console.error('Analysis Error:', err);
        } finally {
            setTimeout(() => setLoading(false), 600);
        }
    }, [selectedTeamId, viewMode, convert]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const now = useMemo(() => new Date(), []);
    const currentYear = useMemo(() => now.getFullYear(), [now]);
    const teamCurrency = activeTeam?.settings?.currency || 'USD';

    const numericGrowth = useMemo(() => {
        const g = analysisData?.summary?.spendingGrowth;
        if (g === null || g === undefined) return null;
        const n = Number(g);
        return isNaN(n) ? null : n;
    }, [analysisData]);

    const trendClass = numericGrowth === null ? 'trend-neutral'
        : numericGrowth > 0 ? 'trend-up' : numericGrowth < 0 ? 'trend-down' : 'trend-neutral';

    const trendIcon = numericGrowth === null ? 'ti-minus'
        : numericGrowth > 0 ? 'ti-trending-up' : numericGrowth < 0 ? 'ti-trending-down' : 'ti-minus';

    const trendLabel = numericGrowth === null ? t('trend_no_compare')
        : numericGrowth > 0 ? t('trend_increase') : numericGrowth < 0 ? t('trend_decrease') : t('trend_no_change');

    const badgeClass = numericGrowth === null ? 'neutral'
        : numericGrowth > 0 ? 'up' : 'down';

    const cards = useMemo(() => [
        {
            icon:  'ti-chart-bar',
            title: viewMode === 'all' ? t('card_total_all') : viewMode === 'expenses' ? t('card_total_expenses') : t('card_total_trips'),
            value: format(analysisData?.summary?.totalSpending, teamCurrency),
            sub:   { class: trendClass, icon: trendIcon, text: `${trendLabel} (${t('trend_vs_prev')})`, growth: numericGrowth },
            badge: { class: badgeClass, text: numericGrowth !== null ? `%${Math.abs(numericGrowth)}` : '—' },
        },
        {
            icon:  'ti-calendar-stats',
            title: viewMode === 'all' ? t('card_last_month') : viewMode === 'expenses' ? t('card_this_month_expenses') : t('card_this_month_trips'),
            value: viewMode === 'all'
                ? format(analysisData?.summary?.lastMonthSpending  || 0, teamCurrency)
                : format(analysisData?.summary?.currentMonthSpending || 0, teamCurrency),
            sub:   { class: 'trend-neutral', icon: 'ti-clock', text: viewMode === 'all' ? t('sub_prev_period') : t('sub_period', { period: formatMonthYear(now) }) },
            badge: null,
        },
        {
            icon:  viewMode === 'trips' ? 'ti-plane-tilt' : viewMode === 'expenses' ? 'ti-clock-pause' : 'ti-calendar-check',
            title: viewMode === 'trips' ? t('card_active_tasks') : viewMode === 'expenses' ? t('card_pending') : t('card_yearly', { year: currentYear }),
            value: viewMode === 'trips'
                ? (analysisData?.summary?.activeTrips ?? '—')
                : viewMode === 'expenses'
                    ? (analysisData?.summary?.pendingReports ?? '—')
                    : format(analysisData?.summary?.yearlyTotal || 0, teamCurrency),
            sub:   {
                class: 'trend-neutral',
                icon:  'ti-info-circle',
                text:  viewMode === 'trips' ? t('sub_active_tasks') : viewMode === 'expenses' ? t('sub_pending') : t('sub_yearly', { year: currentYear })
            },
            badge: null,
        },
    ], [analysisData, viewMode, teamCurrency, format, formatMonthYear, trendClass, trendIcon, trendLabel, numericGrowth, badgeClass, currentYear, now, t]);

    if (loading) return <div className="full-screen-loader"><Loader type="butterfly" /></div>;

    return (
        <div className="analysis-page">
            <SubNavbar
                pageName={t('page_title')}
                createLabel={tBtn('create_report')}
                showSearch={false}
                onCreate={() => setIsExportOpen(true)}
                buttons={[
                    { icon: 'ti ti-refresh', tooltip: t('refresh_tooltip'), onClick: fetchData }
                ]}
            />

            <hr className="sub-nav-divider" />

            <div className="an-view-tabs">
                {VIEW_MODE_KEYS.map(mode => (
                    <button
                        key={mode.key}
                        className={`an-tab${viewMode === mode.key ? ' active' : ''}`}
                        onClick={() => setViewMode(mode.key)}
                    >
                        <i className={`ti ${mode.icon}`} />
                        {t(mode.tKey)}
                    </button>
                ))}
            </div>

            <div className="analysis-summary-cards">
                {cards.map((card, i) => (
                    <div key={i} className="an-card">
                        <div className="an-card-icon-row">
                            <div className="an-card-icon">
                                <i className={`ti ${card.icon}`} />
                            </div>
                            {card.badge && (
                                <span className={`an-card-badge ${card.badge.class}`}>
                                    {card.badge.text}
                                </span>
                            )}
                        </div>
                        <span className="an-card-title">{card.title}</span>
                        <span className="an-card-value">{card.value}</span>
                        <span className={`an-card-sub ${card.sub.class}`}>
                            <i className={`ti ${card.sub.icon}`} />
                            <small>{card.sub.text}</small>
                        </span>
                    </div>
                ))}
            </div>

            <AnalysisCharts
                categoryData={analysisData?.categoryData || []}
                cashFlowData={analysisData?.cashFlowData || []}
                statusData={analysisData?.statusData    || []}
            />

            <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} teamId={selectedTeamId} teamName={activeTeam?.name} />
        </div>
    );
};

export default Analysis;