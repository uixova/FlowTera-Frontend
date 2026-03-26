import React, { useState, useEffect, useCallback } from 'react';
import './analysis.css/Analysis.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import ExportModal from './components/ExportData';
import AnalysisCharts from './components/Charts'; 
import Loader from '../../components/common/Loader'; 
import { analysisService } from './services/analysisService';

const Analysis = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [viewMode, setViewMode] = useState('all');

  // 1. fetchData'yı useCallback içine alıyoruz (ESLint hatasını önlemek ve her renderda değişmemesi için)
  const fetchData = useCallback(async () => {
    setLoading(true);
    const selectedTeamId = localStorage.getItem('tm_selected_id');
    
    try {
        // viewMode'u parametre olarak gönderiyoruz!
        const data = await analysisService.getTeamAnalysis(selectedTeamId, viewMode);
        if (data) {
            setAnalysisData(data);
        }
    } catch (error) {
        console.error("Veri çekme hatası:", error);
    } finally {
        setTimeout(() => setLoading(false), 500); 
    }
  }, [viewMode]);
  // 2. Sayfa ilk açıldığında veriyi çek
  useEffect(() => {
    fetchData();
  }, [fetchData]); // useCallback sayesinde burada güvenle kullanabiliriz

  // 3. KRİTİK NOKTA: localStorage değişimini dinle
  // Eğer Navbar'da takımı değiştirdiğinde sayfaya f5 atmadan değişsin istiyorsan:
  useEffect(() => {
    const handleStorageChange = () => {
        fetchData(); // LocalStorage değişince veriyi tekrar çek
    };

    // Aynı penceredeki değişiklikleri yakalamak için (Eğer navbar aynı sayfadaysa)
    window.addEventListener('storage_change', handleStorageChange);
    // Farklı sekmeler için
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage_change', handleStorageChange);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchData]);

  if (loading) return <div className="full-screen-loader"><Loader type="butterfly" /></div>;

  return (
    <div className="analysis-page">
      <SubNavbar 
        pageName="Financial Analysis"
        createLabel="Export Data"
        showSearch={false} 
        onCreate={() => setIsExportOpen(true)}
        buttons={[
        {
          icon: viewMode === 'all' ? 'ti ti-layers-intersect' : viewMode === 'expenses' ? 'ti ti-receipt' : 'ti ti-plane-arrival',
          tooltip: `Showing: ${viewMode}`,
          onClick: () => {
              const modes = ['all', 'expenses', 'trips'];
              const nextMode = modes[(modes.indexOf(viewMode) + 1) % modes.length];
              setViewMode(nextMode);
          }
        },
        { 
          icon: 'ti ti-refresh', tooltip: 'Refresh Data', onClick: fetchData 
        }
      ]}
      />

      <hr className="sub-nav-divider" />

      {/* Veri gelmeden kartların hata vermemesi için optional chaining (?.) kullanıyoruz */}
      <div className="analysis-summary-cards">
        {/* TOPLAM HARCAMA KARTI */}
        <div className="an-card">
          <span className="an-card-title">
            Total {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Spending
          </span>
          <span className="an-card-value">{analysisData?.summary?.totalSpending || "$0.00"}</span>
          <span className={`an-card-sub ${parseFloat(analysisData?.summary?.spendingGrowth) >= 0 ? 'trend-up' : 'trend-down'}`}>
            {parseFloat(analysisData?.summary?.spendingGrowth) >= 0 ? '↑' : '↓'} 
            {Math.abs(analysisData?.summary?.spendingGrowth)}% from last month
          </span>
        </div>

        {/* BU AYIN HARCAMASI */}
        <div className="an-card">
          <span className="an-card-title">Monthly {viewMode === 'all' ? 'Volume' : viewMode}</span>
          <span className="an-card-value">{analysisData?.summary?.currentMonthSpending || "$0.00"}</span>
          <span className="an-card-sub">Expenses in March 2026</span>
        </div>

        {/* DURUM KARTI (DİNAMİK) */}
        <div className="an-card">
          <span className="an-card-title">
            {viewMode === 'trips' ? 'Active Journeys' : 'Pending Reports'}
          </span>
          <span className="an-card-value">
            {viewMode === 'trips' ? analysisData?.summary?.activeTrips : analysisData?.summary?.pendingReports}
          </span>
          <span className="an-card-sub">
            {viewMode === 'trips' ? 'Currently on road' : 'Awaiting management approval'}
          </span>
        </div>
      </div>

      <AnalysisCharts 
        categoryData={analysisData?.categoryData || []} 
        cashFlowData={analysisData?.cashFlowData || []} 
      />

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};

export default Analysis;