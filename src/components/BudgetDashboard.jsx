import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Apple, UtensilsCrossed, CarFront, ShoppingBag,
  Receipt, HeartPulse, Sparkles, Paperclip, Search, ArrowUpDown,
  Pencil, Trash2, PieChart as PieChartIcon, Activity, ChevronDown, Lock, ChevronRight, Calendar, Plus, Check
} from 'lucide-react';
import { formatCurrency, SECTORS } from '../utils/formatters';
import {
  LineChart, Line, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { AuraIntelligenceSheet } from './AuraIntelligenceSheet';
import { CategoryDetailModal } from './CategoryDetailModal';
import { AddBillModal } from './AddBillModal';

const SECTOR_ICONS = {
  groceries: ShoppingCart, fruits: Apple, food: UtensilsCrossed,
  transport: CarFront, shopping: ShoppingBag, bills: Receipt,
  health: HeartPulse, fun: Sparkles, other: Paperclip,
};

const SECTOR_COLORS = {
  groceries: { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  fruits:    { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  food:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  transport: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  shopping:  { color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  bills:     { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
  health:    { color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
  fun:       { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  other:     { color: '#71717a', bg: 'rgba(113,113,122,0.1)' },
};

const TIME_FILTERS = ['Day', 'Week', 'Month', 'Year', 'Custom'];

export const BudgetDashboard = ({
  monthlyStats, weeklyStats, todayStats, expenses = [], onEdit, onDelete, selectedDate,
  bills = [], onAddBill, onUpdateBill, onDeleteBill, onToggleBillPaid
}) => {
  const [activeFilter, setActiveFilter] = useState('Month');
  const [activeChart, setActiveChart] = useState('trend');
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [isBillsOpen, setIsBillsOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  // Custom Date Range states
  const [customRangeType, setCustomRangeType] = useState('may15'); // 'may15' | 'janfeb' | '90days' | 'manual'
  const [customStart, setCustomStart] = useState('2026-05-01');
  const [customEnd, setCustomEnd] = useState('2026-05-15');

  // AI & Category Modal states
  const [isAISheetOpen, setIsAISheetOpen] = useState(false);
  const [selectedSectorDetails, setSelectedSectorDetails] = useState(null);

  // Transactions list extra filter/sort states
  const [txSearch, setTxSearch] = useState('');
  const [txCategoryFilter, setTxCategoryFilter] = useState('all');
  const [txSortField, setTxSortField] = useState('date'); // 'date' | 'amount'
  const [txSortOrder, setTxSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [txGrouping, setTxGrouping] = useState('date'); // 'date' | 'week' | 'month'

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const d = new Date(exp.date);
      const now = new Date();

      if (activeFilter === 'Day') {
        return d.toDateString() === now.toDateString();
      }
      if (activeFilter === 'Week') {
        return (now - d) / (1000 * 60 * 60 * 24) < 7;
      }
      if (activeFilter === 'Month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (activeFilter === 'Year') {
        return d.getFullYear() === now.getFullYear();
      }
      if (activeFilter === 'Custom') {
        if (customRangeType === '90days') {
          return (now - d) / (1000 * 60 * 60 * 24) < 90;
        }
        if (customRangeType === 'may15') {
          const s = new Date('2026-05-01');
          const e = new Date('2026-05-15');
          return d >= s && d <= e;
        }
        if (customRangeType === 'janfeb') {
          const s = new Date('2026-01-01');
          const e = new Date('2026-02-28');
          return d >= s && d <= e;
        }
        if (customRangeType === 'manual') {
          if (!customStart || !customEnd) return true;
          const s = new Date(customStart);
          const e = new Date(customEnd);
          // Zero out time details for precise inclusion
          const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          const sTime = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
          const eTime = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
          return dTime >= sTime && dTime <= eTime;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, activeFilter, customRangeType, customStart, customEnd]);

  // Recalculate stats dynamically based on the current filter!
  const stats = useMemo(() => {
    const spent = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    // Base target logic
    let target = 30000;
    if (activeFilter === 'Day') target = 1000;
    else if (activeFilter === 'Week') target = 7000;
    else if (activeFilter === 'Year') target = 360000;
    else if (activeFilter === 'Custom') {
      if (customRangeType === 'may15') target = 15000;
      else if (customRangeType === 'janfeb') target = 60000;
      else if (customRangeType === '90days') target = 90000;
      else target = 20000;
    }
    return { spent, target };
  }, [filteredExpenses, activeFilter, customRangeType]);

  const spent = stats.spent;
  const target = stats.target;
  const remaining = Math.max(0, target - spent);
  const pct = Math.min((spent / target) * 100, 100);

  // Group transactions inside dropdown by date, week, or month
  const groupedTransactions = useMemo(() => {
    const sorted = [...filteredExpenses]
      .filter(exp => {
        const matchesSearch = (exp.note || '').toLowerCase().includes(txSearch.toLowerCase()) || exp.sector.toLowerCase().includes(txSearch.toLowerCase());
        const matchesCategory = txCategoryFilter === 'all' || exp.sector === txCategoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let valA = a[txSortField];
        let valB = b[txSortField];
        if (txSortField === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        }
        if (txSortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });

    const groups = {};
    sorted.forEach(exp => {
      let groupLabel = '';
      const expDate = new Date(exp.date);
      if (txGrouping === 'date') {
        groupLabel = expDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (txGrouping === 'week') {
        // Calculate week of year
        const oneJan = new Date(expDate.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((expDate - oneJan) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((expDate.getDay() + 1 + numberOfDays) / 7);
        groupLabel = `Week ${weekNum} (${expDate.getFullYear()})`;
      } else if (txGrouping === 'month') {
        groupLabel = expDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      }

      if (!groups[groupLabel]) groups[groupLabel] = [];
      groups[groupLabel].push(exp);
    });
    return groups;
  }, [filteredExpenses, txSearch, txCategoryFilter, txSortField, txSortOrder, txGrouping]);

  // Category summary preparation
  const catSpend = {};
  const timelineDataMap = {};
  filteredExpenses.forEach(exp => {
    catSpend[exp.sector] = (catSpend[exp.sector] || 0) + exp.amount;
    const timeKey = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    timelineDataMap[timeKey] = (timelineDataMap[timeKey] || 0) + exp.amount;
  });

  const catList = Object.entries(catSpend).sort(([, a], [, b]) => b - a);
  const maxCat = catList.length ? catList[0][1] : 1;
  const donutData = catList.map(([sector, amount]) => ({
    name: SECTORS.find(s => s.id === sector)?.label || sector,
    value: amount,
    color: SECTOR_COLORS[sector]?.color || SECTOR_COLORS.other.color
  }));

  const timelineData = Object.entries(timelineDataMap)
    .map(([time, amount]) => ({ time, amount, rawDate: new Date(time) }))
    .sort((a, b) => a.rawDate - b.rawDate);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(20,20,24,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '12px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{label || payload[0].name}</p>
          <p style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ paddingBottom: '160px' }}>
      
      {/* ── Time Filter Header ── */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 100, padding: 4, marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content', margin: '0 auto 16px' }}>
        {TIME_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => {
              setActiveFilter(f);
              if (f !== 'Custom') {
                setIsTransactionsOpen(false);
              }
            }}
            style={{ padding: '8px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: activeFilter === f ? '#fff' : 'transparent', color: activeFilter === f ? '#000' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s', outline: 'none' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Custom Date Selector Section ── */}
      <AnimatePresence>
        {activeFilter === 'Custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              overflow: 'hidden', width: '100%',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)',
              padding: 16, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 14
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Custom Range
            </p>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { label: 'May 1 → 15', value: 'may15' },
                { label: 'Jan 1 → Feb 28', value: 'janfeb' },
                { label: 'Last 90 days', value: '90days' },
                { label: 'Manual dates', value: 'manual' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCustomRangeType(opt.value)}
                  style={{
                    padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                    background: customRangeType === opt.value ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: customRangeType === opt.value ? '#fff' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {customRangeType === 'manual' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Start Date</span>
                  <input
                    type="date"
                    value={customStart}
                    onChange={e => setCustomStart(e.target.value)}
                    style={{
                      height: 38, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, color: '#fff', padding: '0 8px', fontSize: 12, outline: 'none'
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>End Date</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={e => setCustomEnd(e.target.value)}
                    style={{
                      height: 38, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, color: '#fff', padding: '0 8px', fontSize: 12, outline: 'none'
                    }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overview Ring ── */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="200" height="200" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="#fff" strokeWidth="12" strokeDasharray={`${(pct / 100) * 565} 565`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease-out' }} />
          </svg>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spent</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{formatCurrency(spent)}</p>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>of {formatCurrency(target)}</p>
          </div>
        </div>
      </motion.div>

      {/* ── AI Insights (Premium Collapsed Glowing Card) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => setIsAISheetOpen(true)}
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.03) 100%)',
          borderRadius: 24, padding: 20,
          border: '1px solid rgba(251,191,36,0.25)',
          marginBottom: 24, position: 'relative', overflow: 'hidden', cursor: 'pointer',
          boxShadow: '0 0 20px rgba(251,191,36,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.08 }}><Sparkles size={120} color="#fbbf24" /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#fbbf24" className="aura-ai-shimmer" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ask Aura Intelligence</span>
          </div>
          <ChevronRight size={16} color="#fbbf24" />
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
          Click to query behavior analysis, custom spending trends, and receive active savings alerts.
        </p>
        <div style={{
          marginTop: 14, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
          padding: '8px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content'
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>Launch AI Assistant</span>
        </div>
      </motion.div>

      {/* ── Advanced Analytics Chart ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', borderRadius: 24, padding: '24px 20px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Trends</h3>
              <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 12 }}>
                  <button onClick={() => setActiveChart('trend')} style={{ width: 32, height: 32, borderRadius: 8, background: activeChart === 'trend' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeChart === 'trend' ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={16} /></button>
                  <button onClick={() => setActiveChart('category')} style={{ width: 32, height: 32, borderRadius: 8, background: activeChart === 'category' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeChart === 'category' ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PieChartIcon size={16} /></button>
              </div>
          </div>

          <div style={{ height: 220, width: '100%' }}>
            {filteredExpenses.length === 0 ? (
                 <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No data for this period</div>
            ) : activeChart === 'trend' ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                        <defs>
                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fff" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} dy={10} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="amount" stroke="#fff" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                            {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            )}
          </div>
      </motion.div>

      {/* ── Category Breakdown (Click launches deep dive) ── */}
      {catList.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingLeft: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Categories</h3>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Click to deep dive</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {catList.map(([sector, amount]) => {
              const style = SECTOR_COLORS[sector] || SECTOR_COLORS.other;
              const Icon = SECTOR_ICONS[sector] || Paperclip;
              const sectorInfo = SECTORS?.find(s => s.id === sector);
              const fillPct = Math.min((amount / maxCat) * 100, 100);
              
              return (
                <motion.div
                  key={sector}
                  onClick={() => setSelectedSectorDetails(sector)}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 16,
                    border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} style={{ color: style.color }} />
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{sectorInfo?.label || sector}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{formatCurrency(amount)}</span>
                      <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ duration: 0.8, delay: 0.1 }} style={{ height: '100%', background: style.color, borderRadius: 3 }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Bills & Subscriptions Dropdown ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 24 }}>
        <button 
          onClick={() => setIsBillsOpen(!isBillsOpen)}
          style={{ width: '100%', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} color="#f43f5e" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'left' }}>Bills & Subscriptions</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'left', marginTop: 2 }}>{bills.length} active</p>
            </div>
          </div>
          <motion.div animate={{ rotate: isBillsOpen ? 180 : 0 }}>
            <ChevronDown size={20} color="rgba(255,255,255,0.5)" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isBillsOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bills.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '12px 0' }}>No bills added yet.</p>
                ) : (
                  bills.map(bill => (
                    <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => onToggleBillPaid?.(bill.id)} style={{ width: 28, height: 28, borderRadius: 8, background: bill.isPaid ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          {bill.isPaid && <Check size={14} color="#fff" />}
                        </button>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 600, color: bill.isPaid ? 'rgba(255,255,255,0.5)' : '#fff', textDecoration: bill.isPaid ? 'line-through' : 'none' }}>{bill.title}</p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Due {new Date(bill.dueDate).toLocaleDateString()} {bill.isRecurring ? `• ${bill.frequency}` : ''}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: bill.isPaid ? 'rgba(255,255,255,0.5)' : '#fff' }}>{formatCurrency(bill.amount)}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setEditingBill(bill); setIsAddBillOpen(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><Pencil size={14} /></button>
                          <button onClick={() => onDeleteBill?.(bill.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <button onClick={() => { setEditingBill(null); setIsAddBillOpen(true); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
                  <Plus size={16} /> Add New Bill
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Transactions Dropdown ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <button 
          onClick={() => setIsTransactionsOpen(!isTransactionsOpen)}
          style={{ width: '100%', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}
        >
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'left' }}>Transactions Log</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'left', marginTop: 2 }}>{filteredExpenses.length} entries matching period</p>
          </div>
          <motion.div animate={{ rotate: isTransactionsOpen ? 180 : 0 }}>
            <ChevronDown size={20} color="rgba(255,255,255,0.5)" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isTransactionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0 20px 20px' }}>
                
                {/* ADVANCED TRANSACTION CONTROLS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, background: 'rgba(0,0,0,0.15)', padding: 14, borderRadius: 16 }}>
                  
                  {/* Search and Category filters */}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={txSearch}
                      onChange={e => setTxSearch(e.target.value)}
                      style={{
                        width: '100%', height: 36, borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '0 12px 0 32px', color: '#fff', fontSize: 12, outline: 'none'
                      }}
                    />
                    <Search size={12} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 10, top: 12 }} />
                  </div>

                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    <button
                      onClick={() => setTxCategoryFilter('all')}
                      style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 11,
                        background: txCategoryFilter === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: txCategoryFilter === 'all' ? '#fff' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer'
                      }}
                    >
                      All
                    </button>
                    {SECTORS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setTxCategoryFilter(s.id)}
                        style={{
                          padding: '4px 10px', borderRadius: 8, fontSize: 11,
                          background: txCategoryFilter === s.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: txCategoryFilter === s.id ? '#fff' : 'rgba(255,255,255,0.4)',
                          cursor: 'pointer'
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Sorter and Groupers */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => {
                          if (txSortField === 'date') setTxSortOrder(txSortOrder === 'asc' ? 'desc' : 'asc');
                          else { setTxSortField('date'); setTxSortOrder('desc'); }
                        }}
                        style={{ fontSize: 11, color: txSortField === 'date' ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                      >
                        Date {txSortField === 'date' && (txSortOrder === 'asc' ? '↑' : '↓')}
                      </button>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.1)' }}>|</span>
                      <button
                        onClick={() => {
                          if (txSortField === 'amount') setTxSortOrder(txSortOrder === 'asc' ? 'desc' : 'asc');
                          else { setTxSortField('amount'); setTxSortOrder('desc'); }
                        }}
                        style={{ fontSize: 11, color: txSortField === 'amount' ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                      >
                        Amount {txSortField === 'amount' && (txSortOrder === 'asc' ? '↑' : '↓')}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Group by:</span>
                      {['date', 'week', 'month'].map(g => (
                        <button
                          key={g}
                          onClick={() => setTxGrouping(g)}
                          style={{
                            fontSize: 10, cursor: 'pointer', textTransform: 'capitalize',
                            color: txGrouping === g ? '#fff' : 'rgba(255,255,255,0.3)',
                            fontWeight: txGrouping === g ? 700 : 500
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {filteredExpenses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.4)' }}>No transactions found.</div>
                ) : (
                  Object.entries(groupedTransactions).map(([dateLabel, exps]) => (
                    <div key={dateLabel} style={{ marginBottom: 24 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{dateLabel}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {exps.map((exp) => {
                          const Icon = SECTOR_ICONS[exp.sector] || Paperclip;
                          const style = SECTOR_COLORS[exp.sector] || SECTOR_COLORS.other;
                          return (
                            <div key={exp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Icon size={20} style={{ color: style.color }} />
                                </div>
                                <div>
                                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{exp.note || exp.sector}</p>
                                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, textTransform: 'capitalize' }}>{exp.sector}</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>-{formatCurrency(exp.amount)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── AI Insights Sheet overlay ── */}
      <AuraIntelligenceSheet
        isOpen={isAISheetOpen}
        onClose={() => setIsAISheetOpen(false)}
        expenses={expenses}
      />

      {/* ── Category Detail Modal overlay ── */}
      <CategoryDetailModal
        isOpen={Boolean(selectedSectorDetails)}
        onClose={() => setSelectedSectorDetails(null)}
        sector={selectedSectorDetails}
        expenses={expenses}
        sectorColors={SECTOR_COLORS}
      />

      {/* ── Add Bill Modal ── */}
      <AddBillModal
        isOpen={isAddBillOpen}
        onClose={() => setIsAddBillOpen(false)}
        onSave={(bill) => {
          if (editingBill) {
            onUpdateBill?.(editingBill.id, bill);
          } else {
            onAddBill?.(bill);
          }
        }}
        editingBill={editingBill}
      />
      
    </div>
  );
};

export default BudgetDashboard;
