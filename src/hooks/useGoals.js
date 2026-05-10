import { useEffect, useMemo, useState } from 'react';
import { formatDateISO } from '../utils/dateUtils';

const GOAL_STORAGE_KEY = 'budget-buddy-goals';

const defaultGoals = [
  {
    id: 'goal-sample-phone',
    title: 'New phone',
    targetAmount: 30000,
    currentAmount: 0,
    deadline: formatDateISO(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 28)),
    createdAt: 1,
    entries: [],
  },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const normalizeGoal = (goal) => ({
  id: goal.id || generateId(),
  title: goal.title || 'Savings goal',
  targetAmount: Math.max(0, Number(goal.targetAmount) || 0),
  currentAmount: Math.max(0, Number(goal.currentAmount) || 0),
  deadline: goal.deadline || formatDateISO(new Date()),
  createdAt: goal.createdAt || Date.now(),
  entries: Array.isArray(goal.entries) ? goal.entries : [],
});

const readGoals = () => {
  try {
    const saved = window.localStorage.getItem(GOAL_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : defaultGoals;
    return Array.isArray(parsed) ? parsed.map(normalizeGoal) : defaultGoals;
  } catch {
    return defaultGoals;
  }
};

export const useGoals = () => {
  const [goals, setGoals] = useState(readGoals);

  useEffect(() => {
    try {
      window.localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goals));
    } catch {
      // Goals remain usable for this session.
    }
  }, [goals]);

  const addGoal = (goal) => {
    setGoals((current) => [
      normalizeGoal({
        ...goal,
        id: generateId(),
        currentAmount: goal.currentAmount || 0,
        createdAt: Date.now(),
        entries: [],
      }),
      ...current,
    ]);
  };

  const fundGoal = (goalId, amount, source = 'manual') => {
    const cleanAmount = Math.max(0, Number(amount) || 0);
    if (cleanAmount <= 0) return;

    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              currentAmount: Math.min(goal.targetAmount, goal.currentAmount + cleanAmount),
              entries: [
                {
                  id: generateId(),
                  amount: cleanAmount,
                  source,
                  date: new Date().toISOString(),
                },
                ...goal.entries,
              ],
            }
          : goal
      )
    );
  };

  const removeGoal = (goalId) => {
    setGoals((current) => current.filter((goal) => goal.id !== goalId));
  };

  const summary = useMemo(() => {
    const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const saved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    return {
      target,
      saved,
      remaining: Math.max(0, target - saved),
      count: goals.length,
    };
  }, [goals]);

  return {
    goals,
    goalSummary: summary,
    addGoal,
    fundGoal,
    removeGoal,
  };
};

export default useGoals;
