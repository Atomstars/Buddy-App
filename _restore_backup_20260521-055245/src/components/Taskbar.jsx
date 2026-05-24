import React from 'react';
import { CalendarDays, WalletCards } from 'lucide-react';
import { motion } from 'framer-motion';

const serviceTabs = [
  { id: 'budget', label: 'Budget', icon: WalletCards },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
];

export const Taskbar = ({ activeService, onServiceSelect }) => {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-5 sm:pb-7">
      <div className="pointer-events-auto w-full max-w-sm">
        <div className="relative flex items-center justify-between rounded-[28px] border border-white/10 bg-zinc-900/70 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/10 to-white/[0.02]" />
          {serviceTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeService === tab.id;

            return (
              <button
                key={tab.id}
                className="relative z-10 flex h-14 flex-1 items-center justify-center rounded-3xl text-sm font-semibold tracking-tight"
                onClick={() => onServiceSelect(tab.id)}
                type="button"
              >
                {isActive && (
                  <motion.div
                    layoutId="service-pill"
                    className="absolute inset-0 rounded-3xl bg-white text-zinc-950 shadow-lg shadow-white/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <motion.span
                  className={`relative flex items-center gap-2 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`}
                  animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.02 : 1 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                >
                  <motion.span
                    animate={{ rotate: isActive ? [0, -8, 0] : 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Icon size={19} strokeWidth={isActive ? 2.6 : 2.1} />
                  </motion.span>
                  {tab.label}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
