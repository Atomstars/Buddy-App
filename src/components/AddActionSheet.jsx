import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X,
  ShoppingCart, Receipt, CreditCard, CalendarDays, RefreshCw,
} from 'lucide-react';

const ACTIONS = [
  {
    id: 'expense',
    label: 'Add Expense',
    desc: 'Log what you spent',
    icon: ShoppingCart,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.2)',
  },
  {
    id: 'bill',
    label: 'Add Bill',
    desc: 'Track a recurring bill',
    icon: Receipt,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    id: 'emi',
    label: 'Add EMI',
    desc: 'Log a loan payment',
    icon: CreditCard,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.2)',
  },
  {
    id: 'schedule',
    label: 'Add Task',
    desc: 'Schedule a reminder',
    icon: CalendarDays,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.2)',
  },
  {
    id: 'subscription',
    label: 'Subscription',
    desc: 'Track a recurring charge',
    icon: RefreshCw,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.2)',
  },
];

const AddActionSheet = ({ isOpen, onClose, onSelectAction }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="aura-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="aura-sheet"
            initial={{ y: '100%', x: '-50%' }}
            animate={{ y: 0, x: '-50%' }}
            exit={{ y: '100%', x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={e => e.stopPropagation()}
            style={{ position: 'fixed', left: '50%', bottom: 0, zIndex: 201, width: 'min(100vw, 430px)', background: '#111113', borderRadius: '36px 36px 0 0', padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 -20px 40px rgba(0,0,0,0.5)' }}
          >
            <div className="aura-sheet-handle" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 className="aura-sheet-title">Quick Add</h3>
                <p className="aura-sheet-sub">What would you like to log?</p>
              </div>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-3)', cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Actions grid */}
            <div className="aura-sheet-grid">
              {ACTIONS.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    className="aura-sheet-action"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    onClick={() => {
                      onSelectAction?.(action.id);
                      onClose();
                    }}
                    whileTap={{ scale: 0.95 }}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div
                      className="aura-sheet-action-icon"
                      style={{
                        background: action.bg,
                        border: `1px solid ${action.border}`,
                      }}
                    >
                      <Icon size={18} style={{ color: action.color }} />
                    </div>
                    <div>
                      <div className="aura-sheet-action-label">{action.label}</div>
                      <div className="aura-sheet-action-desc">{action.desc}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddActionSheet;
