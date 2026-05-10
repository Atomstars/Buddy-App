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
}) => {
  const [budgetPanel, setBudgetPanel] = useState('today');
  const displayTotal = view === 'today' ? todayStats.total : activeStats.total;
  const displayPercentage = view === 'today' ? 0 : activeStats.percentage;
  const categoryPeriod = view === 'month' ? 'month' : 'week';

  return (
    <motion.div className="module-stack" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <section className="budget-stage">
        <div className="budget-tabs" aria-label="Budget sections">
          {[
            ['goals', 'Goals'],
            ['today', "Today's Budget"],
            ['widgets', 'Widgets'],
          ].map(([id, label]) => (
            <button key={id} className={budgetPanel === id ? 'active' : ''} onClick={() => setBudgetPanel(id)}>
              {label}
            </button>
          ))}
        </div>

        {budgetPanel === 'goals' ? (
          <GoalsPanel
            goals={goals}
            goalSummary={goalSummary}
            monthlyRemaining={monthlyRemaining}
            onAddGoal={onAddGoal}
            onFundGoal={onFundGoal}
            onDeleteGoal={onDeleteGoal}
          />
        ) : null}

        {budgetPanel === 'today' ? (
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

        {budgetPanel === 'widgets' ? (
          <InsightPanel coach={coach} weeklyStats={weeklyStats} monthlyStats={monthlyStats} />
        ) : null}
      </section>

      {budgetPanel === 'today' && view === 'week' ? <WeeklyBars stats={weeklyStats} /> : null}
      <Transactions expenses={expenses} onEdit={onEdit} onDelete={onDelete} />
    </motion.div>
  );
};

const GoalsPanel = ({ goals, goalSummary, monthlyRemaining, onAddGoal, onFundGoal, onDeleteGoal }) => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [fundingGoal, setFundingGoal] = useState(null);
  const overallPercent = getPercentage(goalSummary.saved, goalSummary.target);
  const monthStart = getMonthStart();
  const transferredThisMonth = goals.reduce(
    (sum, goal) =>
      sum +
      goal.entries
        .filter((entry) => entry.source === 'monthly-remaining' && new Date(entry.date) >= monthStart)
        .reduce((entrySum, entry) => entrySum + entry.amount, 0),
    0
  );
  const availableMonthly = Math.max(0, monthlyRemaining - transferredThisMonth);

  return (
    <section className="goals-panel">
      <div className="goals-hero">
        <div>
          <p className="eyebrow">Savings goals</p>
          <h2>{formatCurrency(goalSummary.saved)} saved</h2>
          <p>
            {goalSummary.count} active {goalSummary.count === 1 ? 'goal' : 'goals'} • {formatCurrency(goalSummary.remaining)} left
          </p>
        </div>
        <div className="goal-ring">
          <span>{overallPercent}%</span>
          <small>funded</small>
        </div>
      </div>

      <div className="goal-actions">
        <button className="primary-button inline" onClick={() => setShowGoalModal(true)}>
          <Plus size={18} />
          Add goal
        </button>
        <div>
          <strong>{formatCurrency(availableMonthly)}</strong>
          <span>available from this month</span>
        </div>
      </div>

      <div className="goal-grid">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            monthlyRemaining={availableMonthly}
            onFund={() => setFundingGoal(goal)}
            onFundFromRemaining={() => {
              const need = Math.max(0, goal.targetAmount - goal.currentAmount);
              onFundGoal(goal.id, Math.min(availableMonthly, need), 'monthly-remaining');
            }}
            onDelete={() => onDeleteGoal(goal.id)}
          />
        ))}
      </div>

      <GoalModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} onSave={onAddGoal} />
      <FundGoalModal
        goal={fundingGoal}
        isOpen={Boolean(fundingGoal)}
        onClose={() => setFundingGoal(null)}
        onSave={(amount) => onFundGoal(fundingGoal.id, amount, 'manual')}
      />
    </section>
  );
};

const GoalCard = ({ goal, monthlyRemaining, onFund, onFundFromRemaining, onDelete }) => {
  const percent = getPercentage(goal.currentAmount, goal.targetAmount);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const daysLeft = Math.max(1, Math.ceil((new Date(goal.deadline) - new Date()) / 86400000));
  const perDay = remaining / daysLeft;

  return (
    <article className="goal-card">
      <div className="goal-card-head">
        <span className="goal-icon">
          <PiggyBank size={21} />
        </span>
        <div>
          <h3>{goal.title}</h3>
          <p>Target {formatCurrency(goal.targetAmount)} by {formatDate(new Date(goal.deadline))}</p>
        </div>
        <IconButton label="Delete goal" className="danger" onClick={onDelete}>
          <Trash2 size={16} />
        </IconButton>
      </div>
      <ProgressBar value={percent} tone={percent >= 100 ? 'normal' : percent < 35 ? 'watch' : 'normal'} />
      <div className="goal-card-stats">
        <div>
          <span>Saved</span>
          <strong>{formatCurrency(goal.currentAmount)}</strong>
        </div>
        <div>
          <span>Needed/day</span>
          <strong>{formatCurrency(perDay)}</strong>
        </div>
      </div>
      <div className="goal-card-actions">
        <button onClick={onFund}>Manual add</button>
        <button disabled={monthlyRemaining <= 0 || remaining <= 0} onClick={onFundFromRemaining}>
          Move remaining
        </button>
      </div>
    </article>
  );
};

const GoalModal = ({ isOpen, onClose, onSave }) => {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState(formatDateISO(nextMonth));

  useEffect(() => {
    if (!isOpen) return;
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline(formatDateISO(nextMonth));
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const target = parseCurrencyInput(targetAmount);
    if (!title.trim() || target <= 0) return;
    onSave({
      title,
      targetAmount: target,
      currentAmount: parseCurrencyInput(currentAmount),
      deadline,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add savings goal">
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="field-label">
          Goal name
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Car, phone, trip..." autoFocus />
        </label>
        <label className="field-label">
          Target amount
          <input type="number" min="0" step="100" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} placeholder="30000" />
        </label>
        <label className="field-label">
          Already saved
          <input type="number" min="0" step="100" value={currentAmount} onChange={(event) => setCurrentAmount(event.target.value)} placeholder="0" />
        </label>
        <label className="field-label">
          Deadline
          <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
        </label>
        <button className="primary-button" type="submit">
          <PiggyBank size={19} />
          Create goal
        </button>
      </form>
    </Modal>
  );
};

const FundGoalModal = ({ goal, isOpen, onClose, onSave }) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) setAmount('');
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsed = parseCurrencyInput(amount);
    if (parsed <= 0) return;
    onSave(parsed);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add savings${goal ? ` to ${goal.title}` : ''}`}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="field-label">
          Amount saved
          <span className="amount-field">
            <span>₹</span>
            <input inputMode="decimal" type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" autoFocus />
          </span>
        </label>
        <button className="primary-button" type="submit">
          <IndianRupee size={19} />
          Add to goal
        </button>
      </form>
    </Modal>
  );
};

const InsightPanel = ({ coach, weeklyStats, monthlyStats }) => {
  const biggestLabel = getSectorShortLabel(coach.biggestSector?.sector);
  const biggestAmount = coach.biggestSector?.amount || 0;
  const dailyAverage = monthlyStats.total / getDaysPassedInclusive(getMonthStart());
  const riskLabel = coach.riskSector ? getSectorShortLabel(coach.riskSector.sector) : null;

  const insights = [
    {
      icon: BarChart3,
      label: 'Biggest this week',
      value: biggestAmount > 0 ? `${biggestLabel} at ${formatCurrency(biggestAmount)}` : 'No spending yet',
    },
    {
      icon: coach.monthlyPace === 'over' ? TrendingUp : TrendingDown,
      label: 'Monthly pace',
      value: `${formatCurrency(coach.monthProjection)} projected`,
    },
    {
      icon: Target,
      label: 'Daily average',
      value: `${formatCurrency(dailyAverage)} this month`,
    },
    {
      icon: riskLabel ? Coffee : ShieldCheck,
      label: riskLabel ? 'Category watch' : 'Category health',
      value: riskLabel ? `${riskLabel} may cross its budget` : 'No category risk right now',
    },
  ];

  return (
    <section className="section-block">
      <div className="section-title">
        <div>
          <p className="eyebrow">Smart insights</p>
          <h2>Signals that matter</h2>
        </div>
        <span>{weeklyStats.expenses.length} week entries</span>
      </div>
      <div className="insight-grid">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div className="insight-card" key={insight.label}>
              <Icon size={19} />
              <span>{insight.label}</span>
              <strong>{insight.value}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const WeeklyBars = ({ stats }) => {
  const days = getDaysInWeek(getWeekStart());
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
        <span>{formatDate(getWeekStart())} to {formatDate(getWeekEnd())}</span>
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

const Transactions = ({ expenses, onEdit, onDelete }) => (
  <section className="section-block">
    <div className="section-title">
      <div>
        <p className="eyebrow">Recent</p>
        <h2>Transactions</h2>
      </div>
      <span>{expenses.length} total</span>
    </div>
    {expenses.length === 0 ? (
      <div className="empty-state">
        <IndianRupee size={32} />
        <strong>No expenses yet</strong>
        <p>Tap plus to log your first one, or mark today as no-spend.</p>
      </div>
    ) : (
      <div className="transaction-list">
        {expenses.slice(0, 8).map((expense) => {
          const sector = getSector(expense.sector);
          const Icon = sectorIcons[expense.sector];
          const date = new Date(expense.date);
          return (
            <article className="transaction-item" key={expense.id}>
              <button className="transaction-main" onClick={() => onEdit(expense)}>
                <span className="transaction-icon" style={{ color: sector.color, backgroundColor: `${sector.color}18` }}>
                  <Icon size={18} />
                </span>
                <span className="transaction-copy">
                  <strong>{sector.shortLabel}</strong>
                  <small>{expense.note || (isToday(date) ? 'Today' : formatDate(date))}</small>
                </span>
                <span className="transaction-amount">
                  <strong>-{formatCurrency(expense.amount)}</strong>
                  <small>{isToday(date) ? 'Today' : formatDate(date)}</small>
                </span>
              </button>
              <div className="transaction-actions">
                <IconButton label="Edit transaction" onClick={() => onEdit(expense)}>
                  <Pencil size={16} />
                </IconButton>
                <IconButton label="Delete transaction" className="danger" onClick={() => onDelete(expense.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </article>
          );
        })}
      </div>
    )}
  </section>
);

export const AddExpenseModal = ({ isOpen, onClose, onSave, defaultSector, editingExpense }) => {
  const [amount, setAmount] = useState('');
  const [sector, setSector] = useState(defaultSector || 'groceries');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setAmount(editingExpense ? String(editingExpense.amount) : '');
    setSector(editingExpense?.sector || defaultSector || 'groceries');
    setNote(editingExpense?.note || '');
  }, [defaultSector, editingExpense, isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsed = parseCurrencyInput(amount);
    if (parsed <= 0) return;
    onSave({ amount: parsed, sector, note });
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
