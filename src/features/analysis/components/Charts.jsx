import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const themeColor = '#0ed45a'; 
const COLORS = [themeColor, '#c5a2e2', '#8cbed1', '#e67e22'];

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

const AnalysisCharts = () => {
  return (
    <div className="analysis-charts-container">
      {/* Kart 1: Harcama Kategorileri (Pie) */}
      <div className="chart-box">
        <h3>Expense Categories</h3>
        <div className="canvas-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kart 2: Nakit Akışı (Bar) */}
      <div className="chart-box">
        <h3>Monthly Cash Flow</h3>
        <div className="canvas-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="month" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                 cursor={{fill: 'rgba(255,255,255,0.05)'}}
                 contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px' }}
                 itemStyle={{ color: themeColor }}
              />
              <Bar dataKey="amount" fill={themeColor} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts;