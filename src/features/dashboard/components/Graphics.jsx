import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import './Graphics.css';

// Root değişkenlerinden gelen renk paleti
const PIE_PALETTE = [
    'var(--accent-color)', 
    'var(--_purple)', 
    'var(--_blue)', 
    'var(--_orange)', 
    'var(--_lavender)',
    'var(--_teal)',
    'var(--_pink)'
];

const tooltipStyle = {
    contentStyle: {
        background:   'var(--bg-elevated)',
        border:       '1px solid var(--border-subtle)',
        borderRadius: '14px',
        fontSize:     '0.8rem',
        fontFamily:   "var(--font-sans)",
        boxShadow:    'var(--shadow-lg)',
        padding:      '10px 14px',
    },
    itemStyle: {
        color: 'var(--accent-color)',
        fontSize: '0.75rem',
        padding: '2px 0'
    },
    cursor: { fill: 'var(--white-a5)', opacity: 0.1 },
};

const MonthlyReport = ({ trendData, distributionData, typeData, teamData }) => {
    const systemAccent = "var(--accent-color)";
    const textColor = "var(--text-tertiary)";

    return (
        <div className="monthly-grid">
            
            {/* KART 1: Harcama Trendi (Area) */}
            <div className="report-card">
                <div className="report-header">
                    <div className="report-panel-left">
                        <div className="report-panel-icon">
                            <i className="ti ti-chart-area-line"></i>
                        </div>
                        <h3>Harcama Analitiği</h3>
                    </div>
                    <span className="report-period">Trend (Tüm Zamanlar)</span>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={systemAccent} stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor={systemAccent} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                            <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} labelStyle={{ color: systemAccent, marginBottom: '4px' }} />
                            <Area type="monotone" dataKey="amount" stroke={systemAccent} fillOpacity={1} fill="url(#colorTrend)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* KART 2: Kategori Dağılımı (Bar) */}
            <div className="report-card">
                <div className="report-header">
                    <div className="report-panel-left">
                        <div className="report-panel-icon">
                            <i className="ti ti-chart-bar"></i>
                        </div>
                        <h3>Kategori Dağılımı</h3>
                    </div>
                    <span className="report-period">Sayıya Göre</span>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={distributionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                            <XAxis dataKey="name" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                                {...tooltipStyle} 
                                itemStyle={tooltipStyle.itemStyle} 
                                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }} 
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* KART 3: Seyahat vs Harcama (PieChart / Donut) */}
            <div className="report-card">
                <div className="report-header">
                    <div className="report-panel-left">
                        <div className="report-panel-icon">
                            <i className="ti ti-chart-pie"></i>
                        </div>
                        <h3>Maliyet Türleri</h3>
                    </div>
                    <span className="report-period">Dağılım</span>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie 
                                data={typeData} 
                                innerRadius={65} 
                                outerRadius={85} 
                                paddingAngle={6} 
                                dataKey="value" 
                                stroke="none"
                            >
                                {typeData.map((entry, index) => (
                                    <Cell key={`pie-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* KART 4: Takım Harcamaları (Horizontal Bar) */}
            <div className="report-card">
                <div className="report-header">
                    <div className="report-panel-left">
                        <div className="report-panel-icon">
                            <i className="ti ti-users"></i>
                        </div>
                        <h3>Takım Analizi</h3>
                    </div>
                    <span className="report-period">Maliyet</span>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart layout="vertical" data={teamData}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke={textColor} fontSize={11} axisLine={false} tickLine={false} width={80} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="amount" fill={systemAccent} radius={[0, 6, 6, 0]} barSize={16} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;