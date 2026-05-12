import React from 'react';
import './Charts.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

// Pie Chart için renkli palet (Bunlar root değişkenlerinden geliyor)
const PALETTE = [
    'var(--accent-color)', 
    'var(--_purple)', 
    'var(--_blue)', 
    'var(--_orange)', 
    'var(--_lavender)',
    'var(--_teal)',
    'var(--_pink)',
    'var(--_yellow)',
    'var(--_steel)',
    'var(--green)',
    'var(--red-alt)'
];

const tooltipStyle = {
    contentStyle: {
        background:   'var(--bg-elevated)',
        border:       '1px solid var(--border-subtle)',
        borderRadius: '12px',
        color:        'var(--text-primary)',
        fontSize:     '0.82rem',
        fontFamily:   "var(--font-sans)",
        boxShadow:    'var(--shadow-lg)',
    },
    cursor: { fill: 'var(--bg-hover)', opacity: 0.4 },
};

const ChartHeader = ({ title, period }) => (
    <div className="chart-box-header">
        <div className="report-panel-left">
            <div className="report-panel-icon">
                <i className="ti ti-chart-pie"></i>
            </div>
            <h3>{title}</h3>
        </div>
        {period && <span className="chart-period-tag">{period}</span>}
    </div>
);

const AnalysisCharts = ({ categoryData = [], cashFlowData = [], statusData = [] }) => {
    // ESLint hatasını önlemek için değişkenleri doğrudan kullanıyoruz veya siliyoruz
    const textColor = "var(--text-tertiary)";
    const systemAccent = "var(--accent-color)";

    return (
        <div className="analysis-charts-container">

            {/* 1 — Kategori Dağılımı (Pie) */}
            <div className="chart-box">
                <ChartHeader title="Harcama Dağılımı" period="Kategoriye Göre" />
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            innerRadius={62}
                            outerRadius={82}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {categoryData.map((_, idx) => (
                                <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                            ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* 2 — Aylık Para Akışı (Bar) */}
            <div className="chart-box">
                <ChartHeader title="Aylık Para Akışı" period="Son 6 Ay" />
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                        <XAxis dataKey="month" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipStyle} labelStyle={{ color: systemAccent, marginBottom: 4 }} />
                        <Bar name="Miktar" dataKey="amount" fill={systemAccent} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 3 — Harcama Eğilimi (Area) */}
            <div className="chart-box">
                <ChartHeader title="Harcama Eğilimi" period="Trend (Tüm Zamanlar)" />
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={cashFlowData}>
                        <defs>
                            <linearGradient id="areaAccent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="var(--accent-color)" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}    />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                        <XAxis dataKey="month" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipStyle} />
                        <Area
                            name="Harcama"
                            type="monotone"
                            dataKey="amount"
                            stroke={systemAccent}
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#areaAccent)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* 4 — Onay Durumları (Yatay Bar) */}
            <div className="chart-box">
                <ChartHeader title="Dosya Onay Durumları" period="Durum Dağılımı" />
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart layout="vertical" data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke={textColor}
                            fontSize={11}
                            width={84}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip {...tooltipStyle} />
                        <Bar name="Adet" dataKey="value" fill={systemAccent} radius={[0, 6, 6, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default AnalysisCharts;