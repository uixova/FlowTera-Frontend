import React, { useState, useEffect } from 'react';
import './analysis.css/Analysis.css';
import SubNavbar from '../../components/navigation/SubNavbar'; // Merkezi Navbar
import ExportModal from './components/ExportData';
import AnalysisCharts from './components/Charts'; 
import Loader from '../../components/common/Loader'; 

const Analysis = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Yükleme durumu

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 saniye sonra loader kapanır

    return () => clearTimeout(timer);
  }, []);

  // Yükleme ekranı
  if (loading) {
    return (
      <div className="full-screen-loader">
        <Loader type="butterfly" />
      </div>
    );
  }

  return (
    <div className="analysis-page">
      {/* MERKEZİ NAVBAR */}
      <SubNavbar 
        pageName="Financial Analysis"
        createLabel="Export Data"
        showSearch={false} 
        onCreate={() => setIsExportOpen(true)}
        buttons={[
            { 
                icon: 'ti ti-refresh', 
                tooltip: 'Refresh Data', 
                onClick: () => {
                  setLoading(true); // Yenilerken loader'ı tekrar tetiklemek istersen
                  setTimeout(() => setLoading(false), 800);
                } 
            }
        ]}
      />

      <hr className="sub-nav-divider" />

      {/* Özet Kartları  */}
      <div className="analysis-summary-cards">
        <div className="an-card">
          <span className="an-card-title">Total Spending</span>
          <span className="an-card-value">$12,450</span>
          <span className="an-card-sub">+12% from last month</span>
        </div>
        <div className="an-card">
          <span className="an-card-title">Active Trips</span>
          <span className="an-card-value">4</span>
          <span className="an-card-sub">2 international, 2 domestic</span>
        </div>
        <div className="an-card">
          <span className="an-card-title">Pending Reports</span>
          <span className="an-card-value">18</span>
          <span className="an-card-sub">Waiting for approval</span>
        </div>
      </div>

      {/* Grafikler */}
      <AnalysisCharts />

      {/* Modallar */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};

export default Analysis;