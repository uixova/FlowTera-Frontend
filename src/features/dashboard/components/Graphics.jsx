import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import './Graphics.css';

const MonthlyReport = ({ trendData, distributionData, typeData, teamData }) => {
  return (
    <div className="monthly-grid">
      {/* KART 1: Harcama Trendi (AreaChart) */}
      <div className="report-card">
        <div className="report-header">
          <h3>Harcama Analitiği</h3>
          <span className="report-period">Trend (Tüm Zamanlar)</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ed45a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ed45a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#0ed45a" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KART 2: Kategori Dağılımı (BarChart) */}
      <div className="report-card">
        <div className="report-header">
          <h3>Kategori Dağılımı</h3>
          <span className="report-period">Kategori Sayısına Göre</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{color: '#fff'}} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KART 3: Harcama Tipi (PieChart) */}
      <div className="report-card">
        <div className="report-header">
          <h3>Seyahat vs Harcama</h3>
          <span className="report-period">Maliyet Dağılımı</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={typeData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                <Cell fill="#0ed45a" />
                <Cell fill="#4361ee" />
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KART 4: Takım Harcamaları (Horizontal BarChart) */}
      <div className="report-card">
        <div className="report-header">
          <h3>Takım Harcamaları</h3>
          <span className="report-period">Takım Sayısına Göre</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart layout="vertical" data={teamData}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#555" fontSize={12} axisLine={false} tickLine={false} width={80} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Bar dataKey="amount" fill="#9d4edd" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;