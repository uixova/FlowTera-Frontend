import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Analysis.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import ExportModal from './components/ExportData';
import AnalysisCharts from './components/Charts';
import Loader from '../../components/ui/Loader';
import { analysisService } from './services/analysisService';
import { useCurrency } from '../../context/CurrencyContext';
import { useTeam } from '../../context/TeamContext';

const VIEW_MODES = [
    { key: 'all',      label: 'Tüm Veriler',    icon: 'ti-layers-intersect' },
    { key: 'expenses', label: 'Gider Analizi',   icon: 'ti-receipt'          },
    { key: 'trips',    label: 'Seyahat Analizi', icon: 'ti-plane-arrival'    },
];

const Analysis = () => {
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

    const trendLabel = numericGrowth === null ? 'Karşılaştırma yok'
        : numericGrowth > 0 ? 'Artış' : numericGrowth < 0 ? 'Azalış' : 'Değişim yok';

    const badgeClass = numericGrowth === null ? 'neutral'
        : numericGrowth > 0 ? 'up' : 'down';

    const cards = useMemo(() => [
        {
            icon:  'ti-chart-bar',
            title: viewMode === 'all' ? 'Genel Toplam' : viewMode === 'expenses' ? 'Toplam Giderler' : 'Seyahat Maliyeti',
            value: format(analysisData?.summary?.totalSpending, teamCurrency),
            sub:   { class: trendClass, icon: trendIcon, text: trendLabel + ' (Önceki aya göre)', growth: numericGrowth },
            badge: { class: badgeClass, text: numericGrowth !== null ? `%${Math.abs(numericGrowth)}` : '—' },
        },
        {
            icon:  'ti-calendar-stats',
            title: viewMode === 'all' ? 'Geçen Ayın Toplamı' : viewMode === 'expenses' ? 'Bu Ayki Giderler' : 'Bu Ayki Seyahatler',
            value: viewMode === 'all'
                ? format(analysisData?.summary?.lastMonthSpending  || 0, teamCurrency)
                : format(analysisData?.summary?.currentMonthSpending || 0, teamCurrency),
            sub:   { class: 'trend-neutral', icon: 'ti-clock', text: viewMode === 'all' ? 'Bir önceki dönem verisi' : `${formatMonthYear(now)} Dönemi` },
            badge: null,
        },
        {
            icon:  viewMode === 'trips' ? 'ti-plane-tilt' : viewMode === 'expenses' ? 'ti-clock-pause' : 'ti-calendar-check',
            title: viewMode === 'trips' ? 'Aktif Görevler' : viewMode === 'expenses' ? 'Onay Bekleyenler' : `${currentYear} Yılı Toplamı`,
            value: viewMode === 'trips'
                ? (analysisData?.summary?.activeTrips ?? '—')
                : viewMode === 'expenses'
                    ? (analysisData?.summary?.pendingReports ?? '—')
                    : format(analysisData?.summary?.yearlyTotal || 0, teamCurrency),
            sub:   {
                class: 'trend-neutral',
                icon:  'ti-info-circle',
                text:  viewMode === 'trips' ? 'Devam eden görevler' : viewMode === 'expenses' ? 'İnceleme bekleyen kayıtlar' : `${currentYear} yılına ait tüm harcamalar`
            },
            badge: null,
        },
    ], [analysisData, viewMode, teamCurrency, format, formatMonthYear, trendClass, trendIcon, trendLabel, numericGrowth, badgeClass, currentYear, now]);

    if (loading) return <div className="full-screen-loader"><Loader type="butterfly" /></div>;

    return (
        <div className="analysis-page">
            <SubNavbar
                pageName="Finansal Analiz"
                createLabel="Rapor Oluştur"
                showSearch={false}
                onCreate={() => setIsExportOpen(true)}
                buttons={[
                    { icon: 'ti ti-refresh', tooltip: 'Verileri Tazele', onClick: fetchData }
                ]}
            />

            <hr className="sub-nav-divider" />

            <div className="an-view-tabs">
                {VIEW_MODES.map(mode => (
                    <button
                        key={mode.key}
                        className={`an-tab${viewMode === mode.key ? ' active' : ''}`}
                        onClick={() => setViewMode(mode.key)}
                    >
                        <i className={`ti ${mode.icon}`} />
                        {mode.label}
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