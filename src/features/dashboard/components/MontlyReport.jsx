import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import '../dashboard.css/Report.css';

const MonthlyReport = () => {
  // Örnek Veri: Aylık Harcama Akışı
  const lineData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 5000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ];

  // Örnek Veri: Kategori Dağılımı
  const barData = [
    { name: 'Ops', value: 2400, color: '#9d4edd' },
    { name: 'Marketing', value: 1398, color: '#4361ee' },
    { name: 'Sales', value: 9800, color: '#e63946' },
    { name: 'Finance', value: 3908, color: '#0ed45a' },
  ];

  return (
    <div className="monthly-grid">
      {/* KART 1: Harcama Trendi */}
      <div className="report-card">
        <div className="report-header">
          <h3>Expense Analytics</h3>
          <span className="report-period">Last 6 Months</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={lineData}>
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

      {/* KART 2: Kategori Dağılımı */}
      <div className="report-card">
        <div className="report-header">
          <h3>Category Distribution</h3>
          <span className="report-period">Real-time</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{color: '#fff'}}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;