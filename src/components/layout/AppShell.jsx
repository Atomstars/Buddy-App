import React from 'react';
import { Home, Settings } from 'lucide-react';
import { FloatingBottomNavbar } from './FloatingBottomNavbar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ModuleHeader = ({ title, onProfileClick }) => {
  const navigate = useNavigate();
  return (
    <header className="aura-module-header">
      <motion.button
        onClick={() => navigate('/', { replace: true })}
        className="aura-header-icon-btn"
        whileTap={{ scale: 0.9 }}
        aria-label="Home"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Home size={16} />
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="aura-module-header-title"
      >
        {title}
      </motion.h1>

      <motion.button
        onClick={onProfileClick}
        className="aura-header-icon-btn"
        whileTap={{ scale: 0.9 }}
        aria-label="Settings"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Settings size={16} />
      </motion.button>
    </header>
  );
};

export const AppShell = ({ children, title = 'Aura', onProfileClick, onFABPress }) => {
  return (
    <div className="aura-app-shell">
      <ModuleHeader title={title} onProfileClick={onProfileClick} />
      <main className="aura-module-content">
        {children}
      </main>
      <FloatingBottomNavbar onFABPress={onFABPress} />
    </div>
  );
};
