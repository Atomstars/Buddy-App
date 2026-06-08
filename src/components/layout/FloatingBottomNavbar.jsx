import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Wallet, Plus, CalendarDays, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { id: 'home',     label: 'Home',     icon: Home,         path: '/' },
  { id: 'budget',   label: 'Budget',   icon: Wallet,       path: '/budget' },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays, path: '/schedule' },
  { id: 'diary',    label: 'Diary',    icon: BookOpen,     path: '/diary' },
];

export const FloatingBottomNavbar = ({ onFABPress }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = (() => {
    const p = location.pathname;
    if (p === '/')          return 'home';
    if (p === '/budget')    return 'budget';
    if (p === '/schedule')  return 'schedule';
    if (p === '/diary')     return 'diary';
    return 'home';
  })();

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      style={{
        position: 'fixed', bottom: 0, left: '50%',
        width: '100%', maxWidth: '480px', zIndex: 100,
        padding: '0 16px 24px', pointerEvents: 'none'
      }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(17, 17, 19, 0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '28px',
        padding: '8px 12px', pointerEvents: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Left 2 tabs */}
        {TABS.slice(0, 2).map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TabButton key={tab.id} tab={tab} Icon={Icon} isActive={isActive} onClick={() => navigate(tab.path)} />
          );
        })}

        {/* Center FAB */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 8px' }}>
          <motion.button
            onClick={onFABPress}
            whileTap={{ scale: 0.9 }}
            aria-label="Add"
            style={{
              width: 52, height: 52, borderRadius: 26,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent', outline: 'none',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)', marginTop: '-20px'
            }}
          >
            <motion.div animate={{ rotate: [0, 0] }} whileTap={{ rotate: 45 }} transition={{ duration: 0.2 }}>
              <Plus size={24} strokeWidth={3} color="#fff" />
            </motion.div>
          </motion.button>
        </div>

        {/* Right 2 tabs */}
        {TABS.slice(2).map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TabButton key={tab.id} tab={tab} Icon={Icon} isActive={isActive} onClick={() => navigate(tab.path)} />
          );
        })}
      </div>
    </motion.nav>
  );
};

const TabButton = ({ tab, Icon, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.9 }}
    style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'none', border: 'none', padding: '12px 4px 16px 4px', cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent', outline: 'none', position: 'relative', minHeight: 52
    }}
    aria-label={tab.label}
  >
    <motion.div
      style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
      animate={{ scale: isActive ? 1.05 : 1, y: isActive ? -4 : 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'color 0.2s ease' }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', opacity: isActive ? 1 : 0, transition: 'all 0.2s ease', position: 'absolute', top: 26, whiteSpace: 'nowrap' }}>
        {tab.label}
      </span>
    </motion.div>
  </motion.button>
);

export default FloatingBottomNavbar;
