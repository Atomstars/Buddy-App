import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency, getSector } from '../utils/formatters';
import { motion } from 'framer-motion';
import { Activity, TrendingDown, TrendingUp, Shield } from 'lucide-react';

const ACCENT_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#fb923c', '#60a5fa', '#a78bfa', '#f472b6'];

/* ─── Premium Tooltip ─── */
const PremiumTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(20,18,28,0.97)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '12px', boxShadow: '0 16px 40px -8px rgba(0,0,0,0.8)' }}>
      {label && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>}
      <p style={{ color: '#fff', fontWeight: 800, fontSize: '15px', margin: 0, fontFamily: "'Satoshi','Inter',sans-serif" }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

const FILTERS = ['Day', 'Week', 'Month'];

export const BudgetAnalytics = ({ monthlyStats }) => {
  const [filter, setFilter] = useState('Month');
  const [activeSlice, setActiveSlice] = useState(null);

  const dailyData = useMemo(() => {
    const grouped = {};
    monthlyStats.expenses.forEach(exp => {
      const d = new Date(exp.date);
      const key = filter === 'Day'
        ? `${d.getHours()}:00`
        : filter === 'Week'
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
        : `${d.getMonth() + 1}/${d.getDate()}`;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += exp.amount;
    });
    return Object.entries(grouped).map(([name, amount]) => ({ name, amount }));
  }, [monthlyStats.expenses, filter]);

  const categoryData = useMemo(() => {
    const grouped = {};
    monthlyStats.expenses.forEach(exp => {
      const sector = getSector(exp.sector);
      if (!grouped[sector.id]) grouped[sector.id] = { name: sector.label, value: 0 };
      grouped[sector.id].value += exp.amount;
    });
    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [monthlyStats.expenses]);

  const total = categoryData.reduce((s, c) => s + c.value, 0);
  const topCat = categoryData[0];
  const healthScore = Math.min(95, Math.round(50 + ((monthlyStats.remaining || 0) / ((monthlyStats.total || 1) + (monthlyStats.remaining || 1))) * 45));

  const insights = [
    topCat && { icon: TrendingDown, color: '#fb923c', label: `Highest: ${topCat.name}`,  sub: `${formatCurrency(topCat.value)} (${Math.round((topCat.value / total) * 100)}% of total)` },
    { icon: Activity,   color: '#60a5fa', label: 'Spending Pace',  sub: filter === 'Month' ? 'On track for this month' : 'Normal range' },
    { icon: Shield,     color: '#34d399', label: 'Savings Health', sub: `${healthScore > 70 ? 'Good' : 'Needs attention'} — score ${healthScore}/100` },
  ].filter(Boolean);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px', fontFamily: "'Satoshi','Inter',sans-serif" }}>

      {/* Financial Health Score */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ borderRadius: '22px', padding: '20px', background: 'linear-gradient(145deg, rgba(28,24,40,0.96), rgba(14,12,20,0.98))', border: '1px solid rgba(139,92,246,0.18)', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 40px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: '12%', right: '12%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 0 6px' }}>Financial Health</p>
            <p style={{ color: '#fff', fontSize: '42px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1, margin: 0 }}>{healthScore}</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '4px 0 0' }}>out of 100</p>
          </div>
          <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'conic-gradient(#818cf8 0%, #818cf8 ' + healthScore + '%, rgba(255,255,255,0.07) ' + healthScore + '%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'rgba(14,12,20,0.98)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={22} style={{ color: '#818cf8' }} />
            </div>
          </div>
        </div>
        {/* Score bar */}
        <div style={{ marginTop: '16px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${healthScore}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} style={{ height: '100%', background: 'linear-gradient(90deg, #818cf8, #34d399)', borderRadius: '4px' }} />
        </div>
      </motion.div>

      {/* Trend chart with filters */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.07 }} style={{ borderRadius: '22px', overflow: 'hidden', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 24px -8px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>Spending Trend</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{formatCurrency(total)} total</p>
          </div>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '3px' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', outline: 'none', border: 'none', background: filter === f ? 'rgba(129,140,248,0.25)' : 'transparent', color: filter === f ? '#818cf8' : 'rgba(255,255,255,0.35)', transition: 'all 0.2s' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: '180px', padding: '10px 4px 0' }}>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="auraGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<PremiumTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#818cf8" strokeWidth={2} fill="url(#auraGrad)" dot={false} activeDot={{ r: 4, fill: '#818cf8', stroke: 'rgba(129,140,248,0.3)', strokeWidth: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No data for this period</div>
          )}
        </div>
        <div style={{ height: '18px' }} />
      </motion.div>

      {/* Category breakdown */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.13 }} style={{ borderRadius: '22px', overflow: 'hidden', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ padding: '18px 18px 0' }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>Category Breakdown</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '0 0 16px' }}>{categoryData.length} categories this month</p>
        </div>

        {categoryData.length > 0 ? (
          <>
            {/* Donut */}
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData} dataKey="value"
                    innerRadius={58} outerRadius={80}
                    paddingAngle={3} stroke="none"
                    onMouseEnter={(_, i) => setActiveSlice(i)}
                    onMouseLeave={() => setActiveSlice(null)}
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} opacity={activeSlice === null || activeSlice === i ? 1 : 0.45} />
                    ))}
                  </Pie>
                  <Tooltip content={<PremiumTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category legend */}
            <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoryData.map((cat, i) => {
                const pct = Math.round((cat.value / total) * 100);
                const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
                return (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}60` }} />
                    <p style={{ flex: 1, color: '#fff', fontSize: '13px', fontWeight: 500, margin: 0 }}>{cat.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: 0 }}>{formatCurrency(cat.value)}</p>
                    <div style={{ background: `${color}18`, borderRadius: '6px', padding: '2px 7px', minWidth: '36px', textAlign: 'center' }}>
                      <span style={{ color, fontSize: '10px', fontWeight: 700 }}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No expenses this month yet</div>
        )}
      </motion.div>

      {/* AI Insights */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.19 }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 2px 10px' }}>AI Insights</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {insights.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: `${ins.color}0a`, border: `1px solid ${ins.color}20`, borderRadius: '16px', padding: '13px 14px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${ins.color}18`, border: `1px solid ${ins.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: ins.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', margin: '0 0 2px' }}>{ins.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', margin: 0 }}>{ins.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
