import React from 'react';
import { Home, ChevronLeft } from 'lucide-react';
import { FloatingBottomNavbar } from './FloatingBottomNavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { Moon, Sun, Settings } from 'lucide-react';

const ModuleHeader = ({ title, onProfileClick }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-3 flex items-center justify-between backdrop-blur-2xl bg-zinc-950/80 border-b border-white/5">
      <button
        onClick={() => navigate('/', { replace: true })}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <Home size={16} />
        </div>
        <span className="text-xs font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">Hub</span>
      </button>

      <motion.h1
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-semibold text-white tracking-wide"
      >
        {title}
      </motion.h1>

      <button
        onClick={onProfileClick}
        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors outline-none"
      >
        <Settings size={15} />
      </button>
    </header>
  );
};

export const AppShell = ({
  children,
  activeTab,
  onTabSelect,
  onProfileClick,
  title = 'Budget'
}) => {
  return (
    <div className="w-full flex flex-col overflow-x-hidden" style={{ minHeight: '100dvh', background: '#09090b', color: '#fafafa' }}>
      <ModuleHeader title={title} onProfileClick={onProfileClick} />
      
      <main className="flex-1 w-full px-4 pt-4 pb-8 flex flex-col gap-5">
        {children}
      </main>

      <FloatingBottomNavbar activeTab={activeTab} onTabSelect={onTabSelect} />
    </div>
  );
};
