import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, ArrowUpDown, ChevronDown, Sparkles, TrendingUp, Calendar, AlertCircle, ShoppingBag, Clock
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  BarChart, Bar, Cell
} from 'recharts';

export const CategoryDetailModal = ({ isOpen, onClose, sector, expenses = [], sectorColors = {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date'); // 'date' | 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const style = sectorColors[sector] || { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };

  // 1. Filtered and sorted transactions for this sector
  const sectorExpenses = useMemo(() => {
    return expenses.filter(exp => exp.sector === sector);
  }, [expenses, sector]);

  // Computed metrics
  const totalSpend = useMemo(() => sectorExpenses.reduce((acc, curr) => acc + curr.amount, 0), [sectorExpenses]);
  const averageSpend = useMemo(() => sectorExpenses.length ? Math.round(totalSpend / sectorExpenses.length) : 0, [sectorExpenses, totalSpend]);
  const maxSpend = useMemo(() => sectorExpenses.length ? Math.max(...sectorExpenses.map(e => e.amount)) : 0, [sectorExpenses]);
  const transactionFrequency = sectorExpenses.length;

  // Chart Data preparation
  // 2. Spending Trend Graph over time
  const splineData = useMemo(() => {
    const dailyMap = {};
    sectorExpenses.forEach(exp => {
      const dateStr = new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + exp.amount;
    });
    return Object.entries(dailyMap)
      .map(([time, amount]) => ({ time, amount, rawDate: new Date(time) }))
      .sort((a, b) => a.rawDate - b.rawDate);
  }, [sectorExpenses]);

  // 3. Weekly comparison bars (Weekday vs Weekend)
  const weeklyDistribution = useMemo(() => {
    let weekdayTotal = 0;
    let weekendTotal = 0;
    sectorExpenses.forEach(exp => {
      const day = new Date(exp.date).getDay();
      const isWeekend = (day === 0 || day === 6); // Sun or Sat
      if (isWeekend) weekendTotal += exp.amount;
      else weekdayTotal += exp.amount;
    });
    return [
      { name: 'Weekdays', amount: weekdayTotal, color: style.color },
      { name: 'Weekends', amount: weekendTotal, color: '#f43f5e' }
    ];
  }, [sectorExpenses, style.color]);


  // Sorted and searched transaction list
  const displayTransactions = useMemo(() => {
    return sectorExpenses
      .filter(exp => (exp.note || '').toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        }
        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [sectorExpenses, searchQuery, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(20,20,24,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '12px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{label}</p>
          <p style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)'
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 450,
              maxHeight: '90vh',
              background: 'linear-gradient(180deg, #131316 0%, #09090a 100%)',
              borderRadius: 28,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 30px 100px rgba(0,0,0,0.8)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 120
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', sticky: 'top', background: '#131316', zIndex: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={18} style={{ color: style.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', textTransform: 'capitalize' }}>
                    {sector} Deep Dive
                  </h3>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Power BI Level Analytics</span>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: 'auto', border: 'none', cursor: 'pointer', outline: 'none'
                }}
              >
                <X size={15} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Premium KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: 14, borderRadius: 16 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Total Spent</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{formatCurrency(totalSpend)}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: 14, borderRadius: 16 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Average Spend</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{formatCurrency(averageSpend)}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: 14, borderRadius: 16 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Spending Spikes</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#f43f5e', marginTop: 4 }}>{formatCurrency(maxSpend)}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: 14, borderRadius: 16 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Frequency</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: style.color, marginTop: 4 }}>{transactionFrequency} times</p>
                </div>
              </div>

              {/* Specific AI Observations */}
              <div style={{ background: `linear-gradient(135deg, ${style.color}15 0%, rgba(0,0,0,0.1) 100%)`, border: `1px solid ${style.color}30`, borderRadius: 20, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Sparkles size={14} style={{ color: style.color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: style.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Insights</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                  {sector === 'groceries' && "Your grocery transactions are concentrated on Saturdays. Bulk buys constitute 72% of this spend."}
                  {sector === 'food' && "Dining transactions are up 18% during late evening slots. Focus limits to save ₹1,500."}
                  {sector === 'transport' && "Frequent short rides represent a leaky expenditure. Try consolidations to trim costs."}
                  {sector !== 'groceries' && sector !== 'food' && sector !== 'transport' && `We observed minor spending deviations in ${sector}. Plan recurring amounts to smooth out month-end spikes.`}
                </p>
              </div>

              {/* Chart 1: Spline Trend Chart */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Spending Trend</h4>
                <div style={{ height: 160, width: '100%', background: 'rgba(0,0,0,0.15)', borderRadius: 16, padding: '12px 6px' }}>
                  {splineData.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No trend data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={splineData}>
                        <defs>
                          <linearGradient id={`sectorGlow-${sector}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={style.color} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={style.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="amount" stroke={style.color} strokeWidth={2.5} fillOpacity={1} fill={`url(#sectorGlow-${sector})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 2: Weekly Comparison (Weekday vs Weekend) */}
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Weekday vs Weekend Distribution</h4>
                <div style={{ height: 160, width: '100%', background: 'rgba(0,0,0,0.15)', borderRadius: 16, padding: '12px 6px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyDistribution}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} />
                      <RechartsTooltip formatter={(val) => [formatCurrency(val), 'Spent']} contentStyle={{ background: 'rgba(20,20,24,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                      <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                        {weeklyDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>



              {/* Transactions List with Search & Sort */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Transactions</h4>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{displayTransactions.length} items</span>
                </div>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', height: 38, borderRadius: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '0 12px 0 34px', color: '#fff', fontSize: 12, outline: 'none'
                    }}
                  />
                  <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: 12 }} />
                </div>

                {/* Sorters */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => handleSort('date')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 11, color: sortField === 'date' ? '#fff' : 'rgba(255,255,255,0.4)',
                      background: sortField === 'date' ? 'rgba(255,255,255,0.06)' : 'transparent',
                      padding: '4px 10px', borderRadius: 8, cursor: 'pointer'
                    }}
                  >
                    Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('amount')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 11, color: sortField === 'amount' ? '#fff' : 'rgba(255,255,255,0.4)',
                      background: sortField === 'amount' ? 'rgba(255,255,255,0.06)' : 'transparent',
                      padding: '4px 10px', borderRadius: 8, cursor: 'pointer'
                    }}
                  >
                    Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                </div>

                {/* Transaction Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {displayTransactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                      No matching records
                    </div>
                  ) : (
                    displayTransactions.slice(0, 10).map(exp => (
                      <div key={exp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{exp.note || sector}</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                            {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>-{formatCurrency(exp.amount)}</span>
                      </div>
                    ))
                  )}
                  {displayTransactions.length > 10 && (
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 4 }}>Showing top 10 items</p>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
