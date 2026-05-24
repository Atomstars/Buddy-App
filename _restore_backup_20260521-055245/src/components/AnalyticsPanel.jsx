import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { SECTORS, formatCurrency, getSector } from '../utils/formatters';
import { getRangeExpenses } from '../hooks/useExpenses';
import { getWeekStart, getWeekEnd, getMonthStart, getMonthEnd } from '../utils/dateUtils';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

// Recharts can't read CSS variables — use actual hex values from the design system
const CHART_COLORS = {
  accent: '#818cf8',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
  violet: '#a78bfa',
  teal: '#2dd4bf',
};

const SECTOR_CHART_COLORS = [
  '#34d399', // groceries  — emerald
  '#a3e635', // fruits     — lime
  '#fb923c', // food       — orange
  '#818cf8', // transport  — accent
  '#fb7185', // shopping   — rose
  '#fbbf24', // bills      — amber
  '#2dd4bf', // health     — teal
  '#a78bfa', // fun        — violet
  '#71717a', // other      — zinc
];

const tooltipStyle = {
  borderRadius: 14,
  border: 'none',
  background: '#18181b',
  color: '#fafafa',
  boxShadow: '0 8px 32px rgba(0,0,0,.45)',
  fontSize: '0.82rem',
  padding: '10px 14px',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <p style={{ margin: 0, fontWeight: 600, marginBottom: 4 }}>{payload[0].payload.name || label}</p>
      <p style={{ margin: 0, color: '#a1a1aa' }}>{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export const AnalyticsPanel = ({ expenses, selectedDate }) => {
  const [filter, setFilter] = useState('week');
  const [chartType, setChartType] = useState('pie');

  const filteredExpenses = useMemo(() => {
    if (filter === 'all') return expenses;
    const date = selectedDate || new Date();
    if (filter === 'week') {
      return getRangeExpenses(expenses, getWeekStart(date), getWeekEnd(date));
    }
    if (filter === 'month') {
      return getRangeExpenses(expenses, getMonthStart(date), getMonthEnd(date));
    }
    return expenses;
  }, [expenses, filter, selectedDate]);

  const sectorData = useMemo(() => {
    const data = SECTORS.map((s, i) => ({
      name: s.shortLabel,
      value: 0,
      color: SECTOR_CHART_COLORS[i] || s.color,
    }));
    filteredExpenses.forEach(exp => {
      const sectorItem = data.find(s => s.name === getSector(exp.sector).shortLabel);
      if (sectorItem) sectorItem.value += exp.amount;
    });
    return data.filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const totalSpend = sectorData.reduce((s, d) => s + d.value, 0);

  return (
    <motion.section
      className="surface-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: 20 }}
    >
      {/* Header */}
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Data Insights</p>
          <h2 className="section-title">Analytics</h2>
        </div>
      </div>

      {/* Time filter tabs */}
      <div className="seg-tabs" style={{ marginBottom: 16 }}>
        {[['week', 'Week'], ['month', 'Month'], ['all', 'All']].map(([id, label]) => (
          <button
            key={id}
            className={`seg-tab ${filter === id ? 'active' : ''}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart type toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
          Total: {formatCurrency(totalSpend)}
        </span>
        <div className="seg-tabs" style={{ display: 'inline-flex', minHeight: 0, padding: 2, gap: 2 }}>
          <button
            className={`seg-tab ${chartType === 'pie' ? 'active' : ''}`}
            onClick={() => setChartType('pie')}
            style={{ padding: '6px 12px' }}
          >
            <PieChartIcon size={14} />
          </button>
          <button
            className={`seg-tab ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
            style={{ padding: '6px 12px' }}
          >
            <BarChart3 size={14} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 300, width: '100%' }}>
        {sectorData.length === 0 ? (
          <div className="empty-state">
            <PieChartIcon size={32} />
            <strong>No data for this period</strong>
          </div>
        ) : chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationDuration={600}
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={600}>
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {sectorData.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16, justifyContent: 'center' }}>
          {sectorData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              {d.name}
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
};
