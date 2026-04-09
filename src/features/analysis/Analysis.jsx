import React, { useState, useEffect, useCallback, useRef } from 'react';
import './analysis.css/Analysis.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import ExportModal from './components/ExportData';
import AnalysisCharts from './components/Charts'; 
import Loader from '../../components/common/Loader'; 
import { analysisService } from './services/analysisService';
import { useCurrency } from '../../hooks/useCurrency';

const Analysis = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const { convert, format, formatMonthYear } = useCurrency();
  const [viewMode, setViewMode] = useState('all');
  
  // Takım ID'sini takip etmek için ref
  const currentTeamIdRef = useRef(localStorage.getItem('tm_selected_id'));

  const fetchData = useCallback(async () => {
    const selectedTeamId = localStorage.getItem('tm_selected_id');
    if (!selectedTeamId) { setLoading(false); return; }

    setLoading(true);
    try {
        // Convert fonksiyonunu servise gönderiyoruz!
        const data = await analysisService.getTeamAnalysis(selectedTeamId, viewMode, convert);
        if (data) setAnalysisData(data);
    } catch (error) {
        console.error("Analysis Error:", error);
    } finally {
        setTimeout(() => setLoading(false), 600);
    }
  }, [viewMode, convert]);

  // Sayfa yüklendiğinde çalış
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dinamik güncelleme için teamChanged Event'inle Bağlantı
  useEffect(() => {
    const handleTeamChange = (e) => {
        const newId = e.detail?.teamId || localStorage.getItem('tm_selected_id');
        
        if (newId !== currentTeamIdRef.current) {
            console.log("FlowTera: Takım Değişimi Algılandı ->", newId);
            fetchData();
        }
    };

    window.addEventListener('teamChanged', handleTeamChange);
    
    // Tarayıcı sekmeleri arası senkronizasyon için standart event
    window.addEventListener('storage', (e) => {
        if (e.key === 'tm_selected_id') fetchData();
    });

    return () => {
        window.removeEventListener('teamChanged', handleTeamChange);
        window.removeEventListener('storage', fetchData);
    };
  }, [fetchData]);

  if (loading) return <div className="full-screen-loader"><Loader type="butterfly" /></div>;

  return (
    <div className="analysis-page">
      <SubNavbar 
        pageName="Finansal Analiz"
        createLabel="Rapor Oluştur"
        showSearch={false} 
        onCreate={() => setIsExportOpen(true)}
        buttons={[
          {
            icon: viewMode === 'all' ? 'ti ti-layers-intersect' : viewMode === 'expenses' ? 'ti ti-receipt' : 'ti ti-plane-arrival',
            tooltip: viewMode === 'all' ? 'Tüm Veriler' : viewMode === 'expenses' ? 'Gider Analizi' : 'Seyahat Analizi',
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
        <div className="an-card">
          <span className="an-card-title">
            {viewMode === 'all' ? 'Genel Toplam' : viewMode === 'expenses' ? 'Toplam Harcama' : 'Seyahat Maliyeti'}
          </span>
          <span className="an-card-value">{format(analysisData?.summary?.totalSpending, analysisData?.summary?.teamCurrency)}</span>
          <span className={`an-card-sub ${parseFloat(analysisData?.summary?.spendingGrowth) >= 0 ? 'trend-up' : 'trend-down'}`}>
            {parseFloat(analysisData?.summary?.spendingGrowth) >= 0 ? '↑' : '↓'} 
            %{Math.abs(analysisData?.summary?.spendingGrowth)} <small>Geçen aya göre</small>
          </span>
        </div>

        <div className="an-card">
          <span className="an-card-title">
            {viewMode === 'all' ? 'Aylık İşlem Hacmi' : viewMode === 'expenses' ? 'Bu Ayki Giderler' : 'Bu Ayki Seyahatler'}
          </span>
          <span className="an-card-value">
            {format(analysisData?.summary?.currentMonthSpending || 0, analysisData?.summary?.teamCurrency)}
          </span>
          <span className="an-card-sub">{formatMonthYear(new Date())} Dönemi</span>
        </div>

        <div className="an-card">
          <span className="an-card-title">
            {viewMode === 'trips' ? 'Aktif Görevler' : 'Onay Bekleyenler'}
          </span>
          <span className="an-card-value">
            {viewMode === 'trips' ? analysisData?.summary?.activeTrips : analysisData?.summary?.pendingReports}
          </span>
          <span className="an-card-sub">
            {viewMode === 'trips' ? 'Şu an sahada olan ekip' : 'İnceleme bekleyen kayıtlar'}
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