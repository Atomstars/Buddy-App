import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import { TrendingDown, PiggyBank, Plus, IndianRupee, Tag, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const BudgetDashboard = ({
  monthlyStats,
  todayStats,
  selectedDate,
  onDateSelect,
  onAddTransaction // assume this prop is passed or we trigger a modal
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  const prevMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    onDateSelect(d);
  };

  const nextMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    onDateSelect(d);
  };

  const formattedMonth = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleQuickAdd = (e) => {
    e.preventDefault();
    // Assuming onAddTransaction is the modal trigger for now since full sector logic is in AddExpenseModal
    if (onAddTransaction) onAddTransaction({ amount, note });
    setAmount('');
    setNote('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
      {/* Month Navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 16 }}>
        <button className="btn-icon" onClick={prevMonth} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>{formattedMonth}</span>
        <button className="btn-icon" onClick={nextMonth} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* Fin Hero / Command Center */}
      <div className="fin-card" style={{ padding: 30, textAlign: 'center' }}>
        <p className="fin-eyebrow">Monthly Balance</p>
        <h2 className="fin-amount" style={{ fontSize: '3rem', margin: '10px 0' }}>{formatCurrency(monthlyStats.total)}</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20 }}>
          <div className="surface-card" style={{ padding: '12px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <TrendingDown size={18} color="var(--rose)" />
            <span style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Spent Today</span>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>{formatCurrency(todayStats.total)}</span>
          </div>
          <div className="surface-card" style={{ padding: '12px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <PiggyBank size={18} color="var(--emerald)" />
            <span style={{ color: 'var(--text-3)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Remaining</span>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>{formatCurrency(Math.max(0, monthlyStats.remaining))}</span>
          </div>
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="fin-card" style={{ padding: 24 }}>
        <h3 className="fin-card-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={20} color="var(--accent)" /> Quick Add
        </h3>
        
        <form onSubmit={handleQuickAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="auth-field">
            <div className="auth-input-wrap surface-card" style={{ padding: '4px 12px' }}>
              <IndianRupee size={18} className="auth-input-icon" color="var(--text-3)" />
              <input
                type="number"
                className="form-input auth-input"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: '1.2rem', fontWeight: 700 }}
              />
            </div>
          </div>
          
          <div className="auth-field">
            <div className="auth-input-wrap surface-card" style={{ padding: '4px 12px' }}>
              <FileText size={18} className="auth-input-icon" color="var(--text-3)" />
              <input
                type="text"
                className="form-input auth-input"
                placeholder="What was this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="btn-primary" 
            type="button"
            onClick={handleQuickAdd}
            style={{ width: '100%', marginTop: 8, padding: 16, fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--accent), #0077ff)', boxShadow: 'var(--shadow-glow-accent)' }}
          >
            Add Transaction
          </motion.button>
        </form>
      </div>
    </div>
  );
};
