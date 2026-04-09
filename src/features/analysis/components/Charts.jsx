import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const AnalysisCharts = ({ categoryData = [], cashFlowData = [], statusData = [] }) => {
  
  // Renkleri state yerine doğrudan CSS değişkenlerinden çekiyoruz.
  const COLORS = [
    'var(--primary-color, #0ed45a)', 
    'var(--secondary-color, #c5a2e2)', 
    '#8cbed1', 
    '#e67e22', 
    '#ffc658'
  ];

  // Tooltip için ortak stil ayarı
  const commonTooltipProps = {
    contentStyle: { 
      background: '#1a1a1a', 
      border: '1px solid var(--border-color, #333)', 
      borderRadius: '10px',
      color: '#fff' 
    },
    cursor: { fill: 'rgba(255, 255, 255, 0.05)' } 
  };

  return (
    <div className="analysis-charts-container">
      {/* 1. Kategori Dağılımı */}
      <div className="chart-box">
        <h3>Harcama Dağılımı</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip {...commonTooltipProps} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Aylık Para Akışı */}
      <div className="chart-box">
        <h3>Aylık Para Akışı</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={cashFlowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #222)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--text-muted, #555)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted, #555)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip {...commonTooltipProps} labelStyle={{ color: 'var(--primary-color, #0ed45a)' }} />
            <Bar name="Miktar" dataKey="amount" fill="var(--primary-color, #0ed45a)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Harcama Eğilimi */}
      <div className="chart-box">
        <h3>Harcama Eğilimi</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={cashFlowData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ed45a" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ed45a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #222)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--text-muted, #555)" fontSize={12} />
            <YAxis stroke="var(--text-muted, #555)" fontSize={12} />
            <Tooltip {...commonTooltipProps} />
            <Area name="Harcama" type="monotone" dataKey="amount" stroke="var(--primary-color, #0ed45a)" fillOpacity={1} fill="url(#colorAmount)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Onay Durumu (Dikey Bar) */}
      <div className="chart-box">
        <h3>Dosya Onay Durumları</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart layout="vertical" data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #222)" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="var(--text-muted, #555)" fontSize={12} width={80} />
            <Tooltip {...commonTooltipProps} />
            <Bar name="Adet" dataKey="value" fill="var(--secondary-color, #8540be)" radius={[0, 6, 6, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalysisCharts;