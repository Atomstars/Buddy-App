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

export const AnalyticsPanel = ({ expenses, selectedDate }) => {
  const [filter, setFilter] = useState('week'); // 'week', 'month', 'all'
  const [chartType, setChartType] = useState('pie'); // 'pie', 'bar'

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
    const data = SECTORS.map(s => ({
      name: s.shortLabel,
      value: 0,
      color: s.color
    }));
    filteredExpenses.forEach(exp => {
      const sectorItem = data.find(s => s.name === getSector(exp.sector).shortLabel);
      if (sectorItem) {
        sectorItem.value += exp.amount;
      }
    });
    return data.filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  return (
    <motion.section 
      className="analytics-panel section-block"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="section-title" style={{ marginBottom: '16px' }}>
        <div>
          <p className="eyebrow">Data Insights</p>
          <h2>Analytics</h2>
        </div>
        <div className="analytics-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="analytics-select">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <div className="segmented-control compact">
            <button className={chartType === 'pie' ? 'active' : ''} onClick={() => setChartType('pie')}>
              <PieChartIcon size={16} />
            </button>
            <button className={chartType === 'bar' ? 'active' : ''} onClick={() => setChartType('bar')}>
              <BarChart3 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ height: '300px', width: '100%' }}>
        {sectorData.length === 0 ? (
          <div className="empty-state">No data for this period</div>
        ) : chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--panel)', color: 'var(--ink)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
              <RechartsTooltip 
                formatter={(value) => formatCurrency(value)}
                cursor={{ fill: 'var(--line)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--panel)', color: 'var(--ink)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.section>
  );
};
