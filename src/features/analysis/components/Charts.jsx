import React from 'react';
import './Charts.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const PALETTE = ['#0ed45a', '#9d4edd', '#00b8d9', '#ff8c42', '#ffc658'];

const tooltipStyle = {
    contentStyle: {
        background:   '#0d0d10',
        border:       '1px solid rgba(255,255,255,0.09)',
        borderRadius: '12px',
        color:        '#f0f0f2',
        fontSize:     '0.82rem',
        fontFamily:   "'DM Sans', sans-serif",
        boxShadow:    '0 20px 50px rgba(0,0,0,0.6)',
    },
    cursor: { fill: 'rgba(255,255,255,0.04)' },
};

const ChartHeader = ({ title, period }) => (
    <div className="chart-box-header">
        <h3>{title}</h3>
        {period && <span className="chart-period-tag">{period}</span>}
    </div>
);

const AnalysisCharts = ({ categoryData = [], cashFlowData = [], statusData = [] }) => (
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
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip {...tooltipStyle} labelStyle={{ color: '#0ed45a', marginBottom: 4 }} />
                    <Bar name="Miktar" dataKey="amount" fill="#0ed45a" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* 3 — Harcama Eğilimi (Area) */}
        <div className="chart-box">
            <ChartHeader title="Harcama Eğilimi" period="Trend (Tüm Zamanlar)" />
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={cashFlowData}>
                    <defs>
                        <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#0ed45a" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#0ed45a" stopOpacity={0}    />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip {...tooltipStyle} />
                    <Area
                        name="Harcama"
                        type="monotone"
                        dataKey="amount"
                        stroke="#0ed45a"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#areaGreen)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* 4 — Onay Durumları (Yatay Bar) */}
        <div className="chart-box">
            <ChartHeader title="Dosya Onay Durumları" period="Durum Dağılımı" />
            <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#333"
                        fontSize={11}
                        width={84}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar name="Adet" dataKey="value" fill="#9d4edd" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>

    </div>
);

export default AnalysisCharts;