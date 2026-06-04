import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { formatDateISO } from '../utils/dateUtils';

const STORAGE_KEY = 'aura_bills_v2'; // v2 key — old localStorage bills not migrated

/**
 * useBills — Supabase-backed, per-user bill management.
 * Falls back to localStorage if userId is not yet available (mock/dev users).
 *
 * @param {string|null} userId
 */
export const useBills = (userId) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const isReal = userId && !userId.startsWith('00000000'); // real Supabase user

  // ── Load bills ────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    if (isReal) {
      setLoading(true);
      supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true })
        .then(({ data, error }) => {
          if (!error && data) {
            setBills(data.map(mapBillFromDB));
          }
          setLoading(false);
        });
    } else {
      // Dev/mock user — use localStorage scoped to userId
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
        if (stored) setBills(JSON.parse(stored));
      } catch (e) { /* ignore */ }
    }
  }, [userId, isReal]);

  // ── Persist to localStorage for dev/mock users ────────────────
  const saveLocal = (newBills) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(newBills));
    } catch (e) { /* ignore */ }
  };

  // ── Map DB row → local shape ──────────────────────────────────
  const mapBillFromDB = (b) => ({
    id: b.id,
    title: b.title,
    amount: Number(b.amount),
    category: b.category || 'general',
    dueDate: b.due_date,
    isRecurring: b.is_recurring,
    frequency: b.frequency || 'monthly',
    isEMI: b.is_emi,
    notes: b.notes || '',
    isPaid: b.is_paid,
    createdAt: b.created_at,
  });

  // ── Add bill ──────────────────────────────────────────────────
  const addBill = useCallback(async ({ title, amount, category, dueDate, isRecurring, isEMI, frequency, notes }) => {
    if (!userId) return;

    const newBill = {
      title,
      amount: Number(amount),
      category: category || 'general',
      dueDate: formatDateISO(dueDate ? new Date(dueDate) : new Date()),
      isRecurring: !!isRecurring,
      frequency: frequency || 'monthly',
      isEMI: !!isEMI,
      notes: notes || '',
      isPaid: false,
    };

    if (isReal) {
      const dbBill = {
        user_id: userId,
        title: newBill.title,
        amount: newBill.amount,
        category: newBill.category,
        due_date: newBill.dueDate,
        is_recurring: newBill.isRecurring,
        frequency: newBill.frequency,
        is_emi: newBill.isEMI,
        notes: newBill.notes,
        is_paid: false,
      };
      const { data, error } = await supabase.from('bills').insert([dbBill]).select().single();
      if (!error && data) {
        const mapped = mapBillFromDB(data);
        setBills(prev => [...prev, mapped].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
      }
    } else {
      const local = { ...newBill, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setBills(prev => {
        const next = [...prev, local].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        saveLocal(next);
        return next;
      });
    }
  }, [userId, isReal]);

  // ── Update bill ───────────────────────────────────────────────
  const updateBill = useCallback(async (id, updates) => {
    if (!userId) return;

    if (isReal) {
      const dbUpdates = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.amount !== undefined) dbUpdates.amount = Number(updates.amount);
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
      if (updates.isEMI !== undefined) dbUpdates.is_emi = updates.isEMI;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;

      const { error } = await supabase.from('bills').update(dbUpdates).eq('id', id);
      if (!error) {
        setBills(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      }
    } else {
      setBills(prev => {
        const next = prev.map(b => b.id === id ? { ...b, ...updates } : b);
        saveLocal(next);
        return next;
      });
    }
  }, [userId, isReal]);

  // ── Remove bill ───────────────────────────────────────────────
  const removeBill = useCallback(async (id) => {
    if (!userId) return;

    if (isReal) {
      const { error } = await supabase.from('bills').delete().eq('id', id);
      if (!error) setBills(prev => prev.filter(b => b.id !== id));
    } else {
      setBills(prev => {
        const next = prev.filter(b => b.id !== id);
        saveLocal(next);
        return next;
      });
    }
  }, [userId, isReal]);

  // ── Toggle paid ───────────────────────────────────────────────
  const togglePaid = useCallback(async (id) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    await updateBill(id, { isPaid: !bill.isPaid });
  }, [bills, updateBill]);

  return {
    bills,
    loading,
    addBill,
    updateBill,
    removeBill,
    togglePaid,
  };
};

export default useBills;
