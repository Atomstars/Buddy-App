import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Apple,
  ArrowDownRight,
  ArrowUpRight,
  CarFront,
  Check,
  IndianRupee,
  LogOut,
  Paperclip,
  PiggyBank,
  Plus,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Target,
  UtensilsCrossed,
  WalletCards,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SECTORS, formatCurrency, parseCurrencyInput } from '../utils/formatters';
import { formatDateISO, getDateFromISO } from '../utils/dateUtils';

const sectorIcons = {
  groceries: ShoppingCart,
  fruits: Apple,
  food: UtensilsCrossed,
  transport: CarFront,
  shopping: ShoppingBag,
  bills: Receipt,
  fun: Sparkles,
  other: Paperclip,
};

const analyticsWindows = ['1D', '2D', '1W', '1M'];
const quickCategories = ['food', 'shopping', 'bills', 'transport'];

const GlassCard = ({ children, className = '' }) => (
  <div className={`rounded-[28px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30 backdrop-blur-2xl ${className}`}>
    {children}
  </div>
);

const buildChartData = (expenses, windowId) => {
  const points = windowId === '1D' ? 8 : windowId === '2D' ? 10 : windowId === '1W' ? 7 : 12;
  const bucketTotals = Array.from({ length: points }, (_, index) => ({
    label: windowId === '1M' ? `W${index + 1}` : index % 2 === 0 ? `${index + 8}:00` : '',
    spend: 0,
  }));

  expenses.forEach((expense, index) => {
    const target = index % points;
    bucketTotals[target].spend += Number(expense.amount) || 0;
  });

  if (!expenses.length) {
    return bucketTotals.map((item, index) => ({ ...item, spend: [900, 600, 1200, 840, 1560, 980, 1320, 720, 1100, 1480, 860, 1250][index] || 700 }));
  }

  return bucketTotals;
};

export const BudgetModule = ({
  monthlyStats,
  todayStats,
  expenses,
  selectedDate,
  onQuickAdd,
  onQuickLog,
}) => {
  const [amount, setAmount] = useState('');
  const [range, setRange] = useState('1W');
  const chartData = useMemo(() => buildChartData(monthlyStats?.expenses || expenses || [], range), [expenses, monthlyStats?.expenses, range]);
  const monthlyTotal = monthlyStats?.total || 0;
  const totalBudget = monthlyStats?.totalBudget || 0;
  const balance = Math.max(0, totalBudget - monthlyTotal);

  const handleQuickLog = (sector) => {
    const parsed = parseCurrencyInput(amount);
    if (parsed > 0 && onQuickLog) {
      onQuickLog(parsed, sector);
      setAmount('');
      return;
    }
    onQuickAdd?.(sector);
  };

  return (
    <motion.section
      className="flex flex-col gap-6 pb-32"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pt-2">
        <p className="text-sm font-medium text-zinc-400">Monthly Balance</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <h2 className="text-[3.6rem] font-black leading-none tracking-tight text-white sm:text-7xl">
            {formatCurrency(balance, { compact: true })}
          </h2>
          <div className="mb-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            {Math.max(0, 100 - (monthlyStats?.percentage || 0))}% free
          </div>
        </div>
        <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
          {selectedDate?.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} spending control center.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Spent Today</span>
            <span className="rounded-full bg-rose-500/10 p-2 text-rose-300">
              <ArrowDownRight size={17} />
            </span>
          </div>
          <p className="mt-5 text-2xl font-bold tracking-tight text-white">{formatCurrency(todayStats?.total || 0)}</p>
          <p className="mt-1 text-xs text-zinc-500">{todayStats?.count || 0} transactions</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Remaining</span>
            <span className="rounded-full bg-emerald-400/10 p-2 text-emerald-300">
              <ArrowUpRight size={17} />
            </span>
          </div>
          <p className="mt-5 text-2xl font-bold tracking-tight text-white">{formatCurrency(balance)}</p>
          <p className="mt-1 text-xs text-zinc-500">Monthly runway</p>
        </GlassCard>
      </div>

      <div className="sticky top-[76px] z-20 -mx-1 rounded-[30px] border border-white/10 bg-zinc-950/80 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.045] px-4 py-3">
          <IndianRupee className="text-zinc-500" size={18} />
          <input
            className="min-w-0 flex-1 bg-transparent text-lg font-bold text-white placeholder:text-zinc-600"
            inputMode="decimal"
            type="number"
            min="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Quick add amount"
          />
          <button
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-zinc-950 shadow-lg shadow-white/10"
            onClick={() => handleQuickLog('food')}
            type="button"
            title="Add expense"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {quickCategories.map((sector) => {
            const sectorMeta = SECTORS.find((item) => item.id === sector);
            const Icon = sectorIcons[sector] || Paperclip;

            return (
              <motion.button
                key={sector}
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-semibold text-zinc-200"
                whileTap={{ scale: 0.94 }}
                onClick={() => handleQuickLog(sector)}
                type="button"
              >
                <Icon size={15} style={{ color: sectorMeta?.color }} />
                {sectorMeta?.shortLabel}
              </motion.button>
            );
          })}
        </div>
      </div>

      <GlassCard className="overflow-hidden p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Dynamic Analytics</p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-white">Spend Velocity</h3>
          </div>
          <div className="flex rounded-full border border-white/10 bg-zinc-950/70 p-1">
            {analyticsWindows.map((item) => (
              <button
                key={item}
                className={`relative rounded-full px-3 py-1.5 text-xs font-bold ${range === item ? 'text-zinc-950' : 'text-zinc-500'}`}
                onClick={() => setRange(item)}
                type="button"
              >
                {range === item && (
                  <motion.span
                    layoutId="budget-range"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                  />
                )}
                <span className="relative">{item}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 4, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="spendGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.44} />
                  <stop offset="48%" stopColor="#22d3ee" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#09090b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.18)' }}
                contentStyle={{
                  background: 'rgba(24,24,27,0.92)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16,
                  color: '#fff',
                }}
                formatter={(value) => [formatCurrency(value), 'Spend']}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#67e8f9"
                strokeWidth={3}
                fill="url(#spendGlow)"
                dot={false}
                activeDot={{ r: 5, fill: '#fff', stroke: '#67e8f9', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.section>
  );
};

export const AddExpenseModal = ({ isOpen, onClose, onSave, defaultSector, editingExpense, selectedDate }) => {
  const [amount, setAmount] = useState('');
  const [sector, setSector] = useState(defaultSector || 'food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatDateISO(new Date()));

  useEffect(() => {
    if (!isOpen) return;
    setAmount(editingExpense ? String(editingExpense.amount) : '');
    setSector(editingExpense?.sector || defaultSector || 'food');
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
            onClick={(event) => event.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="modal-sheet-handle" />
            <div className="modal-sheet-header">
              <h2 className="modal-sheet-title">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
              <button className="btn-icon" onClick={onClose} type="button"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  className="form-input text-center text-4xl font-black"
                  inputMode="decimal"
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Note</label>
                <input className="form-input" type="text" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Coffee, fuel, subscription..." />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>

              <button className="btn-primary w-full" type="submit">
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

export const SettingsModal = ({ isOpen, onClose, budgets, onUpdateBudget, weeklyTarget, onUpdateWeeklyTarget, monthlyTarget, onUpdateMonthlyTarget, onSignOut, userName, userEmail }) => {
  const [draft, setDraft] = useState(budgets);
  const [draftWeekly, setDraftWeekly] = useState(weeklyTarget || 0);
  const [draftMonthly, setDraftMonthly] = useState(monthlyTarget || 0);

  useEffect(() => {
    if (isOpen) {
      setDraft(budgets || {});
      setDraftWeekly(weeklyTarget || 0);
      setDraftMonthly(monthlyTarget || 0);
    }
  }, [budgets, weeklyTarget, monthlyTarget, isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    SECTORS.forEach((sector) => onUpdateBudget(sector.id, draft[sector.id] || 0));
    onUpdateWeeklyTarget?.(draftWeekly);
    onUpdateMonthlyTarget?.(draftMonthly);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal-sheet"
            onClick={(event) => event.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="modal-sheet-handle" />
            <div className="modal-sheet-header">
              <h2 className="modal-sheet-title">Settings</h2>
              <button className="btn-icon" onClick={onClose} type="button"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="surface-card p-4">
                <p className="section-eyebrow mb-3">Monthly Budget Estimation</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <PiggyBank size={18} className="text-zinc-300" />
                    Total Monthly Target
                  </div>
                  <input
                    className="form-input w-32 text-right"
                    type="number"
                    min="0"
                    step="500"
                    value={draftMonthly}
                    onChange={(event) => setDraftMonthly(parseCurrencyInput(event.target.value))}
                  />
                </div>
              </div>

              <div className="surface-card p-4">
                <p className="section-eyebrow mb-3">Weekly Target</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <Target size={18} className="text-emerald-300" />
                    Explicit Weekly Target
                  </div>
                  <input
                    className="form-input w-32 text-right"
                    type="number"
                    min="0"
                    step="100"
                    value={draftWeekly}
                    onChange={(event) => setDraftWeekly(parseCurrencyInput(event.target.value))}
                  />
                </div>
              </div>

              <button className="btn-primary w-full" type="submit">
                <Check size={18} />
                Save Settings
              </button>
            </form>

            {onSignOut && (
              <div className="surface-card mt-4 p-4">
                <p className="section-eyebrow mb-3">Account</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{userName || 'User'}</p>
                    {userEmail && <p className="truncate text-xs text-zinc-500">{userEmail}</p>}
                  </div>
                  <button className="btn-secondary text-rose-300" type="button" onClick={onSignOut}>
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
