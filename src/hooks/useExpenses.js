import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { api } from '../services/api';
import { INR_CURRENCY, SECTORS } from '../utils/formatters';
import {
  formatDateISO,
  getDateFromISO,
  getMonthStart,
  getMonthEnd,
  getWeekEnd,
  getWeekStart,
  isSameDay,
} from '../utils/dateUtils';

const STORAGE_KEY_NO_SPEND = 'cell-budget-tracker-nospend';

export const defaultBudgets = {
  groceries: 5000,
  food: 3000,
  fun: 2000,
};

export const getRangeExpenses = (expenses, start, end) => {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    if (end) {
      return expenseDate >= start && expenseDate <= end;
    }
    return expenseDate >= start;
  });
};

const sumExpenses = (expenses) => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getPeriodBudget = (budgets, period, year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const multiplier = period === 'week' ? 7 / daysInMonth : 1;

  return SECTORS.reduce((result, sector) => {
    result[sector.id] = Math.round((budgets[sector.id] || 0) * multiplier);
    return result;
  }, {});
};

const getCurrentPeriodStats = (expenses, budgets, period, targetDate, weeklyTarget = 0, monthlyTarget = 0) => {
  const start = period === 'month' ? getMonthStart(targetDate) : getWeekStart(targetDate);
  const end = period === 'month' ? getMonthEnd(targetDate) : getWeekEnd(targetDate);
  const scoped = getRangeExpenses(expenses, start, end);
  const total = sumExpenses(scoped);
  const periodBudgets = getPeriodBudget(budgets, period, targetDate.getFullYear(), targetDate.getMonth());
  let totalBudget = Object.values(periodBudgets).reduce((sum, amount) => sum + amount, 0);

  if (period === 'week' && weeklyTarget > 0) {
    totalBudget = weeklyTarget;
  } else if (period === 'month' && monthlyTarget > 0) {
    totalBudget = monthlyTarget;
  }

  return {
    total,
    totalBudget,
    remaining: totalBudget - total,
    percentage: totalBudget > 0 ? Math.round((total / totalBudget) * 100) : 0,
    bySector: SECTORS.map((sector) => ({
      sector: sector.id,
      amount: sumExpenses(scoped.filter((expense) => expense.sector === sector.id)),
      budget: periodBudgets[sector.id],
      count: scoped.filter((expense) => expense.sector === sector.id).length,
    })),
    expenses: scoped,
  };
};

const getZeroDayStreak = (expenses, noSpendDays) => {
  const allNoSpendDates = [...noSpendDays].sort().reverse();
  const expenseDates = new Set(expenses.map(e => formatDateISO(new Date(e.date))));
  const trueZeroDays = allNoSpendDates.filter(day => !expenseDates.has(day));

  if (trueZeroDays.length === 0) return { streak: 0, active: false };

  let streakCount = 0;
  let latestZeroDate = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = new Date(today);

  while (cursor >= new Date(2020, 0, 1)) {
    const dateStr = formatDateISO(cursor);
    const isZero = trueZeroDays.includes(dateStr);
    if (isZero) {
      if (!latestZeroDate) latestZeroDate = new Date(cursor);
      streakCount++;
    } else if (latestZeroDate) {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  if (streakCount === 0) return { streak: 0, active: false };
  const streakStartDate = new Date(latestZeroDate);
  streakStartDate.setDate(streakStartDate.getDate() - (streakCount - 1));
  const activeUntil = new Date(streakStartDate);
  activeUntil.setDate(activeUntil.getDate() + streakCount);
  const isActive = today <= activeUntil;
  return { streak: streakCount, active: isActive, activeUntil: formatDateISO(activeUntil) };
};

/**
 * useExpenses — per-user expense & budget management.
 * @param {string|null} userId
 */
export const useExpenses = (userId) => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState(defaultBudgets);
  const [weeklyTarget, setWeeklyTarget] = useState(0);
  const [monthlyTarget, setMonthlyTarget] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [noSpendDays, setNoSpendDays] = useState([]);
  const currency = INR_CURRENCY;

  // ── No-spend days keyed by userId ────────────────────────────
  const noSpendKey = `${STORAGE_KEY_NO_SPEND}_${userId || 'guest'}`;

  const getAuthToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || '';
  };

  const fetchSupabaseData = useCallback(async () => {
    if (!userId) return;
    try {
      const token = await getAuthToken();
      // Use Backend API for expenses
      const expData = await api.transactions.getAll(userId, token);
      if (expData) {
        setExpenses(expData.map(e => ({
          id: e.id,
          amount: Number(e.amount),
          sector: e.category, // Map back category -> sector
          note: e.merchant || '', // Map back merchant -> note
          date: new Date(e.date + 'T12:00:00Z').toISOString(),
          createdAt: new Date(e.createdAt).getTime(),
        })));
      }

      const { data: bdgData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (bdgData && bdgData.length > 0) {
        const newBudgets = { ...defaultBudgets };
        bdgData.forEach(b => { newBudgets[b.sector] = Number(b.amount); });
        setBudgets(newBudgets);
      }

      const { data: tgtData } = await supabase
        .from('targets')
        .select('*')
        .eq('user_id', userId);

      if (tgtData) {
        const wTgt = tgtData.find(t => t.type === 'weekly');
        if (wTgt) setWeeklyTarget(Number(wTgt.amount));
        const mTgt = tgtData.find(t => t.type === 'monthly');
        if (mTgt) setMonthlyTarget(Number(mTgt.amount));
        const incTgt = tgtData.find(t => t.type === 'income');
        if (incTgt) setMonthlyIncome(Number(incTgt.amount));
      }

      const savedNoSpend = window.localStorage.getItem(noSpendKey);
      if (savedNoSpend) setNoSpendDays(JSON.parse(savedNoSpend));
    } catch (err) {
      console.error('Failed to fetch from supabase', err);
    }
  }, [userId, noSpendKey]);

  useEffect(() => {
    fetchSupabaseData();
  }, [fetchSupabaseData]);

  useEffect(() => {
    try {
      window.localStorage.setItem(noSpendKey, JSON.stringify(noSpendDays));
    } catch { /* Ignore */ }
  }, [noSpendDays, noSpendKey]);

  const addExpense = useCallback(async (amount, sector, note = '', date = new Date()) => {
    if (!userId) throw new Error('User not authenticated');
    const numAmount = Number(amount);
    
    try {
      const token = await getAuthToken();
      const result = await api.transactions.add({
        userId,
        amount: numAmount,
        category: sector,
        merchant: note.trim(),
        date: formatDateISO(date),
      }, token);

      const added = {
        id: result.id,
        amount: Number(result.amount),
        sector: result.category,
        note: result.merchant || '',
        date: new Date(result.date + 'T12:00:00Z').toISOString(),
        createdAt: new Date(result.createdAt).getTime(),
      };
      
      setExpenses((prev) => [added, ...prev].sort((a, b) => b.createdAt - a.createdAt));
      setNoSpendDays((prev) => prev.filter((day) => day !== formatDateISO(date)));
      return added;
    } catch (error) {
      console.error('Error adding expense via API:', error);
      throw error;
    }
  }, [userId]);

  const updateExpense = useCallback(async (id, updates) => {
    if (!userId) throw new Error('User not authenticated');
    const payload = { userId };
    if (updates.amount !== undefined) payload.amount = Number(updates.amount);
    if (updates.sector !== undefined) payload.category = updates.sector;
    if (updates.note !== undefined) payload.merchant = updates.note;
    if (updates.date !== undefined) payload.date = formatDateISO(new Date(updates.date));

    try {
      const token = await getAuthToken();
      await api.transactions.update(id, payload, token);
      setExpenses((prev) => prev.map((exp) =>
        exp.id === id ? { ...exp, ...updates, amount: Number(updates.amount ?? exp.amount) } : exp
      ));
    } catch (error) {
      console.error('Error updating expense via API:', error);
      throw error;
    }
  }, [userId]);

  const removeExpense = useCallback(async (id) => {
    if (!userId) throw new Error('User not authenticated');
    try {
      const token = await getAuthToken();
      await api.transactions.delete(id, userId, token);
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error('Error removing expense via API:', error);
      throw error;
    }
  }, [userId]);

  const updateBudget = useCallback(async (sector, amount) => {
    if (!userId) return;
    const numAmount = Math.max(0, Number(amount) || 0);
    const { data } = await supabase.from('budgets').select('id').eq('user_id', userId).eq('sector', sector);
    if (data && data.length > 0) {
      await supabase.from('budgets').update({ amount: numAmount }).eq('user_id', userId).eq('sector', sector);
    } else {
      await supabase.from('budgets').insert([{ user_id: userId, sector, amount: numAmount }]);
    }
    setBudgets((prev) => ({ ...prev, [sector]: numAmount }));
  }, [userId]);

  const updateTarget = useCallback(async (type, amount) => {
    if (!userId) return;
    const numAmount = Math.max(0, Number(amount) || 0);
    const { data } = await supabase.from('targets').select('id').eq('user_id', userId).eq('type', type);
    if (data && data.length > 0) {
      await supabase.from('targets').update({ amount: numAmount }).eq('user_id', userId).eq('type', type);
    } else {
      await supabase.from('targets').insert([{ user_id: userId, type, amount: numAmount }]);
    }
    if (type === 'weekly') setWeeklyTarget(numAmount);
    if (type === 'monthly') setMonthlyTarget(numAmount);
    if (type === 'income') setMonthlyIncome(numAmount);
  }, [userId]);

  const updateWeeklyTarget = useCallback((amount) => updateTarget('weekly', amount), [updateTarget]);
  const updateMonthlyTarget = useCallback((amount) => updateTarget('monthly', amount), [updateTarget]);
  const updateMonthlyIncome = useCallback((amount) => updateTarget('income', amount), [updateTarget]);

  const markNoSpendToday = useCallback(() => {
    const today = formatDateISO(new Date());
    setNoSpendDays((prev) => prev.includes(today) ? prev : [today, ...prev]);
  }, []);

  const clearNoSpendToday = useCallback(() => {
    const today = formatDateISO(new Date());
    setNoSpendDays((prev) => prev.filter((day) => day !== today));
  }, []);

  const selectors = useMemo(() => ({
    getTodayStats: (targetDate = new Date()) => {
      const todayStart = new Date(targetDate);
      todayStart.setHours(0, 0, 0, 0);
      const tomorrow = new Date(todayStart);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const todayExpenses = expenses.filter((expense) => {
        const date = new Date(expense.date);
        return date >= todayStart && date < tomorrow;
      });
      return {
        total: sumExpenses(todayExpenses),
        count: todayExpenses.length,
        expenses: todayExpenses,
        noSpendMarked: noSpendDays.includes(formatDateISO(todayStart)),
      };
    },
    getWeeklyStats: (targetDate = new Date()) =>
      getCurrentPeriodStats(expenses, budgets, 'week', targetDate, weeklyTarget),
    getMonthlyStats: (targetDate = new Date()) =>
      getCurrentPeriodStats(expenses, budgets, 'month', targetDate, 0, monthlyTarget),
    getSpendingBySector: (sector, targetDate = new Date()) => ({
      week: sumExpenses(getRangeExpenses(expenses, getWeekStart(targetDate), getWeekEnd(targetDate)).filter(e => e.sector === sector)),
      month: sumExpenses(getRangeExpenses(expenses, getMonthStart(targetDate), getMonthEnd(targetDate)).filter(e => e.sector === sector)),
      count: expenses.filter(e => e.sector === sector).length,
    }),
    getZeroDayStreak: () => getZeroDayStreak(expenses, noSpendDays),
    isDateTracked: (date) => {
      const day = formatDateISO(date);
      return noSpendDays.includes(day) || expenses.some(e => isSameDay(new Date(e.date), getDateFromISO(day)));
    },
    getExpensesForMonth: (year, month) => {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      return expenses.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    },
  }), [expenses, budgets, weeklyTarget, monthlyTarget, noSpendDays]);

  return {
    expenses,
    budgets,
    weeklyTarget,
    monthlyTarget,
    monthlyIncome,
    currency,
    noSpendDays,
    addExpense,
    updateExpense,
    removeExpense,
    updateBudget,
    updateWeeklyTarget,
    updateMonthlyTarget,
    updateMonthlyIncome,
    markNoSpendToday,
    clearNoSpendToday,
    refetch: fetchSupabaseData,
    ...selectors,
  };
};

export default useExpenses;
