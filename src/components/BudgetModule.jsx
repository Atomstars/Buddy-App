import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, CalendarCheck, Check, ChevronRight, Coffee, IndianRupee, LogOut,
  Pencil, Plus, PiggyBank, ShieldCheck, ShoppingCart, Sparkles, Target, Trash2,
  TrendingDown, TrendingUp, UtensilsCrossed, CarFront, ShoppingBag, Receipt,
  HeartPulse, Paperclip, Apple, X, Wallet,
} from 'lucide-react';
import { BudgetDashboard } from './BudgetDashboard';
import { BudgetAnalytics } from './BudgetAnalytics';
import { BudgetTransactions } from './BudgetTransactions';
import { SECTORS, formatCurrency, getSector, parseCurrencyInput, clamp } from '../utils/formatters';
import { formatDateISO, getDateFromISO } from '../utils/dateUtils';

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

export const BudgetModule = ({
  activeTab, view, setView, activeStats, todayStats, weeklyStats, monthlyStats, coach, expenses, goals, goalSummary, monthlyRemaining, onAddGoal, onFundGoal, onDeleteGoal, onQuickAdd, onEdit, onDelete, selectedDate, onDateSelect
}) => {

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <BudgetDashboard 
            monthlyStats={monthlyStats}
            weeklyStats={weeklyStats}
            todayStats={todayStats}
            coach={coach}
            expenses={expenses}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            onQuickAdd={onQuickAdd}
            bills={[]}
          />
        );
      case 'analytics':
        return <BudgetAnalytics monthlyStats={monthlyStats} />;
      case 'investing':
        return (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }} className="premium-gold">Premium AI Investing</h2>
            <p style={{ color: 'var(--text-3)' }}>Unlock automated smart investments.</p>
          </div>
        );
      case 'transactions':
        return <BudgetTransactions expenses={expenses} />;
      default:
        return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 100 }}>
      {renderContent()}
    </motion.div>
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
