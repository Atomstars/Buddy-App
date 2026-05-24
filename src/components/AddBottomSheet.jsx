import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Receipt, CreditCard, CalendarDays } from 'lucide-react';
import { SECTORS, parseCurrencyInput } from '../utils/formatters';
import { formatDateISO, getDateFromISO } from '../utils/dateUtils';

const TABS = [
  { id: 'expense', label: 'Expense', icon: ShoppingCart },
  { id: 'bill', label: 'Bill', icon: Receipt },
  { id: 'emi', label: 'EMI', icon: CreditCard },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
];

export const AddBottomSheet = ({ isOpen, onClose, onSaveExpense, onSaveBill, onSaveTask, initialTab = 'expense' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [sector, setSector] = useState('groceries');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatDateISO(new Date()));
  const [title, setTitle] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAmount('');
      setSector('groceries');
      setNote('');
      setDate(formatDateISO(new Date()));
      setTitle('');
    }
  }, [isOpen, initialTab]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(amount);
    
    if (activeTab === 'expense') {
      if (parsedAmount <= 0) return;
      onSaveExpense?.({ amount: parsedAmount, sector, note, date: getDateFromISO(date) });
    } else if (activeTab === 'bill' || activeTab === 'emi') {
      if (parsedAmount <= 0 || !title.trim()) return;
      onSaveBill?.({ 
        title: title.trim(), 
        amount: parsedAmount, 
        category: sector, 
        dueDate: getDateFromISO(date), 
        isRecurring: activeTab === 'bill', 
        isEMI: activeTab === 'emi' 
      });
    } else if (activeTab === 'schedule') {
      if (!title.trim()) return;
      onSaveTask?.({ title: title.trim(), date: formatDateISO(new Date(date)), type: 'task' });
    }
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="aura-sheet-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          />

          <motion.div
            className="aura-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{ position: 'fixed', left: '50%', bottom: 0, zIndex: 201, width: 'min(100vw, 430px)', transform: 'translateX(-50%)', background: '#111113', borderRadius: '32px 32px 0 0', padding: '24px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 24px' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: '100%' }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.2s', outline: 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {(activeTab === 'bill' || activeTab === 'emi' || activeTab === 'schedule') && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>TITLE</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={activeTab === 'schedule' ? 'e.g. Call dentist' : 'e.g. Netflix, Car Loan'}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: 16, color: '#fff', fontSize: 16, outline: 'none' }}
                    autoFocus
                  />
                </div>
              )}

              {activeTab !== 'schedule' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>AMOUNT</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 16, color: '#fff', fontSize: 18, fontWeight: 600 }}>₹</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px 14px 36px', borderRadius: 16, color: '#fff', fontSize: 20, fontWeight: 700, outline: 'none' }}
                      autoFocus={activeTab === 'expense'}
                    />
                  </div>
                </div>
              )}

              {activeTab !== 'schedule' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>CATEGORY</label>
                  <div style={{ display: 'flex', overflowX: 'auto', gap: 8, paddingBottom: 8, scrollbarWidth: 'none' }}>
                    {SECTORS.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSector(s.id)}
                        style={{
                          flexShrink: 0, padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                          background: sector === s.id ? s.color + '20' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${sector === s.id ? s.color + '50' : 'rgba(255,255,255,0.05)'}`,
                          color: sector === s.id ? '#fff' : 'rgba(255,255,255,0.6)',
                          transition: 'all 0.2s', outline: 'none'
                        }}
                      >
                        {s.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'expense' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>NOTE (OPTIONAL)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tea, petrol, groceries..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: 16, color: '#fff', fontSize: 15, outline: 'none' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>{activeTab === 'expense' ? 'DATE' : 'DUE DATE'}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: 16, color: '#fff', fontSize: 15, outline: 'none', colorScheme: 'dark' }}
                />
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.96 }}
                style={{
                  width: '100%', padding: '16px', borderRadius: 16, marginTop: 8,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', outline: 'none', cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
                }}
              >
                Save {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddBottomSheet;
