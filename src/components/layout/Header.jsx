import React from 'react';
import { User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const Header = ({ onProfileClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 backdrop-blur-2xl bg-black/70 border-b border-white/5 pt-safe w-full">
      <div className="flex-1 flex justify-start">
        <button 
          onClick={toggleTheme}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white outline-none"
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>
      
      <div className="flex-1 flex justify-center">
        <h1 className="text-[20px] font-bold tracking-tight text-white m-0 leading-none" style={{ fontFamily: 'var(--font-display, inherit)' }}>
          Buddy
        </h1>
      </div>
      
      <div className="flex-1 flex justify-end">
        <button 
          onClick={onProfileClick}
          className="w-9 h-9 rounded-full bg-zinc-800/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-zinc-700/80 transition-all hover:scale-105 shadow-sm outline-none"
        >
          <User size={18} />
        </button>
      </div>
    </header>
  );
};
