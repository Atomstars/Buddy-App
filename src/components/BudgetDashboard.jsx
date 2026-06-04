import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Apple, UtensilsCrossed, CarFront, ShoppingBag,
  Receipt, HeartPulse, Sparkles, Paperclip, Search, ArrowUpDown,
  Pencil, Trash2, PieChart as PieChartIcon, Activity, ChevronDown,
  ChevronRight, Plus, Check, ChevronLeft, Settings, LayoutGrid,
  CreditCard, BarChart3, CalendarDays,
} from 'lucide-react';
import { formatCurrency, SECTORS } from '../utils/formatters';
import {
  AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { AuraIntelligenceSheet } from './AuraIntelligenceSheet';
import { CategoryDetailModal } from './CategoryDetailModal';
import { AddBillModal } from './AddBillModal';
import { BudgetPlanner } from './BudgetPlanner';
import { BudgetSettingsPage } from './BudgetSettingsPage';

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

// ── Tab definitions ───────────────────────────────────────────
const TABS = [
  { id: 'overview',     label: 'Overview',  icon: LayoutGrid },
  { id: 'transactions', label: 'Txns',      icon: ArrowUpDown },
  { id: 'bills',        label: 'Bills',     icon: Receipt },
  { id: 'analytics',   label: 'Analytics', icon: BarChart3 },
  { id: 'planner',     label: 'Planner',   icon: CalendarDays },
];

const TIME_FILTERS = ['Day', 'Week', 'Month', 'Year'];

// ── Month Navigation Header ───────────────────────────────────
const MonthNavHeader = ({ displayLabel, isCurrentMonth, isFutureMonth, prevMonth, nextMonth, onSettingsClick }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
    <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <ChevronLeft size={18} color="#fff" />
    </button>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{displayLabel}</p>
      {isFutureMonth && (
        <span style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', background: 'rgba(129,140,248,0.12)', padding: '2px 8px', borderRadius: 6, marginTop: 2, display: 'inline-block' }}>
          PLANNING
        </span>
      )}
      {isCurrentMonth && (
        <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 6, marginTop: 2, display: 'inline-block' }}>
          CURRENT
        </span>
      )}
    </div>
    <button
      id="budget-settings-btn"
      onClick={onSettingsClick}
      style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <Settings size={16} color="rgba(255,255,255,0.7)" />
    </button>
  </div>
);

// ── Tab Bar ───────────────────────────────────────────────────
const TabBar = ({ activeTab, onChange }) => (
  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 4, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', gap: 2 }}>
    {TABS.map(tab => {
      const Icon = tab.icon;
      const active = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          id={`budget-tab-${tab.id}`}
          onClick={() => onChange(tab.id)}
          style={{
            flex: '1 0 auto', minWidth: 60, padding: '8px 10px', borderRadius: 12,
            background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
            color: active ? '#fff' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, transition: 'all 0.2s', outline: 'none',
          }}
        >
          <Icon size={14} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.03em' }}>{tab.label}</span>
        </button>
      );
    })}
  </div>
);

// ── Tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(20,20,24,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 12 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{label || payload[0].name}</p>
        <p style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export const BudgetDashboard = ({
  monthlyStats, weeklyStats, todayStats, expenses = [], onEdit, onDelete, selectedDate,
  bills = [], onAddBill, onUpdateBill, onDeleteBill, onToggleBillPaid,
  // Month navigation
  displayLabel, isCurrentMonth, isFutureMonth, prevMonth, nextMonth,
  // Budget settings
  monthlyTarget, weeklyTarget, monthlyIncome, budgets,
  onUpdateMonthlyTarget, onUpdateWeeklyTarget, onUpdateMonthlyIncome, onUpdateBudget,
  // Budget planner
  planner,
  // Selected month for filtering
  monthStart, monthEnd,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFilter, setActiveFilter] = useState('Month');
  const [activeChart, setActiveChart] = useState('trend');
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [isAISheetOpen, setIsAISheetOpen] = useState(false);
  const [selectedSectorDetails, setSelectedSectorDetails] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Custom date range
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  // Transactions filters
  const [txSearch, setTxSearch] = useState('');
  const [txCategoryFilter, setTxCategoryFilter] = useState('all');
  const [txSortField, setTxSortField] = useState('date');
  const [txSortOrder, setTxSortOrder] = useState('desc');

  // ── Expense filtering ─────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const d = new Date(exp.date);
      const now = new Date();
      if (activeFilter === 'Day') return d.toDateString() === now.toDateString();
      if (activeFilter === 'Week') return (now - d) / (1000 * 60 * 60 * 24) < 7;
      if (activeFilter === 'Month') {
        // Use selectedMonth range if available
        if (monthStart && monthEnd) return d >= monthStart && d <= monthEnd;
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (activeFilter === 'Year') return d.getFullYear() === now.getFullYear();
      if (activeFilter === 'Custom') {
        const s = new Date(customStart); const e = new Date(customEnd);
        const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const sTime = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
        const eTime = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
        return dTime >= sTime && dTime <= eTime;
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, activeFilter, customStart, customEnd, monthStart, monthEnd]);

  const stats = useMemo(() => {
    const spent = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    let target = monthlyTarget || 30000;
    if (activeFilter === 'Day') target = Math.round((monthlyTarget || 30000) / 30);
    else if (activeFilter === 'Week') target = weeklyTarget || Math.round((monthlyTarget || 30000) / 4);
    else if (activeFilter === 'Year') target = (monthlyTarget || 30000) * 12;
    return { spent, target };
  }, [filteredExpenses, activeFilter, monthlyTarget, weeklyTarget]);

  const { spent, target } = stats;
  const remaining = Math.max(0, target - spent);
  const pct = Math.min((spent / Math.max(target, 1)) * 100, 100);

  // Category data
  const catSpend = {};
  filteredExpenses.forEach(exp => { catSpend[exp.sector] = (catSpend[exp.sector] || 0) + exp.amount; });
  const catList = Object.entries(catSpend).sort(([, a], [, b]) => b - a);
  const maxCat = catList.length ? catList[0][1] : 1;

  const donutData = catList.map(([sector, amount]) => ({
    name: SECTORS.find(s => s.id === sector)?.label || sector,
    value: amount,
    color: SECTOR_COLORS[sector]?.color || SECTOR_COLORS.other.color,
  }));

  const timelineDataMap = {};
  filteredExpenses.forEach(exp => {
    const timeKey = new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    timelineDataMap[timeKey] = (timelineDataMap[timeKey] || 0) + exp.amount;
  });
  const timelineData = Object.entries(timelineDataMap)
    .map(([time, amount]) => ({ time, amount, rawDate: new Date(time) }))
    .sort((a, b) => a.rawDate - b.rawDate);

  // Transaction list filtered
  const filteredTxList = useMemo(() => {
    return [...filteredExpenses]
      .filter(exp => {
        const matchesSearch = (exp.note || '').toLowerCase().includes(txSearch.toLowerCase()) || exp.sector.toLowerCase().includes(txSearch.toLowerCase());
        const matchesCategory = txCategoryFilter === 'all' || exp.sector === txCategoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let valA = txSortField === 'date' ? new Date(a.date).getTime() : a.amount;
        let valB = txSortField === 'date' ? new Date(b.date).getTime() : b.amount;
        return txSortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [filteredExpenses, txSearch, txCategoryFilter, txSortField, txSortOrder]);

  // Group transactions by date
  const groupedTxList = useMemo(() => {
    const groups = {};
    filteredTxList.forEach(exp => {
      const label = new Date(exp.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!groups[label]) groups[label] = [];
      groups[label].push(exp);
    });
    return groups;
  }, [filteredTxList]);

  // ── Settings view ─────────────────────────────────────────
  if (showSettings) {
    return (
      <BudgetSettingsPage
        onBack={() => setShowSettings(false)}
        monthlyTarget={monthlyTarget}
        weeklyTarget={weeklyTarget}
        monthlyIncome={monthlyIncome}
        budgets={budgets}
        onUpdateMonthlyTarget={onUpdateMonthlyTarget}
        onUpdateWeeklyTarget={onUpdateWeeklyTarget}
        onUpdateMonthlyIncome={onUpdateMonthlyIncome}
        onUpdateBudget={onUpdateBudget}
      />
    );
  }

  return (
    <div style={{ paddingBottom: 160 }}>

      {/* Month Navigation */}
      <MonthNavHeader
        displayLabel={displayLabel}
        isCurrentMonth={isCurrentMonth}
        isFutureMonth={isFutureMonth}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      {/* ═══ OVERVIEW TAB ═══ */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Time Filter */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 100, padding: 4, marginBottom: 20, border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content', margin: '0 auto 20px' }}>
              {TIME_FILTERS.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: activeFilter === f ? '#fff' : 'transparent', color: activeFilter === f ? '#000' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s', outline: 'none' }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Spend Ring */}
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="200" height="200" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle cx="100" cy="100" r="90" fill="none"
                    stroke={pct > 85 ? '#f43f5e' : pct > 65 ? '#f59e0b' : '#fff'}
                    strokeWidth="12"
                    strokeDasharray={`${(pct / 100) * 565} 565`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
                  />
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spent</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{formatCurrency(spent)}</p>
                  <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>of {formatCurrency(target)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Remaining</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: remaining === 0 ? '#f43f5e' : '#10b981' }}>{formatCurrency(remaining)}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Used</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{Math.round(pct)}%</p>
                </div>
              </div>
            </motion.div>

            {/* AI Button */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              onClick={() => setIsAISheetOpen(true)}
              style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.03))', borderRadius: 24, padding: 20, border: '1px solid rgba(251,191,36,0.25)', marginBottom: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.08 }}><Sparkles size={100} color="#fbbf24" /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="#fbbf24" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aura Intelligence</span>
                </div>
                <ChevronRight size={16} color="#fbbf24" />
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                Analyze spending patterns, get savings alerts, and AI-driven insights.
              </p>
            </motion.div>

            {/* Category breakdown */}
            {catList.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingLeft: 4 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Categories</h3>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Tap for details</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {catList.map(([sector, amount]) => {
                    const style = SECTOR_COLORS[sector] || SECTOR_COLORS.other;
                    const Icon = SECTOR_ICONS[sector] || Paperclip;
                    const sectorInfo = SECTORS?.find(s => s.id === sector);
                    const fillPct = Math.min((amount / maxCat) * 100, 100);
                    return (
                      <motion.div key={sector} onClick={() => setSelectedSectorDetails(sector)} whileTap={{ scale: 0.99 }}
                        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 14, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={16} style={{ color: style.color }} />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{sectorInfo?.label || sector}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{formatCurrency(amount)}</span>
                            <ChevronRight size={13} color="rgba(255,255,255,0.3)" />
                          </div>
                        </div>
                        <div style={{ height: 5, background: 'rgba(0,0,0,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ duration: 0.8 }}
                            style={{ height: '100%', background: style.color, borderRadius: 3 }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {catList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                No spending data for this period.
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ TRANSACTIONS TAB ═══ */}
        {activeTab === 'transactions' && (
          <motion.div key="transactions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Time Filter */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 100, padding: 4, marginBottom: 16, border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content', margin: '0 auto 16px' }}>
              {TIME_FILTERS.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: activeFilter === f ? '#fff' : 'transparent', color: activeFilter === f ? '#000' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s', outline: 'none' }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: 14, borderRadius: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Search transactions..." value={txSearch} onChange={e => setTxSearch(e.target.value)}
                  style={{ width: '100%', height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '0 12px 0 32px', color: '#fff', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                <Search size={12} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 10, top: 12 }} />
              </div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                {['all', ...SECTORS.map(s => s.id)].map(id => (
                  <button key={id} onClick={() => setTxCategoryFilter(id)}
                    style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, background: txCategoryFilter === id ? 'rgba(255,255,255,0.08)' : 'transparent', color: txCategoryFilter === id ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {id === 'all' ? 'All' : SECTORS.find(s => s.id === id)?.label || id}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {[{ field: 'date', label: 'Date' }, { field: 'amount', label: 'Amount' }].map(({ field, label }) => (
                  <button key={field} onClick={() => { if (txSortField === field) setTxSortOrder(o => o === 'asc' ? 'desc' : 'asc'); else { setTxSortField(field); setTxSortOrder('desc'); } }}
                    style={{ fontSize: 11, color: txSortField === field ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                    {label} {txSortField === field && (txSortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                ))}
              </div>
            </div>

            {filteredTxList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No transactions found.</div>
            ) : (
              Object.entries(groupedTxList).map(([dateLabel, exps]) => (
                <div key={dateLabel} style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{dateLabel}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {exps.map(exp => {
                      const Icon = SECTOR_ICONS[exp.sector] || Paperclip;
                      const style = SECTOR_COLORS[exp.sector] || SECTOR_COLORS.other;
                      return (
                        <div key={exp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 14, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon size={18} style={{ color: style.color }} />
                            </div>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{exp.note || exp.sector}</p>
                              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{exp.sector}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>-{formatCurrency(exp.amount)}</span>
                            <button
                              id={`edit-tx-${exp.id}`}
                              onClick={() => onEdit?.(exp)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
                              <Pencil size={14} />
                            </button>
                            <button
                              id={`delete-tx-${exp.id}`}
                              onClick={() => onDelete?.(exp.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4 }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* ═══ BILLS TAB ═══ */}
        {activeTab === 'bills' && (
          <motion.div key="bills" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Bills & Subscriptions</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {bills.filter(b => !b.isPaid).length} unpaid · {formatCurrency(bills.filter(b => !b.isPaid).reduce((s, b) => s + b.amount, 0))} due
                </p>
              </div>
              <button
                id="add-bill-btn"
                onClick={() => { setEditingBill(null); setIsAddBillOpen(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={15} /> Add Bill
              </button>
            </div>

            {bills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                <Receipt size={32} style={{ marginBottom: 12, opacity: 0.3, margin: '0 auto 12px' }} />
                <p>No bills yet.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Tap "Add Bill" to track your recurring expenses.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Unpaid */}
                {bills.filter(b => !b.isPaid).length > 0 && (
                  <>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Unpaid</p>
                    {bills.filter(b => !b.isPaid).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(bill => (
                      <BillCard key={bill.id} bill={bill}
                        onToggle={() => onToggleBillPaid?.(bill.id)}
                        onEdit={() => { setEditingBill(bill); setIsAddBillOpen(true); }}
                        onDelete={() => onDeleteBill?.(bill.id)}
                      />
                    ))}
                  </>
                )}
                {/* Paid */}
                {bills.filter(b => b.isPaid).length > 0 && (
                  <>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 12, marginBottom: 4 }}>Paid</p>
                    {bills.filter(b => b.isPaid).map(bill => (
                      <BillCard key={bill.id} bill={bill}
                        onToggle={() => onToggleBillPaid?.(bill.id)}
                        onEdit={() => { setEditingBill(bill); setIsAddBillOpen(true); }}
                        onDelete={() => onDeleteBill?.(bill.id)}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ ANALYTICS TAB ═══ */}
        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Chart toggle */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: '20px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Spending Trends</h3>
                <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 12 }}>
                  <button onClick={() => setActiveChart('trend')} style={{ width: 32, height: 32, borderRadius: 8, background: activeChart === 'trend' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeChart === 'trend' ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Activity size={16} /></button>
                  <button onClick={() => setActiveChart('category')} style={{ width: 32, height: 32, borderRadius: 8, background: activeChart === 'category' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeChart === 'category' ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><PieChartIcon size={16} /></button>
                </div>
              </div>
              <div style={{ height: 220 }}>
                {filteredExpenses.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No data for this period</div>
                ) : activeChart === 'trend' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fff" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#fff" stopOpacity={0} />
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
                        {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Spent', value: formatCurrency(spent), color: '#f43f5e' },
                { label: 'Remaining', value: formatCurrency(remaining), color: '#10b981' },
                { label: 'Transactions', value: filteredExpenses.length, color: '#818cf8' },
                { label: 'Avg / Day', value: formatCurrency(Math.round(spent / Math.max(new Date().getDate(), 1))), color: '#fbbf24' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Category list */}
            {catList.map(([sector, amount]) => {
              const style = SECTOR_COLORS[sector] || SECTOR_COLORS.other;
              const Icon = SECTOR_ICONS[sector] || Paperclip;
              const sectorInfo = SECTORS.find(s => s.id === sector);
              const pctOfTotal = spent > 0 ? Math.round((amount / spent) * 100) : 0;
              return (
                <div key={sector} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} style={{ color: style.color }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{sectorInfo?.label || sector}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{formatCurrency(amount)}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{pctOfTotal}%</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ═══ PLANNER TAB ═══ */}
        {activeTab === 'planner' && (
          <motion.div key="planner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <BudgetPlanner
              displayLabel={displayLabel}
              isFutureMonth={isFutureMonth}
              isCurrentMonth={isCurrentMonth}
              prevMonth={prevMonth}
              nextMonth={nextMonth}
              planner={planner}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overlays ── */}
      <AuraIntelligenceSheet isOpen={isAISheetOpen} onClose={() => setIsAISheetOpen(false)} expenses={expenses} />
      <CategoryDetailModal isOpen={Boolean(selectedSectorDetails)} onClose={() => setSelectedSectorDetails(null)} sector={selectedSectorDetails} expenses={expenses} sectorColors={SECTOR_COLORS} />
      <AddBillModal
        isOpen={isAddBillOpen}
        onClose={() => { setIsAddBillOpen(false); setEditingBill(null); }}
        onSave={bill => {
          if (editingBill) onUpdateBill?.(editingBill.id, bill);
          else onAddBill?.(bill);
          setIsAddBillOpen(false); setEditingBill(null);
        }}
        editingBill={editingBill}
      />
    </div>
  );
};

// ── Bill Card ─────────────────────────────────────────────────
const BillCard = ({ bill, onToggle, onEdit, onDelete }) => {
  const isOverdue = !bill.isPaid && new Date(bill.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 18,
      border: `1px solid ${isOverdue ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.05)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          id={`toggle-bill-${bill.id}`}
          onClick={onToggle}
          style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: bill.isPaid ? '#10b981' : isOverdue ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${bill.isPaid ? '#10b981' : isOverdue ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
          {bill.isPaid && <Check size={14} color="#fff" />}
        </button>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: bill.isPaid ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: bill.isPaid ? 'line-through' : 'none' }}>{bill.title}</p>
          <p style={{ fontSize: 12, color: isOverdue ? '#f87171' : 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {isOverdue ? '⚠ Overdue · ' : ''}Due {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            {bill.isRecurring ? ` · ${bill.frequency}` : ''}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: bill.isPaid ? 'rgba(255,255,255,0.4)' : '#fff' }}>{formatCurrency(bill.amount)}</span>
        <button id={`edit-bill-${bill.id}`} onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}><Pencil size={14} /></button>
        <button id={`delete-bill-${bill.id}`} onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4 }}><Trash2 size={14} /></button>
      </div>
    </div>
  );
};

export default BudgetDashboard;
