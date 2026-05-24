import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { generateId, INR_CURRENCY, SECTORS } from '../utils/formatters';
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

const getDaysInCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

const getPeriodBudget = (budgets, period) => {
  const multiplier = period === 'week' ? 7 / getDaysInCurrentMonth() : 1;

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
  const periodBudgets = getPeriodBudget(budgets, period);
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

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let latestZeroDate = null;
  let streakCount = 0;
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

  return { 
    streak: streakCount, 
    active: isActive,
    activeUntil: formatDateISO(activeUntil)
  };
};

const getBudgetStreak = (expenses, budgets) => {
  const weeklyBudget = Object.values(getPeriodBudget(budgets, 'week')).reduce((sum, amount) => sum + amount, 0);
  let streak = 0;
  const cursor = getWeekStart();
  cursor.setDate(cursor.getDate() - 7);

  for (let i = 0; i < 12; i += 1) {
    const start = new Date(cursor);
    const end = getWeekEnd(start);
    const total = sumExpenses(getRangeExpenses(expenses, start, end));

    if (total <= weeklyBudget) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
};

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState(defaultBudgets);
  const [weeklyTarget, setWeeklyTarget] = useState(0);
  const [monthlyTarget, setMonthlyTarget] = useState(0);
  const [noSpendDays, setNoSpendDays] = useState([]);
  const currency = INR_CURRENCY;

  const fetchSupabaseData = async () => {
    try {
      const { data: expData } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (expData) {
        setExpenses(expData.map(e => ({
          id: e.id,
          amount: Number(e.amount),
          sector: e.sector,
          note: e.note || '',
          date: new Date(e.date + 'T12:00:00Z').toISOString(), // Fix timezone offset for dates
          createdAt: new Date(e.created_at).getTime()
        })));
      }

      const { data: bdgData } = await supabase.from('budgets').select('*');
      if (bdgData && bdgData.length > 0) {
        const newBudgets = { ...defaultBudgets };
        bdgData.forEach(b => {
          newBudgets[b.sector] = Number(b.amount);
        });
        setBudgets(newBudgets);
      }

      const { data: tgtData } = await supabase.from('targets').select('*');
      if (tgtData) {
        const wTgt = tgtData.find(t => t.type === 'weekly');
        if (wTgt) setWeeklyTarget(Number(wTgt.amount));
        const mTgt = tgtData.find(t => t.type === 'monthly');
        if (mTgt) setMonthlyTarget(Number(mTgt.amount));
      }

      const savedNoSpend = window.localStorage.getItem(STORAGE_KEY_NO_SPEND);
      if (savedNoSpend) {
        setNoSpendDays(JSON.parse(savedNoSpend));
      }
    } catch (err) {
      console.error('Failed to fetch from supabase', err);
    }
  };

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_NO_SPEND, JSON.stringify(noSpendDays));
    } catch {
      // Ignore
    }
  }, [noSpendDays]);

  const addExpense = useCallback(async (amount, sector, note = '', date = new Date()) => {
    const numAmount = Number(amount);
    const newExp = {
      amount: numAmount,
      sector,
      note: note.trim(),
      date: formatDateISO(date)
    };

    const { data, error } = await supabase.from('expenses').insert([newExp]).select();
    if (error) {
      console.error('Error adding expense:', error);
    }
    if (!error && data) {
      const added = {
        id: data[0].id,
        amount: Number(data[0].amount),
        sector: data[0].sector,
        note: data[0].note || '',
        date: new Date(data[0].date + 'T12:00:00Z').toISOString(),
        createdAt: new Date(data[0].created_at).getTime()
      };
      setExpenses((prev) => [added, ...prev].sort((a,b) => b.createdAt - a.createdAt));
      setNoSpendDays((prev) => prev.filter((day) => day !== formatDateISO(date)));
      return added;
    }
  }, []);

  const updateExpense = useCallback(async (id, updates) => {
    const dbUpdates = {};
    if (updates.amount !== undefined) dbUpdates.amount = Number(updates.amount);
    if (updates.sector !== undefined) dbUpdates.sector = updates.sector;
    if (updates.note !== undefined) dbUpdates.note = updates.note;
    if (updates.date !== undefined) dbUpdates.date = formatDateISO(new Date(updates.date));

    const { error } = await supabase.from('expenses').update(dbUpdates).eq('id', id);
    if (!error) {
      setExpenses((prev) => prev.map((exp) => (exp.id === id ? { ...exp, ...updates, amount: Number(updates.amount ?? exp.amount) } : exp)));
    }
  }, []);

  const removeExpense = useCallback(async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    }
  }, []);

  const updateBudget = useCallback(async (sector, amount) => {
    const numAmount = Math.max(0, Number(amount) || 0);
    
    // First try to select to see if it exists
    const { data } = await supabase.from('budgets').select('id').eq('sector', sector);
    if (data && data.length > 0) {
      await supabase.from('budgets').update({ amount: numAmount }).eq('sector', sector);
    } else {
      await supabase.from('budgets').insert([{ sector, amount: numAmount }]);
    }
    
    setBudgets((prev) => ({ ...prev, [sector]: numAmount }));
  }, []);

  const updateWeeklyTarget = useCallback(async (amount) => {
    const numAmount = Math.max(0, Number(amount) || 0);
    const { data } = await supabase.from('targets').select('id').eq('type', 'weekly');
    if (data && data.length > 0) {
      await supabase.from('targets').update({ amount: numAmount }).eq('type', 'weekly');
    } else {
      await supabase.from('targets').insert([{ type: 'weekly', amount: numAmount }]);
    }
    setWeeklyTarget(numAmount);
  }, []);

  const updateMonthlyTarget = useCallback(async (amount) => {
    const numAmount = Math.max(0, Number(amount) || 0);
    const { data } = await supabase.from('targets').select('id').eq('type', 'monthly');
    if (data && data.length > 0) {
      await supabase.from('targets').update({ amount: numAmount }).eq('type', 'monthly');
    } else {
      await supabase.from('targets').insert([{ type: 'monthly', amount: numAmount }]);
    }
    setMonthlyTarget(numAmount);
  }, []);

  const markNoSpendToday = useCallback(() => {
    const today = formatDateISO(new Date());
    setNoSpendDays((prev) => prev.includes(today) ? prev : [today, ...prev]);
  }, []);

  const clearNoSpendToday = useCallback(() => {
    const today = formatDateISO(new Date());
    setNoSpendDays((prev) => prev.filter((day) => day !== today));
  }, []);

  const selectors = useMemo(() => {
    return {
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
      getWeeklyStats: (targetDate = new Date()) => getCurrentPeriodStats(expenses, budgets, 'week', targetDate, weeklyTarget),
      getMonthlyStats: (targetDate = new Date()) => getCurrentPeriodStats(expenses, budgets, 'month', targetDate, 0, monthlyTarget),
      getSpendingBySector: (sector, targetDate = new Date()) => ({
        week: sumExpenses(
          getRangeExpenses(expenses, getWeekStart(targetDate), getWeekEnd(targetDate)).filter((expense) => expense.sector === sector)
        ),
        month: sumExpenses(
          getRangeExpenses(expenses, getMonthStart(targetDate), getMonthEnd(targetDate)).filter((expense) => expense.sector === sector)
        ),
        count: expenses.filter((expense) => expense.sector === sector).length,
      }),
      getZeroDayStreak: () => getZeroDayStreak(expenses, noSpendDays),
      getBudgetStreak: () => getBudgetStreak(expenses, budgets),
      isDateTracked: (date) => {
        const day = formatDateISO(date);
        return (
          noSpendDays.includes(day) ||
          expenses.some((expense) => isSameDay(new Date(expense.date), getDateFromISO(day)))
        );
      },
    };
  }, [expenses, budgets, weeklyTarget, monthlyTarget, noSpendDays]);

  return {
    expenses,
    budgets,
    weeklyTarget,
    monthlyTarget,
    currency,
    noSpendDays,
    addExpense,
    updateExpense,
    removeExpense,
    updateBudget,
    updateWeeklyTarget,
    updateMonthlyTarget,
    markNoSpendToday,
    clearNoSpendToday,
    ...selectors,
  };
};

export default useExpenses;
