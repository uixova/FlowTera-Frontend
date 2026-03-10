import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import './analysis.css/Analysis.css';
import ExportModal from './components/ExportData';

// --- RENK YÖNETİMİ ---
// Buradaki ana rengi ileride context veya props'tan gelen renge bağlayacağız.
const themeColor = '#0ed45a'; 
const COLORS = [themeColor, '#c5a2e2', '#8cbed1', '#e67e22'];

// --- ÖRNEK VERİLER ---
const categoryData = [
  { name: 'Accommodation', value: 4500 },
  { name: 'Travel', value: 3200 },
  { name: 'Food', value: 2100 },
  { name: 'Other', value: 2650 },
];

const cashFlowData = [
  { month: 'Jan', amount: 4000 },
  { month: 'Feb', amount: 3000 },
  { month: 'Mar', amount: 5450 },
];

const Analysis = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handleExport = () => {
    setIsExportOpen(true);
  };

  return (
    <div className="analysis-page" id="analysisPage">
      <div className="an-nav">
        <div className="an-nav-title">
          <h1>Financial Analysis</h1>
        </div>
        <div className="an-nav-buttons">
          <button className="an-export-btn" id="anExportBtn" onClick={handleExport}>
            <i className="ti ti-download"></i> Export Data
          </button>
          <button className="an-refresh-btn">
            <i className="ti ti-refresh"></i>
          </button>
        </div>
      </div>
      
      <hr />

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

      <div className="analysis-charts-container">
        <div className="chart-box">
          <h3>Expense Categories</h3>
          <div className="canvas-wrapper" style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#222', border: '1px solid #333', borderRadius: '10px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-box">
          <h3>Monthly Cash Flow</h3>
          <div className="canvas-wrapper" style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ background: '#222', border: '1px solid #333', borderRadius: '10px' }}
                   itemStyle={{ color: themeColor }}
                />
                <Bar dataKey="amount" fill={themeColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />
    </div>
  );
};

export default Analysis;