import React from 'react';
import { Home, BarChart2, TrendingUp, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'home',          label: 'Home',      icon: Home },
  { id: 'analytics',    label: 'Analytics',  icon: BarChart2 },
  { id: 'investing',    label: 'Invest',     icon: TrendingUp },
  { id: 'transactions', label: 'Recent',     icon: Wallet },
];

export const FloatingBottomNavbar = ({ activeTab, onTabSelect }) => {
  return (
    /* No overflow-hidden here — that was the clipping culprit */
    <nav className="sticky bottom-0 z-50 w-full px-4 pb-6 pt-3 pointer-events-none">
      <div
        className="relative pointer-events-auto flex items-center justify-around rounded-[2rem] w-full py-2 px-2"
        style={{
          background: 'rgba(18,18,22,0.92)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 16px 48px -8px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-[60px] rounded-[1.5rem] outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active pill */}
              {isActive && (
                <motion.div
                  layoutId="auraNavPill"
                  className="absolute inset-1 rounded-[1.25rem]"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}

              {/* Active top glow line */}
              {isActive && (
                <motion.div
                  layoutId="auraNavLine"
                  className="absolute top-[6px] left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #818cf8, #60a5fa)' }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}

              <motion.div
                className="relative z-10 flex flex-col items-center gap-[5px]"
                animate={{ scale: isActive ? 1.05 : 1, y: isActive ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                whileTap={{ scale: 0.85 }}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.3)' }}
                  className="transition-colors duration-200"
                />
                <span
                  className="text-[10px] font-medium tracking-wide transition-colors duration-200"
                  style={{ color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.28)' }}
                >
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
