import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import './Graphics.css';

const MonthlyReport = ({ trendData, distributionData, typeData, teamData }) => {
  return (
    <div className="monthly-grid">
      {/* KART 1: Harcama Trendi */}
      <div className="report-card">
        <div className="report-header">
          <div className="report-panel-left">
            <div className="report-panel-icon">
              <i className="ti ti-chart-area-line" aria-hidden="true"></i>
            </div>
            <h3>Harcama Analitiği</h3>
          </div>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} fontFamily="'DM Sans', sans-serif" />
              <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} fontFamily="'DM Sans', sans-serif" />
              <Tooltip 
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: 'rgba(10, 10, 14, 0.96)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', fontFamily: "'DM Sans', sans-serif" }}
                itemStyle={{ color: '#0ed45a', fontWeight: 'bold' }}
                labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '0.75rem' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#0ed45a" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KART 2: Kategori Dağılımı */}
      <div className="report-card">
        <div className="report-header">
          <div className="report-panel-left">
            <div className="report-panel-icon" style={{ color: '#00d2ff', background: 'rgba(0, 210, 255, 0.06)', borderColor: 'rgba(0, 210, 255, 0.14)' }}>
              <i className="ti ti-chart-bar" aria-hidden="true"></i>
            </div>
            <h3>Kategori Dağılımı</h3>
          </div>
          <span className="report-period" style={{ color: '#00d2ff', background: 'rgba(0, 210, 255, 0.08)', borderColor: 'rgba(0, 210, 255, 0.15)' }}>Sayıya Göre</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} fontFamily="'DM Sans', sans-serif" />
              <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} fontFamily="'DM Sans', sans-serif" />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                contentStyle={{ backgroundColor: 'rgba(10, 10, 14, 0.96)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', fontFamily: "'DM Sans', sans-serif" }} 
                itemStyle={{ color: '#fff', fontWeight: 'bold' }} 
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || '#00d2ff'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KART 3: Harcama Tipi */}
      <div className="report-card">
        <div className="report-header">
          <div className="report-panel-left">
            <div className="report-panel-icon" style={{ color: '#ffab00', background: 'rgba(255, 171, 0, 0.06)', borderColor: 'rgba(255, 171, 0, 0.14)' }}>
              <i className="ti ti-chart-pie" aria-hidden="true"></i>
            </div>
            <h3>Seyahat vs Harcama</h3>
          </div>
          <span className="report-period" style={{ color: '#ffab00', background: 'rgba(255, 171, 0, 0.08)', borderColor: 'rgba(255, 171, 0, 0.15)' }}>Maliyet</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={typeData} innerRadius={65} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none">
                <Cell fill="#0ed45a" />
                <Cell fill="#00d2ff" />
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10, 10, 14, 0.96)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', fontFamily: "'DM Sans', sans-serif" }} 
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KART 4: Takım Harcamaları */}
      <div className="report-card">
        <div className="report-header">
          <div className="report-panel-left">
            <div className="report-panel-icon" style={{ color: '#ff5630', background: 'rgba(255, 86, 48, 0.06)', borderColor: 'rgba(255, 86, 48, 0.14)' }}>
              <i className="ti ti-users" aria-hidden="true"></i>
            </div>
            <h3>Takım Harcamaları</h3>
          </div>
          <span className="report-period" style={{ color: '#ff5630', background: 'rgba(255, 86, 48, 0.08)', borderColor: 'rgba(255, 86, 48, 0.15)' }}>Dağılım</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart layout="vertical" data={teamData}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#555" fontSize={11} axisLine={false} tickLine={false} width={80} fontFamily="'DM Sans', sans-serif" />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                contentStyle={{ backgroundColor: 'rgba(10, 10, 14, 0.96)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', fontFamily: "'DM Sans', sans-serif" }} 
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Bar dataKey="amount" fill="#ff5630" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;