import React, { useState, useEffect, useCallback } from 'react';
import './analysis.css/Analysis.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import ExportModal from './components/ExportData';
import AnalysisCharts from './components/Charts'; 
import Loader from '../../components/common/Loader'; 
import { analysisService } from './services/analysisService';
import { useCurrency } from '../../hooks/useCurrency';
import { useTeam } from '../../context/TeamContext'; 

const Analysis = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  
  const { convert, format, formatMonthYear } = useCurrency();
  const { selectedTeamId, activeTeam } = useTeam();

  const fetchData = useCallback(async () => {
    if (!selectedTeamId) { 
        setLoading(false); 
        return; 
    }

    setLoading(true);
    try {
        const data = await analysisService.getTeamAnalysis(selectedTeamId, viewMode, convert);
        if (data) setAnalysisData(data);
    } catch (error) {
        console.error("Analysis Error:", error);
    } finally {
        setTimeout(() => setLoading(false), 600);
    }
  }, [selectedTeamId, viewMode, convert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="full-screen-loader"><Loader type="butterfly" /></div>;

  const now = new Date();
  const currentYear = now.getFullYear();

  const growth = analysisData?.summary?.spendingGrowth;

  const numericGrowth =
    typeof growth === 'number'
        ? growth
        : growth !== null && growth !== undefined
            ? Number(growth)
            : null;

  const getTrendClass = () => {
    if (numericGrowth === null) return 'trend-neutral';
    if (numericGrowth > 0) return 'trend-up';
    if (numericGrowth < 0) return 'trend-down';
    return 'trend-neutral';
  };

  const getTrendIcon = () => {
    if (numericGrowth === null) return 'ti ti-minus';
    if (numericGrowth > 0) return 'ti ti-trending-up';
    if (numericGrowth < 0) return 'ti ti-trending-down';
    return 'ti ti-minus';
  };

  const getTrendLabel = () => {
    if (numericGrowth === null) return 'Karşılaştırma yok';
    if (numericGrowth > 0) return 'Artış';
    if (numericGrowth < 0) return 'Azalış';
    return 'Değişim yok';
  };

  const teamCurrency = activeTeam?.settings?.currency || 'USD';

  return (
    <div className="analysis-page">
      <SubNavbar 
        pageName="Finansal Analiz"
        createLabel="Rapor Oluştur"
        showSearch={false} 
        onCreate={() => setIsExportOpen(true)}
        buttons={[
          {
            icon: viewMode === 'all' 
              ? 'ti ti-layers-intersect' 
              : viewMode === 'expenses' 
                ? 'ti ti-receipt' 
                : 'ti ti-plane-arrival',
            tooltip: viewMode === 'all' 
              ? 'Tüm Veriler' 
              : viewMode === 'expenses' 
                ? 'Gider Analizi' 
                : 'Seyahat Analizi',
            onClick: () => {
                const modes = ['all', 'expenses', 'trips'];
                const nextMode = modes[(modes.indexOf(viewMode) + 1) % modes.length];
                setViewMode(nextMode);
            }
          },
          { icon: 'ti ti-refresh', tooltip: 'Verileri Tazele', onClick: fetchData }
        ]}
      />

      <hr className="sub-nav-divider" />

      {/* ÖZET KARTLARI */}
      <div className="analysis-summary-cards">
        
        {/* KART 1 — Genel Toplam / Trend */}
        <div className="an-card">
          <span className="an-card-title">
            {viewMode === 'all' 
              ? 'Genel Toplam' 
              : viewMode === 'expenses' 
                ? 'Toplam Giderler' 
                : 'Seyahat Maliyeti'}
          </span>

          <span className="an-card-value">
            {format(analysisData?.summary?.totalSpending, teamCurrency)}
          </span>

          <span className={`an-card-sub ${getTrendClass()}`}>
            <i className={getTrendIcon()} style={{ marginRight: '8px', fontSize: '13px' }} />

            {numericGrowth !== null && !isNaN(numericGrowth) && (
              `%${Math.abs(numericGrowth)} `
            )}

            <small>{getTrendLabel()} (Önceki aya göre)</small>
          </span>
        </div>

        {/* KART 2 — Geçen Ay / Bu Ay */}
        <div className="an-card">
          <span className="an-card-title">
            {viewMode === 'all' 
              ? 'Geçen Ayın Toplamı' 
              : viewMode === 'expenses' 
                ? 'Bu Ayki Giderler' 
                : 'Bu Ayki Seyahatler'}
          </span>

          <span className="an-card-value">
            {viewMode === 'all' 
                ? format(analysisData?.summary?.lastMonthSpending || 0, teamCurrency)
                : format(analysisData?.summary?.currentMonthSpending || 0, teamCurrency)
            }
          </span>

          <span className="an-card-sub">
            {viewMode === 'all' 
              ? 'Bir önceki dönem verisi' 
              : `${formatMonthYear(now)} Dönemi`
            }
          </span>
        </div>

        {/* KART 3 — Yıllık Toplam / Onay Bekleyenler / Aktif Görevler */}
        <div className="an-card">
          <span className="an-card-title">
            {viewMode === 'trips' 
              ? 'Aktif Görevler' 
              : viewMode === 'expenses'
                ? 'Onay Bekleyenler'
                : `${currentYear} Yılı Toplamı`}
          </span>

          <span className="an-card-value">
            {viewMode === 'trips' 
              ? analysisData?.summary?.activeTrips
              : viewMode === 'expenses'
                ? analysisData?.summary?.pendingReports
                : format(analysisData?.summary?.yearlyTotal || 0, teamCurrency)
            }
          </span>

          <span className="an-card-sub">
            {viewMode === 'trips' 
              ? 'Devam eden görevler' 
              : viewMode === 'expenses'
                ? 'İnceleme bekleyen kayıtlar'
                : `${currentYear} yılına ait tüm harcamalar`
            }
          </span>
        </div>

      </div>

      <AnalysisCharts 
        categoryData={analysisData?.categoryData || []} 
        cashFlowData={analysisData?.cashFlowData || []} 
        statusData={analysisData?.statusData || []} 
      />

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};

export default Analysis;