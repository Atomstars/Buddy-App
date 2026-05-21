import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';
import { 
  TrendingDown, TrendingUp, ShoppingCart, 
  UtensilsCrossed, CarFront, ShoppingBag, Receipt, 
  HeartPulse, Sparkles, Activity, Wallet, ChevronRight 
} from 'lucide-react';

const categoryIcons = {
  food: UtensilsCrossed,
  groceries: ShoppingCart,
  shopping: ShoppingBag,
  health: HeartPulse,
  transport: CarFront,
  bills: Receipt,
  other: Wallet
};

const HeroCard = ({ monthlyStats, todayStats, weeklyStats }) => {
  const safeTotal = monthlyStats.total || 0;
  const safeRemaining = monthlyStats.remaining || 0;
  const healthScore = Math.min(100, Math.max(0, Math.round(100 - (safeTotal / (safeTotal + safeRemaining || 1)) * 100)));
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] p-8 shadow-2xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950 backdrop-blur-xl w-full"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-zinc-400 text-sm font-semibold tracking-wider uppercase mb-1">Remaining Balance</p>
            <h2 className="text-5xl font-bold tracking-tight text-white">{formatCurrency(Math.max(0, safeRemaining))}</h2>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2 shadow-sm">
              <Activity size={14} className="text-emerald-400" />
              <span className="text-white text-sm font-medium">{healthScore} Score</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4">
          <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingDown size={16} className="text-rose-400" />
              <p className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">Spent Today</p>
            </div>
            <p className="text-white font-semibold text-xl">{formatCurrency(todayStats.total || 0)}</p>
          </div>
          <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp size={16} className="text-amber-400" />
              <p className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">Weekly Burn</p>
            </div>
            <p className="text-white font-semibold text-xl">{formatCurrency(weeklyStats.total || 0)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const QuickActions = ({ onQuickAdd }) => {
  const quickCategories = [
    { id: 'food', label: 'Food', icon: UtensilsCrossed },
    { id: 'groceries', label: 'Groceries', icon: ShoppingCart },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'transport', label: 'Travel', icon: CarFront },
    { id: 'bills', label: 'Bills', icon: Receipt },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-zinc-100 font-semibold text-base px-1">Quick Add</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
        {quickCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onQuickAdd && onQuickAdd(cat.id)}
              key={cat.id}
              className="bg-zinc-900/50 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-colors rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 outline-none shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-300">
                <Icon size={20} />
              </div>
              <span className="text-xs font-medium text-zinc-400">{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const SmartInsights = ({ coach }) => {
  const insights = [
    { title: 'Weekly Trend', text: 'You spent 12% less this week than average.', icon: Sparkles, color: 'text-emerald-400' },
    { title: 'Budget Warning', text: 'You may exceed your shopping budget soon.', icon: TrendingUp, color: 'text-amber-400' }
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-zinc-100 font-semibold text-base px-1">AI Insights</h3>
      <div className="flex flex-col gap-4">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div key={idx} className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-5 flex gap-4 items-start h-full">
              <div className={`p-2.5 rounded-full bg-white/5 ${insight.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-white text-base font-medium mb-1">{insight.title}</p>
                <p className="text-zinc-400 text-sm leading-relaxed">{insight.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RecentTransactions = ({ expenses }) => {
  const latest = expenses ? expenses.slice(0, 3) : [];
  
  if (!latest.length) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <h3 className="text-zinc-100 font-semibold text-base px-1">Recent Transactions</h3>
        <div className="text-center py-8 text-zinc-500 text-sm">No recent transactions.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-zinc-100 font-semibold text-base">Recent Transactions</h3>
        <button className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition-colors outline-none">
          View All <ChevronRight size={14} />
        </button>
      </div>
      <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden">
        {latest.map((exp, idx) => {
          const Icon = categoryIcons[exp.sector] || Wallet;
          const isLast = idx === latest.length - 1;
          const dateStr = new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          
          return (
            <div key={exp.id} className={`flex items-center justify-between p-5 sm:px-6 ${!isLast ? 'border-b border-white/5' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-300">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-white text-base font-medium capitalize">{exp.note || exp.sector}</p>
                  <p className="text-zinc-500 text-sm">{dateStr}</p>
                </div>
              </div>
              <div className="text-white font-semibold text-base">
                -{formatCurrency(exp.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BudgetDashboard = ({
  monthlyStats,
  todayStats,
  weeklyStats,
  coach,
  expenses,
  selectedDate,
  onDateSelect,
  onQuickAdd
}) => {
  return (
    <div className="flex flex-col gap-10 pb-16 w-full">
      <HeroCard monthlyStats={monthlyStats} todayStats={todayStats} weeklyStats={weeklyStats} />
      <QuickActions onQuickAdd={onQuickAdd} />
      <SmartInsights coach={coach} />
      <RecentTransactions expenses={expenses} />
    </div>
  );
};
