import React from 'react';
import { Home, BarChart2, TrendingUp, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'investing', label: 'Investing', icon: TrendingUp },
  { id: 'transactions', label: 'Recent', icon: Wallet },
];

export const FloatingBottomNavbar = ({ activeTab, onTabSelect }) => {
  return (
    <nav className="sticky bottom-0 z-50 flex justify-center pb-5 pt-3 px-4 pointer-events-none w-full bg-transparent">
      <div className="pointer-events-auto flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900/85 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] w-full max-w-[340px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className="relative flex flex-col items-center justify-center w-[72px] h-[64px] rounded-[1.5rem] transition-colors duration-300 group outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNavTab"
                  className="absolute inset-0 bg-white/10 rounded-[1.5rem]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <motion.div 
                className={`relative z-10 flex flex-col items-center gap-1.5 ${
                  isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
                animate={{ scale: isActive ? 1.05 : 1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="transition-all duration-300" />
                <span className="text-[10px] font-medium tracking-wide">
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
