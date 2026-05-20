import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, CreditCard, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getUserDisplayName, signOut } = useAuth();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button className="user-profile-btn" onClick={() => setIsOpen(!isOpen)}>
        <User size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 240,
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: '8px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 600 }}>Signed in as</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)' }}>
                {getUserDisplayName()}
              </div>
            </div>

            <button className="menu-item">
              <Shield size={16} /> Manage Account
            </button>
            <button className="menu-item">
              <Settings size={16} /> App Settings
            </button>
            <button className="menu-item">
              <CreditCard size={16} /> Subscription & Plans
            </button>
            
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            
            <button className="menu-item danger" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: transparent;
          color: var(--text-2);
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .menu-item:hover {
          background: var(--surface-2);
          color: var(--text-1);
        }
        .menu-item.danger {
          color: var(--rose);
        }
        .menu-item.danger:hover {
          background: var(--rose-soft);
        }
      `}</style>
    </div>
  );
};
