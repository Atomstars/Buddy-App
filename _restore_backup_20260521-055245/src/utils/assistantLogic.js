import { Coffee, Flame, Leaf, ShieldCheck, TrendingUp } from 'lucide-react';
import { formatCurrency, getSectorShortLabel } from './formatters';
import { getMonthEnd, getMonthStart, getWeekEnd } from './dateUtils';

export const moduleLabels = {
  budget: 'Budget',
  timetable: 'Timetable',
};

export const viewLabels = {
  today: 'Today',
  week: 'Week',
  month: 'Month',
};

export const getDaysLeftInclusive = (endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((end - today) / 86400000) + 1);
};

export const getDaysPassedInclusive = (startDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((today - start) / 86400000) + 1);
};

export const getDaysInMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

export const getCoachState = ({ weeklyStats, monthlyStats, todayStats, zeroDayStreak, tasks }) => {
  const isFriday = new Date().getDay() === 5;
  const safeWeekly = Math.max(0, weeklyStats.remaining) / getDaysLeftInclusive(getWeekEnd());
  const safeMonthly = Math.max(0, monthlyStats.remaining) / getDaysLeftInclusive(getMonthEnd());
  
  const monthProjection = (monthlyStats.total / getDaysPassedInclusive(getMonthStart())) * getDaysInMonth();
  const expectedMonthSpend =
    (monthlyStats.totalBudget / getDaysInMonth()) * getDaysPassedInclusive(getMonthStart());
  const paceGap = monthlyStats.total - expectedMonthSpend;
  
  const biggestSector = weeklyStats.bySector.reduce(
    (leader, item) => (item.amount > leader.amount ? item : leader),
    weeklyStats.bySector[0]
  );
  
  const nextTask = tasks.find((task) => !task.done);

  let tone = 'steady';
  let title = 'Budget is steady';
  let nudge = `Safe to spend: ${formatCurrency(safeWeekly)} per day this week.`;
  let icon = ShieldCheck;

  // Friday Special: Weekly Streak Recap
  if (isFriday) {
    title = 'Weekly Streak Recap';
    nudge = zeroDayStreak.streak > 0 
      ? `Phenomenal! You hit ${zeroDayStreak.streak} zero-days this week. Keep pushing!`
      : 'Friday check-in: Let\'s aim for a zero-day weekend to boost your streak.';
    tone = zeroDayStreak.streak >= 2 ? 'win' : 'steady';
  } else if (weeklyStats.remaining < 0) {
    tone = 'alert';
    title = 'Budget alert';
    icon = TrendingUp;
    nudge = `This week is over by ${formatCurrency(Math.abs(weeklyStats.remaining))}. Keep new spends intentional.`;
  } else if (paceGap > monthlyStats.totalBudget * 0.08) {
    tone = 'watch';
    title = 'Watch pace';
    icon = Coffee;
    nudge = `Month pace is high. Aim near ${formatCurrency(safeMonthly)} per day now.`;
  } else if (todayStats.count === 0 && !todayStats.noSpendMarked) {
    tone = 'quiet';
    title = 'First action pending';
    icon = Leaf;
    nudge = nextTask ? `Start with "${nextTask.title}" or mark no-spend.` : 'Log one expense or mark no-spend today.';
  } else if (zeroDayStreak.active) {
    tone = 'win';
    title = 'ZERO DAY active';
    icon = Flame;
    nudge = `${zeroDayStreak.streak} streak days! Buffer active until ${zeroDayStreak.activeUntil}.`;
  }

  return {
    title,
    nudge,
    tone,
    icon,
    safeWeekly,
    safeMonthly,
    monthProjection,
    biggestSector,
    biggestLabel: getSectorShortLabel(biggestSector?.sector),
    nextTask,
    monthlyPace: paceGap > 0 ? 'over' : 'under',
  };
};
