import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateId, INR_CURRENCY, SECTORS } from '../utils/formatters';
import {
  formatDateISO,
  getDateFromISO,
  getMonthStart,
  getWeekEnd,
  getWeekStart,
  isSameDay,
} from '../utils/dateUtils';

const STORAGE_KEY = 'cell-budget-tracker';

export const defaultBudgets = {
  groceries: 5000,
  food: 3000,
  fun: 2000,
};

const legacyDefaultBudgets = {
  groceries: 500,
  food: 300,
  fun: 200,
};

const defaultState = {
  expenses: [],
  budgets: defaultBudgets,
  currency: INR_CURRENCY,
  noSpendDays: [],
};

const isBrowser = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const normalizeBudgets = (saved = {}) => {
  const incoming = saved.budgets || {};
  const isLegacyDefault =
    saved.currency === 'USD' &&
    incoming.groceries === legacyDefaultBudgets.groceries &&
    incoming.food === legacyDefaultBudgets.food &&
    incoming.fun === legacyDefaultBudgets.fun;

  if (isLegacyDefault) return defaultBudgets;

  return SECTORS.reduce((budgets, sector) => {
    const amount = Number(incoming[sector.id]);
    budgets[sector.id] = Number.isFinite(amount) && amount > 0 ? amount : defaultBudgets[sector.id];
    return budgets;
  }, {});
};

const normalizeState = (saved) => {
  if (!saved || typeof saved !== 'object') return defaultState;

  const expenses = Array.isArray(saved.expenses)
    ? saved.expenses
        .filter((expense) => expense && Number(expense.amount) > 0)
        .map((expense) => ({
          id: expense.id || generateId(),
          amount: Number(expense.amount),
          sector: SECTORS.some((sector) => sector.id === expense.sector) ? expense.sector : 'groceries',
          note: expense.note || '',
          date: expense.date || new Date().toISOString(),
          createdAt: expense.createdAt || Date.now(),
        }))
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const noSpendDays = Array.isArray(saved.noSpendDays)
    ? [...new Set(saved.noSpendDays.filter(Boolean))]
    : [];

  return {
    expenses,
    budgets: normalizeBudgets(saved),
    currency: INR_CURRENCY,
    noSpendDays,
  };
};

const loadInitialState = () => {
  if (!isBrowser()) return defaultState;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : defaultState;
  } catch {
    return defaultState;
  }
};

const getRangeExpenses = (expenses, start, end = new Date()) => {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= start && expenseDate <= end;
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

const getCurrentPeriodStats = (expenses, budgets, period) => {
  const start = period === 'month' ? getMonthStart() : getWeekStart();
  const scoped = getRangeExpenses(expenses, start);
  const total = sumExpenses(scoped);
  const periodBudgets = getPeriodBudget(budgets, period);
  const totalBudget = Object.values(periodBudgets).reduce((sum, amount) => sum + amount, 0);

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

const getTrackingDates = (expenses, noSpendDays) => {
  const expenseDays = expenses.map((expense) => formatDateISO(new Date(expense.date)));
  return new Set([...expenseDays, ...noSpendDays]);
};

const getTrackingStreak = (expenses, noSpendDays) => {
  const tracked = getTrackingDates(expenses, noSpendDays);
  let streak = 0;
  const cursor = new Date();

  while (tracked.has(formatDateISO(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
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
  const [state, setState] = useState(loadInitialState);

  useEffect(() => {
    if (!isBrowser()) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can fail in private mode; the app should still work for the session.
    }
  }, [state]);

  const addExpense = useCallback((amount, sector, note = '', date = new Date()) => {
    const expense = {
      id: generateId(),
      amount: Number(amount),
      sector,
      note: note.trim(),
      date: date.toISOString(),
      createdAt: Date.now(),
    };

    setState((previous) => ({
      ...previous,
      expenses: [expense, ...previous.expenses],
      noSpendDays: previous.noSpendDays.filter((day) => day !== formatDateISO(date)),
    }));

    return expense;
  }, []);

  const updateExpense = useCallback((id, updates) => {
    setState((previous) => ({
      ...previous,
      expenses: previous.expenses.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              ...updates,
              amount: Number(updates.amount ?? expense.amount),
              note: updates.note ?? expense.note,
            }
          : expense
      ),
    }));
  }, []);

  const removeExpense = useCallback((id) => {
    setState((previous) => ({
      ...previous,
      expenses: previous.expenses.filter((expense) => expense.id !== id),
    }));
  }, []);

  const updateBudget = useCallback((sector, amount) => {
    setState((previous) => ({
      ...previous,
      budgets: {
        ...previous.budgets,
        [sector]: Math.max(0, Number(amount) || 0),
      },
    }));
  }, []);

  const markNoSpendToday = useCallback(() => {
    const today = formatDateISO(new Date());

    setState((previous) => ({
      ...previous,
      noSpendDays: previous.noSpendDays.includes(today)
        ? previous.noSpendDays
        : [today, ...previous.noSpendDays],
    }));
  }, []);

  const clearNoSpendToday = useCallback(() => {
    const today = formatDateISO(new Date());

    setState((previous) => ({
      ...previous,
      noSpendDays: previous.noSpendDays.filter((day) => day !== today),
    }));
  }, []);

  const selectors = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayExpenses = state.expenses.filter((expense) => {
      const date = new Date(expense.date);
      return date >= todayStart && date < tomorrow;
    });

    return {
      getTodayStats: () => ({
        total: sumExpenses(todayExpenses),
        count: todayExpenses.length,
        expenses: todayExpenses,
        noSpendMarked: state.noSpendDays.includes(formatDateISO(new Date())),
      }),
      getWeeklyStats: () => getCurrentPeriodStats(state.expenses, state.budgets, 'week'),
      getMonthlyStats: () => getCurrentPeriodStats(state.expenses, state.budgets, 'month'),
      getSpendingBySector: (sector) => ({
        week: sumExpenses(
          getRangeExpenses(state.expenses, getWeekStart()).filter((expense) => expense.sector === sector)
        ),
        month: sumExpenses(
          getRangeExpenses(state.expenses, getMonthStart()).filter((expense) => expense.sector === sector)
        ),
        count: state.expenses.filter((expense) => expense.sector === sector).length,
      }),
      getTrackingStreak: () => getTrackingStreak(state.expenses, state.noSpendDays),
      getBudgetStreak: () => getBudgetStreak(state.expenses, state.budgets),
      isDateTracked: (date) => {
        const day = formatDateISO(date);
        return (
          state.noSpendDays.includes(day) ||
          state.expenses.some((expense) => isSameDay(new Date(expense.date), getDateFromISO(day)))
        );
      },
    };
  }, [state]);

  return {
    expenses: state.expenses,
    budgets: state.budgets,
    currency: state.currency,
    noSpendDays: state.noSpendDays,
    addExpense,
    updateExpense,
    removeExpense,
    updateBudget,
    markNoSpendToday,
    clearNoSpendToday,
    ...selectors,
  };
};

export default useExpenses;
