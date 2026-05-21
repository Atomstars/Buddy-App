import React from 'react';
import { Home, BarChart2, TrendingUp, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { id: 'home',         label: 'Home',      icon: Home },
  { id: 'analytics',   label: 'Analytics',  icon: BarChart2 },
  { id: 'investing',   label: 'Invest',     icon: TrendingUp },
  { id: 'transactions',label: 'Recent',     icon: Wallet },
];

export const FloatingBottomNavbar = ({ activeTab, onTabSelect }) => {
  return (
    <nav className="sticky bottom-0 z-50 flex justify-center pb-5 pt-2 px-4 pointer-events-none w-full">
      <div className="relative pointer-events-auto flex items-center justify-between gap-1 px-2 py-2 rounded-[2rem] w-full shadow-[0_8px_32px_-4px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden">

        {/* Glass background layers */}
        <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-3xl rounded-[2rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent rounded-[2rem]" />
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-[58px] rounded-[1.5rem] transition-colors duration-200 group outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active pill bg */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="navActivePill"
                    className="absolute inset-1 bg-white/10 rounded-[1.25rem]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </AnimatePresence>

              {/* Active glow dot */}
              {isActive && (
                <motion.div
                  layoutId="navGlowDot"
                  className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              <motion.div
                className={`relative z-10 flex flex-col items-center gap-1 ${
                  isActive ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'
                }`}
                animate={{ scale: isActive ? 1.05 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                whileTap={{ scale: 0.88 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-200"
                />
                <span className={`text-[10px] font-medium tracking-wide transition-all duration-200 ${
                  isActive ? 'text-white/90' : 'text-zinc-600'
                }`}>
                  {tab.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
