import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const themeColor = '#0ed45a'; 
const COLORS = [themeColor, '#c5a2e2', '#8cbed1', '#e67e22', '#ffc658'];

const AnalysisCharts = ({ categoryData = [], cashFlowData = [], statusData = [] }) => {
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
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Aylık Nakit Akışı */}
      <div className="chart-box">
        <h3>Aylık Para Akışı</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={cashFlowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="month" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px' }} 
                labelStyle={{ color: themeColor }}
            />
            <Bar name="Miktar" dataKey="amount" fill={themeColor} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Harcama Trendi */}
      <div className="chart-box">
        <h3>Harcama Eğilimi</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={cashFlowData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="month" stroke="#555" fontSize={12} />
            <YAxis stroke="#555" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px' }} />
            <Area name="Harcama" type="monotone" dataKey="amount" stroke={themeColor} fillOpacity={1} fill="url(#colorAmount)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Onay Durumu */}
      <div className="chart-box">
        <h3>Dosya Onay Durumları</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart layout="vertical" data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="#555" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px' }} />
            <Bar name="Adet" dataKey="value" fill="#c5a2e2" radius={[0, 6, 6, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalysisCharts;