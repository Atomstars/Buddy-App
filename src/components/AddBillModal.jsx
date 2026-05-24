import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Check, IndianRupee } from 'lucide-react';
import { SECTORS, parseCurrencyInput } from '../utils/formatters';
import { formatDateISO } from '../utils/dateUtils';

export const AddBillModal = ({ isOpen, onClose, onSave, editingBill }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('bills');
  const [dueDate, setDueDate] = useState(formatDateISO(new Date()));
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [isEMI, setIsEMI] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingBill) {
        setTitle(editingBill.title || '');
        setAmount(String(editingBill.amount || ''));
        setCategory(editingBill.category || 'bills');
        setDueDate(editingBill.dueDate ? formatDateISO(new Date(editingBill.dueDate)) : formatDateISO(new Date()));
        setIsRecurring(!!editingBill.isRecurring);
        setFrequency(editingBill.frequency || 'monthly');
        setIsEMI(!!editingBill.isEMI);
        setNotes(editingBill.notes || '');
      } else {
        setTitle('');
        setAmount('');
        setCategory('bills');
        setDueDate(formatDateISO(new Date()));
        setIsRecurring(false);
        setFrequency('monthly');
        setIsEMI(false);
        setNotes('');
      }
    }
  }, [isOpen, editingBill]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    onSave({
      title,
      amount: parseCurrencyInput(amount),
      category,
      dueDate: new Date(dueDate),
      isRecurring,
      frequency: isRecurring ? frequency : null,
      isEMI,
      notes
    });
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
              <h2 className="modal-sheet-title">{editingBill ? 'Edit Bill' : 'Add Bill / Subscription'}</h2>
              <button className="btn-icon" onClick={onClose}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div className="form-group">
                <label className="form-label">Bill Name / Provider</label>
                <input className="form-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Netflix, Electricity, Gym..." autoFocus required />
              </div>

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
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} style={{ accentColor: '#f43f5e', width: 16, height: 16 }} />
                  Recurring
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={isEMI} onChange={(e) => setIsEMI(e.target.checked)} style={{ accentColor: '#f43f5e', width: 16, height: 16 }} />
                  Loan / EMI
                </label>
              </div>

              {isRecurring && (
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-input" value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ background: 'rgba(0,0,0,0.2)', color: '#fff' }}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <input className="form-input" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contract ends in Dec..." />
              </div>

              <button className="btn-primary" type="submit" style={{ width: '100%', background: '#f43f5e', color: '#fff', marginTop: 8 }}>
                <Receipt size={18} />
                {editingBill ? 'Save Changes' : 'Add Bill'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddBillModal;
