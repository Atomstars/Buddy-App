import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  CalendarCheck,
  Check,
  ChevronRight,
  Coffee,
  IndianRupee,
  LogOut,
  Pencil,
  Plus,
  PiggyBank,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  UtensilsCrossed,
  CarFront,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Paperclip,
  Apple,
  X,
  Wallet,
} from 'lucide-react';
import { CategoryInsights } from './CategoryInsights';
import { AnalyticsPanel } from './AnalyticsPanel';
import InvestingWidget from './InvestingWidget';
import { viewLabels, getDaysPassedInclusive } from '../utils/assistantLogic';
import {
  SECTORS,
  formatCurrency,
  getPercentage,
  getSector,
  getSectorShortLabel,
  parseCurrencyInput,
  clamp,
} from '../utils/formatters';
import {
  formatDate,
  formatDateISO,
  getDateFromISO,
  getDayName,
  getDaysInWeek,
  getMonthStart,
  getWeekEnd,
  getWeekStart,
  isToday,
  isWeekend,
} from '../utils/dateUtils';

const sectorIcons = {
  groceries: ShoppingCart,
  fruits: Apple,
  food: UtensilsCrossed,
  transport: CarFront,
  shopping: ShoppingBag,
  bills: Receipt,
  health: HeartPulse,
  fun: Sparkles,
  other: Paperclip,
};

/* ═══════════════════════════════════════════
   BudgetModule — Main Export
   ═══════════════════════════════════════════ */
export const BudgetModule = ({
  view,
  setView,
  activeStats,
  todayStats,
  weeklyStats,
  monthlyStats,
  coach,
  expenses,
  goals,
  goalSummary,
  monthlyRemaining,
  onAddGoal,
  onFundGoal,
  onDeleteGoal,
  onQuickAdd,
  onEdit,
  onDelete,
  selectedDate,
}) => {
  const [budgetPanel, setBudgetPanel] = useState('today');
  const displayTotal = view === 'today' ? todayStats.total : activeStats.total;
  const displayPercentage = view === 'today' ? 0 : activeStats.percentage;
  const categoryPeriod = view === 'month' ? 'month' : 'week';

  const filteredExpenses = React.useMemo(() => {
    if (view === 'today') return todayStats.expenses;
    return activeStats.expenses;
  }, [view, todayStats.expenses, activeStats.expenses]);

  // SVG ring variables
  const ringRadius = 40;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = clamp(displayPercentage, 0, 100);
  const ringOffset = ringCircumference * (1 - ringProgress / 100);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ─── Gradient Hero Card ─── */}
      <div className="gradient-hero budget">
        <p className="hero-eyebrow">
          {isToday(selectedDate) ? 'Monthly overview' : formatDate(selectedDate)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
          <div>
            <h2 className="hero-amount">{formatCurrency(monthlyStats?.total || 0)}</h2>
            <p className="hero-subtitle" style={{ marginTop: 4 }}>
              of {formatCurrency(monthlyStats?.totalBudget || 0)} budget
            </p>
          </div>
          {/* SVG circular progress ring */}
          <div className="budget-ring-wrap">
            <svg className="budget-ring" width="90" height="90" viewBox="0 0 90 90">
              <circle
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="6"
                fill="transparent"
                r={ringRadius}
                cx="45"
                cy="45"
              />
              <circle
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="transparent"
                r={ringRadius}
                cx="45"
                cy="45"
                style={{
                  strokeDasharray: ringCircumference,
                  strokeDashoffset: ringOffset,
                  transition: 'stroke-dashoffset 0.6s ease-in-out',
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                }}
              />
              <text x="45" y="45" textAnchor="middle" dy="0.35em" fill="white" fontSize="14" fontWeight="700" fontFamily="var(--font-mono)">
                {monthlyStats?.percentage || 0}%
              </text>
            </svg>
          </div>
        </div>

        <div className="hero-stats-row">
          <div className="stat-pill">
            <Wallet size={12} />
            <div>
              <span className="stat-label">Today</span>
              <span className="stat-value">{formatCurrency(todayStats.total)}</span>
            </div>
          </div>
          <div className="stat-pill">
            <TrendingDown size={12} />
            <div>
              <span className="stat-label">Week</span>
              <span className="stat-value">{formatCurrency(weeklyStats?.total || 0)}</span>
            </div>
          </div>
          <div className="stat-pill">
            <PiggyBank size={12} />
            <div>
              <span className="stat-label">Left</span>
              <span className="stat-value">{formatCurrency(Math.max(0, monthlyRemaining || 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab Bar ─── */}
      {isToday(selectedDate) && (
        <div className="seg-tabs">
          {[
            ['history', 'History'],
            ['today', 'Budget'],
            ['analytics', 'Insights'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`seg-tab ${budgetPanel === id ? 'active' : ''}`}
              onClick={() => {
                setBudgetPanel(id);
                if (id === 'history' && view === 'categories') {
                  setView('week');
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ─── History Panel ─── */}
      {(budgetPanel === 'history' || !isToday(selectedDate)) ? (
        view === 'categories' ? (
          <CategoryInsights activeStats={monthlyStats} expenses={expenses} onBack={() => setView('week')} />
        ) : (
          <HistoryPanel
            expenses={filteredExpenses}
            allExpenses={expenses}
            monthlyStats={monthlyStats}
            weeklyStats={weeklyStats}
            onEdit={onEdit}
            onDelete={onDelete}
            onCategoryClick={() => setView('categories')}
            selectedDate={selectedDate}
          />
        )
      ) : null}

      {/* ─── Analytics Panel ─── */}
      {(budgetPanel === 'analytics' && isToday(selectedDate)) ? (
        <AnalyticsPanel expenses={expenses} selectedDate={selectedDate} />
      ) : null}

      {/* ─── Budget Panel (Today view) ─── */}
      {(budgetPanel === 'today' && isToday(selectedDate)) ? (
        <>
          <div className="surface-card" style={{ padding: 20 }}>
            {/* Segmented control for Today/Week/Month */}
            <div className="seg-tabs" style={{ marginBottom: 16 }}>
              {Object.entries(viewLabels).map(([id, label]) => (
                <button key={id} className={`seg-tab ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
                  {label}
                </button>
              ))}
            </div>

            {/* Section header */}
            <div className="section-header" style={{ marginBottom: 12 }}>
              <div>
                <p className="section-eyebrow">{viewLabels[view]} budget</p>
                <h3 className="section-title" style={{ fontSize: '1.1rem' }}>{formatCurrency(displayTotal)} spent</h3>
              </div>
              <span className="section-badge">
                {view === 'today' ? `${todayStats.count} entries` : `${displayPercentage}% used`}
              </span>
            </div>

            {/* Progress bar */}
            <div className="progress-track" style={{ marginBottom: 20 }}>
              <div
                className={`progress-fill ${displayPercentage >= 100 ? 'danger' : displayPercentage >= 80 ? 'warning' : ''}`}
                style={{ width: `${clamp(displayPercentage, 0, 100)}%` }}
              />
            </div>

            {/* Today: Quick add grid */}
            {view === 'today' ? (
              <div className="quick-grid">
                {SECTORS.map((sector) => {
                  const Icon = sectorIcons[sector.id];
                  return (
                    <button key={sector.id} className="quick-grid-btn" onClick={() => onQuickAdd(sector.id)}>
                      <Icon size={19} />
                      <span>{sector.shortLabel}</span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Week/Month: Category scroll strip */
              <div className="category-scroll">
                {activeStats.bySector.map((item) => {
                  const sector = getSector(item.sector);
                  const Icon = sectorIcons[item.sector];
                  const percent = getPercentage(item.amount, item.budget);
                  const left = item.budget - item.amount;

                  return (
                    <button key={item.sector} className="category-chip" onClick={() => onQuickAdd(item.sector)}>
                      <div className="category-chip-icon" style={{ color: sector.color }}>
                        <Icon size={18} />
                      </div>
                      <span className="category-chip-name">{sector.shortLabel}</span>
                      <span className="category-chip-amount">{formatCurrency(item.amount)}</span>
                      <div className="category-chip-bar">
                        <div
                          className={`category-chip-bar-fill ${percent >= 100 ? 'danger' : percent >= 80 ? 'warning' : ''}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Investing Widget */}
          <InvestingWidget monthlyRemaining={monthlyRemaining || 0} />
        </>
      ) : null}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   History Panel
   ═══════════════════════════════════════════ */
const HistoryPanel = ({ expenses, allExpenses, monthlyStats, weeklyStats, onEdit, onDelete, onCategoryClick, selectedDate }) => {
  const [showAll, setShowAll] = useState(false);
  const displayExpenses = showAll ? allExpenses : expenses;
  const sortedExpenses = [...displayExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group by date
  const grouped = React.useMemo(() => {
    const groups = {};
    sortedExpenses.forEach(exp => {
      const dateKey = new Date(exp.date).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(exp);
    });
    return Object.entries(groups);
  }, [sortedExpenses]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Weekly Bars */}
      <WeeklyBars stats={weeklyStats} selectedDate={selectedDate} />

      {/* Category Breakdown button */}
      <button className="surface-card" onClick={onCategoryClick} style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', border: 'none', color: 'inherit', width: '100%', textAlign: 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center',
            background: 'var(--accent-soft)', color: 'var(--accent)',
          }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <strong style={{ fontSize: '0.9rem' }}>Category Breakdown</strong>
            <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', margin: '2px 0 0' }}>Analyze spending by sector</p>
          </div>
        </div>
        <ChevronRight size={20} style={{ color: 'var(--text-3)' }} />
      </button>

      {/* Transaction history */}
      <div className="surface-card" style={{ padding: 20 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <p className="section-eyebrow">Transaction Log</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 className="section-title" style={{ fontSize: '1rem' }}>History</h3>
              <div className="seg-tabs" style={{ display: 'inline-flex', minHeight: 0, padding: 2, gap: 2 }}>
                <button
                  className={`seg-tab ${!showAll ? 'active' : ''}`}
                  onClick={() => setShowAll(false)}
                  style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                >
                  {!isToday(selectedDate) ? 'This Day' : 'Recent'}
                </button>
                <button
                  className={`seg-tab ${showAll ? 'active' : ''}`}
                  onClick={() => setShowAll(true)}
                  style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                >
                  All Time
                </button>
              </div>
            </div>
          </div>
          <span className="section-badge">{sortedExpenses.length} entries</span>
        </div>

        {sortedExpenses.length === 0 ? (
          <div className="empty-state">
            <Receipt size={32} />
            <strong>No history yet</strong>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {grouped.map(([dateKey, dateExpenses]) => (
              <div className="transaction-group" key={dateKey}>
                <div className="transaction-group-date">{formatDate(new Date(dateKey))}</div>
                {dateExpenses.map((expense) => {
                  const sector = getSector(expense.sector);
                  const Icon = sectorIcons[expense.sector] || Paperclip;
                  return (
                    <div className="transaction-row" key={expense.id}>
                      <div className="transaction-row-icon" style={{ color: sector.color, background: `${sector.color}18` }}>
                        <Icon size={16} />
                      </div>
                      <button className="transaction-row-info" onClick={() => onEdit(expense)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', textAlign: 'left', flex: 1, padding: 0 }}>
                        <strong>{sector.shortLabel}</strong>
                        <small>{expense.note || 'No note'}</small>
                      </button>
                      <div className="transaction-row-amount">
                        <strong>-{formatCurrency(expense.amount)}</strong>
                      </div>
                      <div className="transaction-actions">
                        <button className="btn-icon danger" onClick={() => onDelete(expense.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Weekly Bars
   ═══════════════════════════════════════════ */
const WeeklyBars = ({ stats, selectedDate }) => {
  const targetDate = selectedDate || new Date();
  const days = getDaysInWeek(getWeekStart(targetDate));
  const getDayTotal = (day) =>
    stats.expenses
      .filter((expense) => new Date(expense.date).toDateString() === day.toDateString())
      .reduce((sum, expense) => sum + expense.amount, 0);
  const max = Math.max(...days.map(getDayTotal), 1);

  return (
    <div className="surface-card" style={{ padding: 20 }}>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <p className="section-eyebrow">Week rhythm</p>
          <h3 className="section-title" style={{ fontSize: '1rem' }}>Daily breakdown</h3>
        </div>
        <span className="section-badge">
          {formatDate(getWeekStart(targetDate))} – {formatDate(getWeekEnd(targetDate))}
        </span>
      </div>
      <div className="weekly-bars">
        {days.map((day) => {
          const total = getDayTotal(day);
          const height = Math.max(8, (total / max) * 100);
          return (
            <div className="day-bar-wrap" key={formatDateISO(day)}>
              <div className="bar-value">{total > 0 ? formatCurrency(total, { compact: true }) : '-'}</div>
              <div
                className={`day-bar ${isToday(day) ? 'today' : ''} ${isWeekend(day) ? 'weekend' : ''}`}
                style={{ height: `${height}%` }}
              />
              <span className="bar-label">{getDayName(day)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   Add Expense Modal
   ═══════════════════════════════════════════ */
export const AddExpenseModal = ({ isOpen, onClose, onSave, defaultSector, editingExpense, selectedDate }) => {
  const [amount, setAmount] = useState('');
  const [sector, setSector] = useState(defaultSector || 'groceries');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatDateISO(new Date()));

  useEffect(() => {
    if (!isOpen) return;
    setAmount(editingExpense ? String(editingExpense.amount) : '');
    setSector(editingExpense?.sector || defaultSector || 'groceries');
    setNote(editingExpense?.note || '');
    setDate(editingExpense ? formatDateISO(new Date(editingExpense.date)) : formatDateISO(selectedDate || new Date()));
  }, [defaultSector, editingExpense, isOpen, selectedDate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsed = parseCurrencyInput(amount);
    if (parsed <= 0) return;
    onSave({ amount: parsed, sector, note, date: getDateFromISO(date) });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal-sheet"
            onClick={e => e.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="modal-sheet-handle" />
            <div className="modal-sheet-header">
              <h2 className="modal-sheet-title">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
              <button className="btn-icon" onClick={onClose}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Sector picker */}
              <div className="selector-grid" role="radiogroup" aria-label="Expense category">
                {SECTORS.map((item) => {
                  const Icon = sectorIcons[item.id] || Paperclip;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`selector-grid-item ${sector === item.id ? 'active' : ''}`}
                      onClick={() => setSector(item.id)}
                    >
                      <Icon size={20} />
                      <span>{item.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">Amount</label>
                <div className="amount-input">
                  <span>₹</span>
                  <input
                    inputMode="decimal"
                    type="number"
                    min="0"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Note */}
              <div className="form-group">
                <label className="form-label">Note</label>
                <input className="form-input" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tea, petrol, vegetables..." />
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <button className="btn-primary" type="submit" style={{ width: '100%' }}>
                <IndianRupee size={18} />
                {editingExpense ? 'Save Changes' : 'Add Expense'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════
   Settings Modal
   ═══════════════════════════════════════════ */
export const SettingsModal = ({ isOpen, onClose, budgets, onUpdateBudget, weeklyTarget, onUpdateWeeklyTarget, monthlyTarget, onUpdateMonthlyTarget, onSignOut, userName, userEmail }) => {
  const [draft, setDraft] = useState(budgets);
  const [draftWeekly, setDraftWeekly] = useState(weeklyTarget || 0);
  const [draftMonthly, setDraftMonthly] = useState(monthlyTarget || 0);

  useEffect(() => {
    if (isOpen) {
      setDraft(budgets);
      setDraftWeekly(weeklyTarget || 0);
      setDraftMonthly(monthlyTarget || 0);
    }
  }, [budgets, weeklyTarget, monthlyTarget, isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    SECTORS.forEach((sector) => onUpdateBudget(sector.id, draft[sector.id]));
    if (onUpdateWeeklyTarget) onUpdateWeeklyTarget(draftWeekly);
    if (onUpdateMonthlyTarget) onUpdateMonthlyTarget(draftMonthly);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal-sheet"
            onClick={e => e.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="modal-sheet-handle" />
            <div className="modal-sheet-header">
              <h2 className="modal-sheet-title">Settings</h2>
              <button className="btn-icon" onClick={onClose}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                Set monthly budgets. You can either set individual category targets OR a total monthly estimation.
              </p>

              {/* Monthly Budget Estimation */}
              <div className="surface-card" style={{ padding: 16 }}>
                <p className="section-eyebrow" style={{ marginBottom: 12 }}>Monthly Budget Estimation</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PiggyBank size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Total Monthly Target</span>
                  </div>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="500"
                    value={draftMonthly}
                    onChange={(e) => setDraftMonthly(parseCurrencyInput(e.target.value))}
                    style={{ width: 120, textAlign: 'right' }}
                  />
                </div>
                <p style={{ color: 'var(--text-3)', fontSize: '0.72rem', marginTop: 8, marginBottom: 0 }}>
                  If set, this overrides the sum of category budgets for monthly pace.
                </p>
              </div>

              {/* Weekly Target */}
              <div className="surface-card" style={{ padding: 16 }}>
                <p className="section-eyebrow" style={{ marginBottom: 12 }}>Weekly Target</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Target size={18} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Explicit Weekly Target</span>
                  </div>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="100"
                    value={draftWeekly}
                    onChange={(e) => setDraftWeekly(parseCurrencyInput(e.target.value))}
                    style={{ width: 120, textAlign: 'right' }}
                  />
                </div>
              </div>

              {/* Per-category budgets */}
              <div className="surface-card" style={{ padding: 16 }}>
                <p className="section-eyebrow" style={{ marginBottom: 12 }}>Monthly Category Budgets</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {SECTORS.map((sector) => {
                    const Icon = sectorIcons[sector.id] || Paperclip;
                    return (
                      <div key={sector.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Icon size={18} style={{ color: sector.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.85rem' }}>{sector.label}</span>
                        </div>
                        <input
                          className="form-input"
                          type="number"
                          min="0"
                          step="100"
                          value={draft[sector.id] ?? 0}
                          onChange={(e) => setDraft((current) => ({ ...current, [sector.id]: parseCurrencyInput(e.target.value) }))}
                          style={{ width: 100, textAlign: 'right' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <button className="btn-primary" type="submit" style={{ width: '100%' }}>
                <Check size={18} />
                Save Settings
              </button>
            </form>

            {/* User Profile & Sign Out */}
            {onSignOut && (
              <div className="surface-card" style={{ padding: 16, marginTop: 16 }}>
                <p className="section-eyebrow" style={{ marginBottom: 12 }}>Account</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{userName || 'User'}</p>
                    {userEmail && <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', margin: '2px 0 0' }}>{userEmail}</p>}
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={onSignOut}
                    style={{ padding: '0 16px', minHeight: 38, fontSize: '0.8rem', color: 'var(--rose)', borderColor: 'var(--rose)' }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
