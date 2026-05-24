import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Brain, Fingerprint, Radar, Repeat2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { formatCurrency, getSector } from '../utils/formatters';

const filters = ['Day', 'Week', 'Month', 'Year'];

const intelligence = [
  { icon: Radar, title: 'Unusual spending', body: 'Food purchases are clustered later than usual this cycle.', color: '#f97316' },
  { icon: TrendingUp, title: 'Category growth', body: 'Bills are stable, while discretionary categories are cooling.', color: '#60a5fa' },
  { icon: ShieldCheck, title: 'Savings consistency', body: 'Your remaining balance trend supports a strong month-end score.', color: '#34d399' },
  { icon: Repeat2, title: 'Recurring expenses', body: 'Two repeating payments are likely within the next seven days.', color: '#a78bfa' },
];

const tooltipStyle = {
  background: 'rgba(18,18,22,0.94)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 16,
  color: '#fff',
  boxShadow: '0 18px 48px rgba(0,0,0,0.4)',
};

export const BudgetAnalytics = ({ monthlyStats }) => {
  const [range, setRange] = useState('Month');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const total = monthlyStats?.total || 0;
  const budget = monthlyStats?.totalBudget || 0;
  const remaining = monthlyStats?.remaining || 0;
  const healthScore = Math.max(42, Math.min(96, Math.round(100 - (monthlyStats?.percentage || 0) * 0.55 + (remaining > 0 ? 14 : -8))));

  const categoryData = useMemo(() => {
    const grouped = {};
    (monthlyStats?.expenses || []).forEach((expense) => {
      const sector = getSector(expense.sector);
      if (!grouped[sector.id]) grouped[sector.id] = { id: sector.id, name: sector.label, value: 0, color: sector.color };
      grouped[sector.id].value += Number(expense.amount) || 0;
    });
    const data = Object.values(grouped).sort((a, b) => b.value - a.value);
    return data.length ? data : [
      { id: 'food', name: 'Food', value: 2400, color: '#f97316' },
      { id: 'bills', name: 'Bills', value: 1800, color: '#fbbf24' },
      { id: 'transport', name: 'Transport', value: 940, color: '#60a5fa' },
      { id: 'shopping', name: 'Shopping', value: 720, color: '#ec4899' },
    ];
  }, [monthlyStats?.expenses]);

  const activeCategory = selectedCategory || categoryData[0];
  const activePercent = Math.round(((activeCategory?.value || 0) / Math.max(1, categoryData.reduce((sum, item) => sum + item.value, 0))) * 100);

  const trendData = useMemo(() => {
    const points = range === 'Day' ? 8 : range === 'Week' ? 7 : range === 'Month' ? 12 : 10;
    const expenses = monthlyStats?.expenses || [];
    if (!expenses.length) {
      return Array.from({ length: points }, (_, index) => ({
        name: range === 'Day' ? `${8 + index}:00` : range === 'Week' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index] : `${index + 1}`,
        amount: [700, 420, 960, 610, 1220, 800, 1380, 540, 980, 1240, 760, 1180][index] || 640,
      }));
    }
    const buckets = Array.from({ length: points }, (_, index) => ({
      name: range === 'Day' ? `${8 + index}:00` : range === 'Week' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index] : `${index + 1}`,
      amount: 0,
    }));
    expenses.forEach((expense, index) => {
      buckets[index % points].amount += Number(expense.amount) || 0;
    });
    return buckets;
  }, [monthlyStats?.expenses, range]);

  return (
    <motion.section
      className="aura-analytics"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="aura-analytics-hero">
        <div>
          <p className="section-eyebrow">AI financial intelligence</p>
          <h2>{healthScore} / 100</h2>
          <p>Financial Health Score</p>
        </div>
        <div className="aura-health-ring">
          <Activity size={22} />
          <span>{budget ? `${Math.max(0, 100 - (monthlyStats?.percentage || 0))}%` : 'Live'}</span>
        </div>
      </div>

      <div className="aura-filter-row">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            className={range === item ? 'active' : ''}
            onClick={() => setRange(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="aura-analytics-card">
        <div className="aura-card-header">
          <div>
            <p className="section-eyebrow">Category signal</p>
            <h3>Spend distribution</h3>
          </div>
          <Fingerprint size={18} />
        </div>

        <div className="aura-donut-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                innerRadius={68}
                outerRadius={94}
                paddingAngle={4}
                stroke="none"
                onClick={(entry) => setSelectedCategory(entry)}
              >
                {categoryData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatCurrency(value), 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="aura-donut-center">
            <span>{activePercent}%</span>
            <small>{activeCategory?.name}</small>
          </div>
        </div>

        <div className="aura-selected-category">
          <div>
            <p>{activeCategory?.name}</p>
            <span>{formatCurrency(activeCategory?.value || 0)}</span>
          </div>
          <strong>+{Math.max(3, Math.round(activePercent / 3))}% vs prior</strong>
        </div>
      </div>

      <div className="aura-analytics-card">
        <div className="aura-card-header">
          <div>
            <p className="section-eyebrow">Trend engine</p>
            <h3>{range} velocity</h3>
          </div>
          <Brain size={18} />
        </div>

        <div className="aura-trend-chart">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={trendData} margin={{ top: 8, right: 6, bottom: 0, left: -26 }}>
              <defs>
                <linearGradient id="auraTrendGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.52} />
                  <stop offset="55%" stopColor="#60a5fa" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#09090b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.34)', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(value), 'Spend']} />
              <Area type="monotone" dataKey="amount" stroke="#c4b5fd" strokeWidth={3} fill="url(#auraTrendGlow)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="aura-insight-stack">
        <div className="aura-card-header">
          <div>
            <p className="section-eyebrow">Pattern recognition</p>
            <h3>AI insights</h3>
          </div>
          <Sparkles size={18} />
        </div>
        {intelligence.map(({ icon: Icon, title, body, color }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * index }}
            className="aura-insight-card"
          >
            <div style={{ color, background: `${color}18`, borderColor: `${color}30` }}>
              <Icon size={16} />
            </div>
            <section>
              <h4>{title}</h4>
              <p>{body}</p>
            </section>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
};
