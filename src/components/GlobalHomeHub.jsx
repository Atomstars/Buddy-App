import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Calendar, TrendingUp, Compass, User, Zap, Target, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

export const GlobalHomeHub = ({
  userName,
  monthlyRemaining,
  tasksToday,
  streakCount = 12,
  visionProgress = 40,
  onProfileClick
}) => {
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5)  return 'Good Night';
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const services = [
    {
      id: 'budget',
      title: 'Budget',
      desc: 'Track spending',
      icon: Wallet,
      glow: '#34d399',
      bg: 'from-emerald-500/15 to-emerald-900/5',
      iconColor: 'text-emerald-400',
      path: '/budget'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      desc: 'Own your time',
      icon: Calendar,
      glow: '#60a5fa',
      bg: 'from-blue-500/15 to-blue-900/5',
      iconColor: 'text-blue-400',
      path: '/schedule'
    },
    {
      id: 'investing',
      title: 'Invest',
      desc: 'Grow wealth',
      icon: TrendingUp,
      glow: '#a78bfa',
      bg: 'from-violet-500/15 to-violet-900/5',
      iconColor: 'text-violet-400',
      path: '/investing'
    },
    {
      id: 'manifest',
      title: 'Vision',
      desc: 'Design life',
      icon: Compass,
      glow: '#fbbf24',
      bg: 'from-amber-500/15 to-amber-900/5',
      iconColor: 'text-amber-400',
      path: '/manifest'
    }
  ];

  const firstName = (userName || 'Akash').split(' ')[0];

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden pb-10 relative selection:bg-zinc-800">

      {/* Ambient background layers */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-0 w-48 h-48 bg-emerald-500/8 rounded-full blur-[80px]" />
        <div className="absolute bottom-40 left-0 w-48 h-48 bg-blue-500/8 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-5 pt-12 pb-2 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase mb-0.5">
            {getGreeting()}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
            {firstName} <span className="text-zinc-400 font-light">✦</span>
          </h1>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all outline-none shadow-lg"
        >
          <User size={17} />
        </motion.button>
      </header>

      {/* Hero Financial Card */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 mx-4 mt-6"
      >
        <div className="relative rounded-[1.75rem] overflow-hidden">
          {/* Card gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/80 via-zinc-900/90 to-zinc-950 border border-white/8 rounded-[1.75rem]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-zinc-500 text-[11px] font-semibold tracking-widest uppercase mb-1">Available Balance</p>
                <p className="text-4xl font-bold text-white tracking-tight leading-none">
                  {formatCurrency(Math.max(0, monthlyRemaining || 0))}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[11px] font-semibold">Live</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <Flame size={10} className="text-rose-400" />
                  <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wide">Streak</span>
                </div>
                <p className="text-white font-semibold text-sm">{streakCount}d</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <Target size={10} className="text-blue-400" />
                  <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wide">Tasks</span>
                </div>
                <p className="text-white font-semibold text-sm">{tasksToday || 0}</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <Zap size={10} className="text-amber-400" />
                  <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wide">Vision</span>
                </div>
                <p className="text-white font-semibold text-sm">{visionProgress}%</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Module Grid */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 px-4 mt-6"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">Modules</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <motion.button
                key={svc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(svc.path)}
                className={`relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${svc.bg} border border-white/6 p-5 flex flex-col gap-3 text-left outline-none group`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Glow blob */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none"
                  style={{ background: svc.glow }}
                />
                {/* Top shimmer line */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                <div className={`w-10 h-10 rounded-2xl bg-zinc-950/60 border border-white/8 flex items-center justify-center ${svc.iconColor}`}>
                  <Icon size={18} />
                </div>

                <div>
                  <p className="text-white font-semibold text-sm leading-tight">{svc.title}</p>
                  <p className="text-zinc-500 text-[11px] mt-0.5">{svc.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* AI Insight strip */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 px-4 mt-6"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">AI Insights</p>
          <div className="flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">
            <Zap size={9} className="text-violet-400" />
            <span className="text-violet-400 text-[10px] font-medium">Live</span>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { icon: '📉', title: 'Spending down 12%', sub: 'vs last week', color: 'text-emerald-400', bg: 'from-emerald-500/8 to-transparent' },
            { icon: '⚡', title: 'Budget pacing on track', sub: 'for this month', color: 'text-blue-400', bg: 'from-blue-500/8 to-transparent' },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 bg-gradient-to-r ${item.bg} border border-white/5 rounded-2xl px-4 py-3`}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.color}`}>{item.title}</p>
                <p className="text-zinc-500 text-[11px]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
