import React, { useState } from 'react';
import './analysis.css/Analysis.css';
import SubNavbar from '../../components/navigation/SubNavbar'; // Merkezi Navbar
import ExportModal from './components/ExportData';
import AnalysisCharts from './components/Charts'; 

const Analysis = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="analysis-page">
      {/* YENİ MERKEZİ NAVBAR */}
      <SubNavbar 
        teamName="Software Team" 
        pageName="Financial Analysis"
        createLabel="Export Data"
        showSearch={false} 
        onCreate={() => setIsExportOpen(true)}
        buttons={[
            { 
                icon: 'ti ti-refresh', 
                tooltip: 'Refresh Data', 
                onClick: () => console.log("Refreshing...") 
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

      {/* Modallar */}
      <AnalysisCharts />

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
};

export default Analysis;