import React from 'react';
import { useTranslation } from 'react-i18next';
import './Charts.css';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

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
    const { t } = useTranslation('analysis.charts');
    const { t: tStatus } = useTranslation('status');
    const textColor = "var(--text-tertiary)";
    const systemAccent = "var(--accent-color)";

    const translatedStatusData = statusData.map(item => ({
        ...item,
        name: tStatus(item.name, { defaultValue: item.name }),
    }));

    return (
        <div className="analysis-charts-container">

            <div className="chart-box">
                <ChartHeader title={t('spending_dist')} period={t('by_category')} />
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

            <div className="chart-box">
                <ChartHeader title={t('cash_flow')} period={t('last_6_months')} />
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                        <XAxis dataKey="month" stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipStyle} labelStyle={{ color: systemAccent, marginBottom: 4 }} />
                        <Bar name={t('bar_amount')} dataKey="amount" fill={systemAccent} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-box">
                <ChartHeader title={t('spending_trend')} period={t('all_time')} />
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
                            name={t('bar_spending')}
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

            <div className="chart-box">
                <ChartHeader title={t('approval_status')} period={t('status_dist')} />
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart layout="vertical" data={translatedStatusData}>
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
                        <Bar name={t('bar_count')} dataKey="value" fill={systemAccent} radius={[0, 6, 6, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default AnalysisCharts;
