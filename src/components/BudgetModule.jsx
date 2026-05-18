import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CalendarCheck,
  Check,
  ChevronRight,
  Coffee,
  IndianRupee,
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
} from 'lucide-react';
import { IconButton, Modal, ProgressBar } from './common';
import { CategoryInsights } from './CategoryInsights';
import { AnalyticsPanel } from './AnalyticsPanel';
import { viewLabels, getDaysPassedInclusive } from '../utils/assistantLogic';
import {
  SECTORS,
  formatCurrency,
  getPercentage,
  getSector,
  getSectorShortLabel,
  parseCurrencyInput,
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

const CategoryCard = ({ item, period, onQuickAdd }) => {
  const sector = getSector(item.sector);
  const Icon = sectorIcons[item.sector];
  const percent = getPercentage(item.amount, item.budget);
  const tone = percent >= 100 ? 'danger' : percent >= 80 ? 'watch' : 'normal';
  const left = item.budget - item.amount;

  return (
    <button className="category-card" onClick={() => onQuickAdd(item.sector)}>
      <div className="category-head">
        <div className="category-icon" style={{ color: sector.color, backgroundColor: `${sector.color}18` }}>
          <Icon size={21} />
        </div>
        <div>
          <h3>{sector.label}</h3>
          <p>{item.count} {item.count === 1 ? 'entry' : 'entries'} this {period}</p>
        </div>
        <Plus size={18} className="category-plus" />
      </div>
      <div className="category-money">
        <strong>{formatCurrency(item.amount)}</strong>
        <span>of {formatCurrency(item.budget)}</span>
      </div>
      <ProgressBar value={percent} tone={tone} />
      <div className="category-foot">
        <span>{percent}% used</span>
        <span className={left < 0 ? 'danger-text' : ''}>
          {left < 0 ? `${formatCurrency(Math.abs(left))} over` : `${formatCurrency(left)} left`}
        </span>
      </div>
    </button>
  );
};

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

  return (
    <motion.div className="module-stack" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <section className="budget-stage">
        {isToday(selectedDate) && (
          <div className="budget-tabs" aria-label="Budget sections">
            {[
              ['history', 'History'],
              ['today', "Budget"],
              ['analytics', 'Data Insights'],
            ].map(([id, label]) => (
              <button key={id} className={budgetPanel === id ? 'active' : ''} onClick={() => {
                setBudgetPanel(id);
                if (id === 'history' && view === 'categories') {
                  setView('week'); // Reset view when navigating to history
                }
              }}>
                {label}
              </button>
            ))}
          </div>
        )}

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

        {(budgetPanel === 'analytics' && isToday(selectedDate)) ? (
          <AnalyticsPanel expenses={expenses} selectedDate={selectedDate} />
        ) : null}

        {(budgetPanel === 'today' && isToday(selectedDate)) ? (
          <section className="section-block priority-budget">
            <div className="segmented-control" aria-label="Budget view" style={{ marginBottom: '16px' }}>
              {Object.entries(viewLabels).map(([id, label]) => (
                <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="section-title">
              <div>
                <p className="eyebrow">{viewLabels[view]} budget</p>
                <h2>{formatCurrency(displayTotal)} spent</h2>
              </div>
              <span>{view === 'today' ? `${todayStats.count} entries` : `${displayPercentage}% used`}</span>
            </div>
            <ProgressBar
              value={displayPercentage}
              tone={displayPercentage >= 100 ? 'danger' : displayPercentage >= 80 ? 'watch' : 'normal'}
            />
            {view === 'today' ? (
              <div className="quick-grid">
                {SECTORS.map((sector) => {
                  const Icon = sectorIcons[sector.id];
                  return (
                    <button key={sector.id} onClick={() => onQuickAdd(sector.id)}>
                      <Icon size={19} />
                      <span>{sector.shortLabel}</span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="category-grid">
                {activeStats.bySector.map((item) => (
                  <CategoryCard key={item.sector} item={item} period={categoryPeriod} onQuickAdd={onQuickAdd} />
                ))}
              </div>
            )}
          </section>
        ) : null}

      </section>
    </motion.div>
  );
};

const HistoryPanel = ({ expenses, allExpenses, monthlyStats, weeklyStats, onEdit, onDelete, onCategoryClick, selectedDate }) => {
  const [showAll, setShowAll] = useState(false);
  const displayExpenses = showAll ? allExpenses : expenses;
  const sortedExpenses = [...displayExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <section className="history-panel animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
         <WeeklyBars stats={weeklyStats} selectedDate={selectedDate} />
      </div>

      <button className="category-summary-btn" onClick={onCategoryClick}>
        <div className="category-summary-left">
          <div className="category-summary-icon">
            <BarChart3 size={20} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <strong>Category Breakdown</strong>
            <p>Analyze spending by sector</p>
          </div>
        </div>
        <ChevronRight size={20} />
      </button>

      <div className="section-block" style={{ marginTop: '24px' }}>
        <div className="section-title">
          <div>
            <p className="eyebrow">Transaction Log</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2>History</h2>
              <select 
                value={showAll ? 'all' : 'period'} 
                onChange={(e) => setShowAll(e.target.value === 'all')}
                className="analytics-select"
                style={{ fontSize: '0.8rem', padding: '4px 24px 4px 8px', height: 'auto', background: 'var(--panel-strong)' }}
              >
                <option value="period">{!isToday(selectedDate) ? 'This Day' : 'Recent'}</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          <span>{sortedExpenses.length} entries</span>
        </div>
        
        {sortedExpenses.length === 0 ? (
          <div className="empty-state">
            <Receipt size={32} />
            <strong>No history yet</strong>
          </div>
        ) : (
          <div className="transaction-list">
            {sortedExpenses.map((expense) => {
              const sector = getSector(expense.sector);
              const Icon = sectorIcons[expense.sector] || Paperclip;
              const date = new Date(expense.date);
              return (
                <article className="transaction-item" key={expense.id}>
                  <button className="transaction-main" onClick={() => onEdit(expense)}>
                    <span className="transaction-icon" style={{ color: sector.color, backgroundColor: `${sector.color}18`, padding: '8px', borderRadius: '50%' }}>
                      <Icon size={18} />
                    </span>
                    <span className="transaction-copy">
                      <strong>{sector.shortLabel}</strong>
                      <small>{expense.note || 'No note'}</small>
                    </span>
                    <span className="transaction-amount" style={{ textAlign: 'right' }}>
                      <strong>-{formatCurrency(expense.amount)}</strong>
                      <small>{formatDate(date)}</small>
                    </span>
                  </button>
                  <div className="transaction-actions">
                    <IconButton label="Delete transaction" className="danger" onClick={() => onDelete(expense.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const WeeklyBars = ({ stats, selectedDate }) => {
  const targetDate = selectedDate || new Date();
  const days = getDaysInWeek(getWeekStart(targetDate));
  const getDayTotal = (day) =>
    stats.expenses
      .filter((expense) => new Date(expense.date).toDateString() === day.toDateString())
      .reduce((sum, expense) => sum + expense.amount, 0);
  const max = Math.max(...days.map(getDayTotal), 1);

  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">Week rhythm</p>
          <h2>Daily breakdown</h2>
        </div>
        <span>{formatDate(getWeekStart(targetDate))} to {formatDate(getWeekEnd(targetDate))}</span>
      </div>
      <div className="weekly-bars">
        {days.map((day) => {
          const total = getDayTotal(day);
          const height = Math.max(8, (total / max) * 100);
          return (
            <div className="day-bar-wrap" key={formatDateISO(day)}>
              <div
                className={`day-bar ${isToday(day) ? 'today' : ''} ${isWeekend(day) ? 'weekend' : ''}`}
                style={{ height: `${height}%` }}
              />
              <span>{getDayName(day)}</span>
              <small>{total > 0 ? formatCurrency(total, { compact: true }) : '-'}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
};

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
    <Modal isOpen={isOpen} onClose={onClose} title={editingExpense ? 'Edit expense' : 'Add expense'}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="sector-picker" role="radiogroup" aria-label="Expense category">
          {SECTORS.map((item) => {
            const Icon = sectorIcons[item.id] || Paperclip;
            return (
              <button type="button" key={item.id} className={sector === item.id ? 'selected' : ''} onClick={() => setSector(item.id)}>
                <Icon size={20} />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
        <label className="field-label">
          Amount
          <span className="amount-field">
            <span>₹</span>
            <input inputMode="decimal" type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" autoFocus />
          </span>
        </label>
        <label className="field-label">
          Note
          <input type="text" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tea, petrol, vegetables..." />
        </label>
        <label className="field-label">
          Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button className="primary-button" type="submit">
          <IndianRupee size={19} />
          {editingExpense ? 'Save changes' : 'Add expense'}
        </button>
      </form>
    </Modal>
  );
};

export const SettingsModal = ({ isOpen, onClose, budgets, onUpdateBudget, weeklyTarget, onUpdateWeeklyTarget, monthlyTarget, onUpdateMonthlyTarget }) => {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <form className="modal-form" onSubmit={handleSubmit}>
        <p className="settings-note">Set monthly budgets. You can either set individual category targets OR a total monthly estimation.</p>
        
        <div className="settings-section">
          <p className="eyebrow" style={{ marginTop: '16px' }}>Monthly Budget Estimation</p>
          <label className="budget-row">
            <span>
              <PiggyBank size={18} />
              Total Monthly Target
            </span>
            <input
              type="number"
              min="0"
              step="500"
              value={draftMonthly}
              onChange={(event) => setDraftMonthly(parseCurrencyInput(event.target.value))}
            />
          </label>
          <p className="settings-note" style={{ marginTop: '4px', fontSize: '0.75rem' }}>If set, this overrides the sum of category budgets for monthly pace.</p>
        </div>

        <div className="settings-section" style={{ marginTop: '16px' }}>
          <p className="eyebrow">Weekly Target</p>
          <label className="budget-row">
            <span>
              <Target size={18} />
              Explicit Weekly Target
            </span>
            <input
              type="number"
              min="0"
              step="100"
              value={draftWeekly}
              onChange={(event) => setDraftWeekly(parseCurrencyInput(event.target.value))}
            />
          </label>
        </div>

        <div className="settings-section" style={{ marginTop: '16px' }}>
          <p className="eyebrow">Monthly Category Budgets</p>
          {SECTORS.map((sector) => {
            const Icon = sectorIcons[sector.id] || Paperclip;
            return (
              <label className="budget-row" key={sector.id}>
              <span>
                <Icon size={18} />
                {sector.label}
              </span>
              <input
                type="number"
                min="0"
                step="100"
                value={draft[sector.id] ?? 0}
                onChange={(event) => setDraft((current) => ({ ...current, [sector.id]: parseCurrencyInput(event.target.value) }))}
              />
            </label>
            );
          })}
        </div>
        <button className="primary-button" type="submit" style={{ marginTop: '16px' }}>
          <Check size={19} />
          Save settings
        </button>
      </form>
    </Modal>
  );
};
