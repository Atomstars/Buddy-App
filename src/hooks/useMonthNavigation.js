import { useState, useCallback } from 'react';

/**
 * useMonthNavigation
 * Manages the currently-selected month across the app.
 * Initial value: current month.
 */
export const useMonthNavigation = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(), // 0-indexed
  });

  const prevMonth = useCallback(() => {
    setSelectedMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  }, []);

  const nextMonth = useCallback(() => {
    setSelectedMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  }, []);

  const goToMonth = useCallback((year, month) => {
    setSelectedMonth({ year, month });
  }, []);

  const goToToday = useCallback(() => {
    const n = new Date();
    setSelectedMonth({ year: n.getFullYear(), month: n.getMonth() });
  }, []);

  /** 'YYYY-MM' string e.g. '2026-06' */
  const monthKey = `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, '0')}`;

  /** Human-readable e.g. 'June 2026' */
  const displayLabel = new Date(selectedMonth.year, selectedMonth.month, 1)
    .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const isCurrentMonth =
    selectedMonth.year === now.getFullYear() && selectedMonth.month === now.getMonth();

  const isFutureMonth =
    selectedMonth.year > now.getFullYear() ||
    (selectedMonth.year === now.getFullYear() && selectedMonth.month > now.getMonth());

  /** JS Date for the first day of selected month */
  const monthStart = new Date(selectedMonth.year, selectedMonth.month, 1);

  /** JS Date for the last day of selected month */
  const monthEnd = new Date(selectedMonth.year, selectedMonth.month + 1, 0, 23, 59, 59, 999);

  return {
    selectedMonth,
    monthKey,
    displayLabel,
    isCurrentMonth,
    isFutureMonth,
    monthStart,
    monthEnd,
    prevMonth,
    nextMonth,
    goToMonth,
    goToToday,
  };
};

export default useMonthNavigation;
