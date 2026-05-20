import React from 'react';
import { Home, LineChart, Target, CalendarDays, Compass, CheckSquare, BrainCircuit, Rocket, CalendarClock, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const getTabsForService = (service) => {
  if (service === 'budget') {
    return [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'analytics', label: 'Analytics', icon: LineChart },
      { id: 'investing', label: 'Investing', icon: Rocket, isPremium: true },
      { id: 'transactions', label: 'Recent', icon: Wallet }
    ];
  }
  if (service === 'schedule') {
    return [
      { id: 'home', label: 'Home', icon: CalendarDays },
      { id: 'analytics', label: 'Insights', icon: Target },
      { id: 'recent', label: 'History', icon: CheckSquare },
      { id: 'smart', label: 'Smart AI', icon: CalendarClock, isPremium: true }
    ];
  }
  if (service === 'manifest') {
    return [
      { id: 'home', label: 'Visions', icon: Compass },
      { id: 'plan', label: 'Plan', icon: Target, isPremium: true },
      { id: 'ai', label: 'Vision AI', icon: BrainCircuit, isPremium: true },
      { id: 'milestones', label: 'Milestones', icon: CheckSquare, isPremium: true }
    ];
  }
  return [];
};

export const Taskbar = ({ activeService, activeTab, onTabSelect }) => {
  const tabs = getTabsForService(activeService);

  if (!tabs.length) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pt-2 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto">
        <div className="flex items-center justify-around bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl mb-4 px-2 py-2 shadow-2xl shadow-black/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabSelect(tab.id)}
                className="relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white/10 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                <motion.div 
                  whileTap={{ scale: 0.85 }}
                  className={`relative z-10 flex flex-col items-center gap-1 ${
                    isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-all duration-300" />
                  <span className="text-[10px] font-medium tracking-wide">
                    {tab.label}
                  </span>
                </motion.div>
                
                {isActive && (
                  <motion.div 
                    layoutId="activeTabDot"
                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
