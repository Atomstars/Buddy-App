import { useState, useEffect, useCallback } from 'react';
import { generateId } from '../utils/formatters';
import { formatDateISO } from '../utils/dateUtils';

const STORAGE_KEY = 'aura_bills_data';

export const useBills = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBills(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load bills', e);
    }
  }, []);

  const saveBills = (newBills) => {
    setBills(newBills);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBills));
    } catch (e) {
      // ignore
    }
  };

  const addBill = useCallback(({ title, amount, category, dueDate, isRecurring, isEMI, frequency, notes }) => {
    const newBill = {
      id: generateId(),
      title,
      amount: Number(amount),
      category: category || 'general',
      dueDate: formatDateISO(dueDate || new Date()),
      isRecurring: !!isRecurring,
      frequency: frequency || 'monthly',
      isEMI: !!isEMI,
      notes: notes || '',
      isPaid: false,
      createdAt: Date.now()
    };
    saveBills((prev) => [...prev, newBill].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
  }, []);

  const updateBill = useCallback((id, updates) => {
    saveBills((prev) => prev.map(bill => bill.id === id ? { ...bill, ...updates } : bill));
  }, []);

  const removeBill = useCallback((id) => {
    saveBills((prev) => prev.filter(bill => bill.id !== id));
  }, []);

  const togglePaid = useCallback((id) => {
    saveBills((prev) => prev.map(bill => bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill));
  }, []);

  return {
    bills,
    addBill,
    updateBill,
    removeBill,
    togglePaid
  };
};

export default useBills;
