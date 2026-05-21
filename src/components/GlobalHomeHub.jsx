import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Calendar, TrendingUp, Compass, User } from 'lucide-react';
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
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const services = [
    {
      id: 'budget',
      title: 'Budget',
      desc: 'Financial command center.',
      icon: Wallet,
      color: 'from-emerald-500/20 to-emerald-900/40 text-emerald-400',
      path: '/budget'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      desc: 'Time architecture.',
      icon: Calendar,
      color: 'from-blue-500/20 to-blue-900/40 text-blue-400',
      path: '/schedule'
    },
    {
      id: 'investing',
      title: 'Investing',
      desc: 'Wealth accumulation.',
      icon: TrendingUp,
      color: 'from-purple-500/20 to-purple-900/40 text-purple-400',
      path: '/investing'
    },
    {
      id: 'manifest',
      title: 'Vision Board',
      desc: 'Life design and goals.',
      icon: Compass,
      color: 'from-amber-500/20 to-amber-900/40 text-amber-400',
      path: '/manifest'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-black text-zinc-50 pb-safe relative overflow-x-hidden selection:bg-zinc-800">
      <header className="w-full max-w-md mx-auto px-4 pt-12 pb-6 flex justify-between items-start">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <p className="text-zinc-400 text-sm font-medium tracking-wide uppercase">
            {getGreeting()}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white m-0 leading-tight">
            {userName || 'Akash'}
          </h1>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-zinc-700/80 transition-all hover:scale-105 outline-none shadow-xl"
        >
          <User size={18} />
        </motion.button>
      </header>

      <main className="w-full max-w-md mx-auto px-4 flex flex-col gap-10 pb-12">
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 flex flex-col gap-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <p className="text-zinc-400 text-[11px] font-semibold tracking-wider uppercase">Remaining</p>
             <p className="text-2xl font-bold text-white">{formatCurrency(Math.max(0, monthlyRemaining || 0))}</p>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 flex flex-col gap-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <p className="text-zinc-400 text-[11px] font-semibold tracking-wider uppercase">Tasks Today</p>
             <p className="text-2xl font-bold text-white">{tasksToday || 0}</p>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 flex flex-col gap-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <p className="text-zinc-400 text-[11px] font-semibold tracking-wider uppercase">Streak</p>
             <p className="text-2xl font-bold text-white">{streakCount} Days</p>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 flex flex-col gap-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <p className="text-zinc-400 text-[11px] font-semibold tracking-wider uppercase">Vision</p>
             <p className="text-2xl font-bold text-white">{visionProgress}%</p>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <h2 className="text-zinc-100 font-semibold text-sm px-1">Modules</h2>
          <div className="flex flex-col gap-4">
            {services.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.button
                  key={svc.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(svc.path)}
                  className="bg-zinc-900/50 backdrop-blur-md border border-white/5 hover:bg-white/10 transition-colors rounded-[1.75rem] p-5 flex flex-col items-start gap-4 text-left outline-none relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${svc.color} blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none rounded-full translate-x-1/3 -translate-y-1/3`} />
                  
                  <div className={`w-12 h-12 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center relative z-10 ${svc.color.split(' ')[1]}`}>
                    <Icon size={22} />
                  </div>
                  
                  <div className="relative z-10 flex flex-col gap-1 mt-2">
                    <h3 className="text-white font-semibold text-base">{svc.title}</h3>
                    <p className="text-zinc-400 text-xs leading-tight pr-2">{svc.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </main>
    </div>
  );
};
