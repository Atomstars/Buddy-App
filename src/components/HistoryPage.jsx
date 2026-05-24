import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Apple, UtensilsCrossed, CarFront, ShoppingBag, Receipt,
  HeartPulse, Sparkles, Paperclip, X, ArrowUpDown, ChevronDown, ChevronUp, Calendar
} from 'lucide-react';
import { formatCurrency, SECTORS } from '../utils/formatters';

const SECTOR_ICONS = {
  groceries: ShoppingCart, fruits: Apple, food: UtensilsCrossed,
  transport: CarFront, shopping: ShoppingBag, bills: Receipt,
  health: HeartPulse, fun: Sparkles, other: Paperclip,
};

const SECTOR_COLORS = {
  groceries: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.18)' },
  fruits:    { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.18)' },
  food:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.18)' },
  transport: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.18)' },
  shopping:  { color: '#ec4899', bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.18)' },
  bills:     { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.18)' },
  health:    { color: '#14b8a6', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.18)' },
  fun:       { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.18)' },
  other:     { color: '#71717a', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.15)' },
};

const HistoryPage = ({ expenses = [] }) => {
  // Query and basic filter states
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState('date'); // 'date' | 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [groupingModel, setGroupingModel] = useState('month'); // 'week' | 'month'

  // Date filters
  const [dateRangeOption, setDateRangeOption] = useState('all'); // 'all' | 'may15' | 'janfeb' | '90days' | 'manual'
  const [manualStart, setManualStart] = useState('2026-05-01');
  const [manualEnd, setManualEnd] = useState('2026-05-15');

  // Opened groups tracking (Collapsed by default!)
  const [openGroups, setOpenGroups] = useState({});

  // Trigger group expand / collapse
  const toggleGroup = (groupLabel) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupLabel]: !prev[groupLabel]
    }));
  };

  // Filter and sort the main lists
  const filtered = useMemo(() => {
    return expenses
      .filter(exp => {
        // Keyword Search
        const q = query.toLowerCase();
        const matchesSearch = !query || 
          (exp.note || '').toLowerCase().includes(q) ||
          exp.sector.toLowerCase().includes(q);

        // Category Filter
        const matchesCat = selectedCategory === 'all' || exp.sector === selectedCategory;

        // Date Range option
        let matchesDate = true;
        const d = new Date(exp.date);
        const now = new Date();
        if (dateRangeOption === '90days') {
          matchesDate = (now - d) / (1000 * 60 * 60 * 24) < 90;
        } else if (dateRangeOption === 'may15') {
          const s = new Date('2026-05-01');
          const e = new Date('2026-05-15');
          matchesDate = d >= s && d <= e;
        } else if (dateRangeOption === 'janfeb') {
          const s = new Date('2026-01-01');
          const e = new Date('2026-02-28');
          matchesDate = d >= s && d <= e;
        } else if (dateRangeOption === 'manual') {
          if (manualStart && manualEnd) {
            const s = new Date(manualStart);
            const e = new Date(manualEnd);
            const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const sTime = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
            const eTime = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
            matchesDate = dTime >= sTime && dTime <= eTime;
          }
        }

        return matchesSearch && matchesCat && matchesDate;
      })
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
  }, [expenses, query, selectedCategory, sortField, sortOrder, dateRangeOption, manualStart, manualEnd]);

  // Dynamic calculations based on active filters
  const totalSpent = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  // Accordion groupings mapper
  const groupedList = useMemo(() => {
    const groups = {};
    filtered.forEach(exp => {
      const expDate = new Date(exp.date);
      let label = '';

      if (groupingModel === 'month') {
        label = expDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      } else if (groupingModel === 'week') {
        const oneJan = new Date(expDate.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((expDate - oneJan) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((expDate.getDay() + 1 + numberOfDays) / 7);
        label = `Week ${weekNum} (${expDate.getFullYear()})`;
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(exp);
    });
    return groups;
  }, [filtered, groupingModel]);

  const groupKeys = Object.keys(groupedList);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="aura-history" style={{ paddingBottom: '120px' }}>
      
      {/* Cinematic Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(145deg, rgba(20,20,24,0.95), rgba(10,10,12,0.99))',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 24,
          padding: '24px 20px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
        }}
      >
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>
          Aggregate Expenditure
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 0.95 }}>
          {formatCurrency(totalSpent)}
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} shown in selection
        </p>
      </motion.div>

      {/* Date Range selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 20, border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={12} color="rgba(255,255,255,0.4)" />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Filter Range</span>
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { label: 'All Time', value: 'all' },
            { label: 'May 1 → 15', value: 'may15' },
            { label: 'Jan 1 → Feb 28', value: 'janfeb' },
            { label: 'Last 90 days', value: '90days' },
            { label: 'Custom Range', value: 'manual' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setDateRangeOption(opt.value)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: dateRangeOption === opt.value ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.05)',
                color: dateRangeOption === opt.value ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {dateRangeOption === 'manual' && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Start</span>
              <input
                type="date"
                value={manualStart}
                onChange={e => setManualStart(e.target.value)}
                style={{
                  height: 36, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8, color: '#fff', padding: '0 8px', fontSize: 11, outline: 'none'
                }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>End</span>
              <input
                type="date"
                value={manualEnd}
                onChange={e => setManualEnd(e.target.value)}
                style={{
                  height: 36, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8, color: '#fff', padding: '0 8px', fontSize: 11, outline: 'none'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Horizontal Filter tags */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: selectedCategory === 'all' ? '#fff' : 'rgba(255,255,255,0.03)',
            color: selectedCategory === 'all' ? '#000' : 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer'
          }}
        >
          All
        </button>
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedCategory(s.id)}
            style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              background: selectedCategory === s.id ? '#fff' : 'rgba(255,255,255,0.03)',
              color: selectedCategory === s.id ? '#000' : 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search and Sort Control Hub */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 20, padding: 14 }}>
        
        {/* Search */}
        <div className="aura-history-search" style={{ width: '100%', margin: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Search size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            placeholder="Search notes, items..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ fontSize: 13 }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Sort and Group settings */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleSort('date')}
              style={{ fontSize: 11, color: sortField === 'date' ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('amount')}
              style={{ fontSize: 11, color: sortField === 'amount' ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Group by:</span>
            {['week', 'month'].map(gm => (
              <button
                key={gm}
                onClick={() => setGroupingModel(gm)}
                style={{
                  fontSize: 11, cursor: 'pointer', textTransform: 'capitalize',
                  color: groupingModel === gm ? '#fff' : 'rgba(255,255,255,0.3)',
                  fontWeight: groupingModel === gm ? 700 : 500
                }}
              >
                {gm}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Accordion list details */}
      {groupKeys.length === 0 ? (
        <div className="aura-empty-state">
          <Search size={28} style={{ opacity: 0.3 }} />
          <strong>No matches found</strong>
          <p>Modify search filters to show results</p>
        </div>
      ) : (
        groupKeys.map((group, gi) => {
          const isGroupOpen = !!openGroups[group]; // Collapsed by default!
          return (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
              style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 24, marginBottom: 14, overflow: 'hidden' }}
            >
              {/* Accordion header */}
              <button
                onClick={() => toggleGroup(group)}
                style={{
                  width: '100%', padding: '16px 20px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                  background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none'
                }}
              >
                <div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', textAlign: 'left', display: 'block' }}>{group}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'left', display: 'block', marginTop: 2 }}>{groupedList[group].length} transactions</span>
                </div>
                {isGroupOpen ? <ChevronUp size={16} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
              </button>

              {/* Accordion content */}
              <AnimatePresence>
                {isGroupOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {groupedList[group].map((exp, i) => {
                        const Icon = SECTOR_ICONS[exp.sector] || Paperclip;
                        const style = SECTOR_COLORS[exp.sector] || SECTOR_COLORS.other;
                        const d = new Date(exp.date);
                        const timeLabel = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
                        
                        return (
                          <div
                            key={exp.id}
                            className="aura-history-item"
                            style={{ margin: 0 }}
                          >
                            <div
                              className="aura-history-icon"
                              style={{ background: style.bg, border: `1px solid ${style.border}` }}
                            >
                              <Icon size={16} style={{ color: style.color }} />
                            </div>
                            <div className="aura-history-info">
                              <p className="aura-history-name">
                                {exp.note || exp.sector}
                              </p>
                              <div className="aura-history-meta">
                                <span
                                  className="aura-history-cat"
                                  style={{ background: style.bg, color: style.color }}
                                >
                                  {exp.sector}
                                </span>
                                <span>{timeLabel}</span>
                              </div>
                            </div>
                            <span className="aura-history-amount">
                              -{formatCurrency(exp.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default HistoryPage;
