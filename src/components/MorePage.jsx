import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Moon, Shield, LogOut, ChevronRight, Sparkles, Sun,
  User, Mail, CreditCard, Check, X, Pencil, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MorePage = ({ userName, userEmail, onSignOut, onUpdateName }) => {
  const navigate = useNavigate();
  const [showEditName, setShowEditName] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');
  const [nameSaved, setNameSaved] = useState(false);
  const [theme, setTheme] = useState('Dark');
  const [notifs, setNotifs] = useState(true);

  const initials = (userName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateName?.(nameInput.trim());
      setNameSaved(true);
      setTimeout(() => { setNameSaved(false); setShowEditName(false); }, 1200);
    }
  };

  return (
    <div className="aura-more">

      {/* ── Profile Card ── */}
      <motion.div
        className="aura-more-profile"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ flexDirection: 'column', gap: 0, padding: '20px 20px 0', background: 'none', border: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div className="aura-more-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {showEditName ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  id="edit-name-input"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1, height: 36, background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10,
                    padding: '0 10px', color: '#fff', fontSize: 14, outline: 'none',
                  }}
                />
                <button
                  id="save-name-btn"
                  onClick={handleSaveName}
                  style={{ width: 32, height: 32, borderRadius: 8, background: nameSaved ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {nameSaved ? <Check size={14} color="#fff" /> : <Check size={14} color="#fff" />}
                </button>
                <button
                  onClick={() => { setShowEditName(false); setNameInput(userName || ''); }}
                  style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} color="rgba(255,255,255,0.5)" />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p className="aura-more-name">{userName || 'Guest User'}</p>
                <button
                  id="edit-profile-btn"
                  onClick={() => { setNameInput(userName || ''); setShowEditName(true); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 2 }}>
                  <Pencil size={13} />
                </button>
              </div>
            )}
            {userEmail && <p className="aura-more-email">{userEmail}</p>}
          </div>
          <div className="aura-more-plan">FREE</div>
        </div>
      </motion.div>

      {/* ── Prime Upgrade Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.07))',
          border: '1px solid rgba(245,158,11,0.22)', borderRadius: 'var(--r-xl)',
          marginBottom: 6, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={16} style={{ color: '#fbbf24' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24', marginBottom: 1 }}>Upgrade to Prime</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>AI insights · ₹99/month</p>
        </div>
        <ChevronRight size={16} style={{ color: 'rgba(245,158,11,0.6)' }} />
      </motion.div>

      {/* ── Account Info Section ── */}
      <motion.div className="aura-settings-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="aura-settings-section-label">Account</p>

        {/* Email (read-only) */}
        <div className="aura-settings-row" style={{ pointerEvents: 'none' }}>
          <div className="aura-settings-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <Mail size={16} style={{ color: '#818cf8' }} />
          </div>
          <span className="aura-settings-label">Email</span>
          <span className="aura-settings-value" style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userEmail || '—'}
          </span>
        </div>

        {/* Plan */}
        <div className="aura-settings-row" style={{ pointerEvents: 'none' }}>
          <div className="aura-settings-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CreditCard size={16} style={{ color: '#34d399' }} />
          </div>
          <span className="aura-settings-label">Current Plan</span>
          <span className="aura-settings-value">Free</span>
        </div>

        {/* Privacy */}
        <div id="privacy-row" className="aura-settings-row" style={{ cursor: 'pointer' }}>
          <div className="aura-settings-icon" style={{ background: 'rgba(20,184,166,0.12)' }}>
            <Shield size={16} style={{ color: '#2dd4bf' }} />
          </div>
          <span className="aura-settings-label">Privacy & Security</span>
          <ChevronRight size={16} className="aura-settings-chevron" />
        </div>

        {/* Budget Settings */}
        <div id="budget-settings-row" className="aura-settings-row" onClick={() => navigate('/budget-settings')} style={{ cursor: 'pointer' }}>
          <div className="aura-settings-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Wallet size={16} style={{ color: '#10b981' }} />
          </div>
          <span className="aura-settings-label">Budget Settings</span>
          <ChevronRight size={16} className="aura-settings-chevron" />
        </div>
      </motion.div>

      {/* ── Preferences Section ── */}
      <motion.div className="aura-settings-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <p className="aura-settings-section-label">Preferences</p>

        {/* Notifications toggle */}
        <div id="notifications-row" className="aura-settings-row" onClick={() => setNotifs(n => !n)} style={{ cursor: 'pointer' }}>
          <div className="aura-settings-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <Bell size={16} style={{ color: '#818cf8' }} />
          </div>
          <span className="aura-settings-label">Notifications</span>
          <div style={{
            width: 40, height: 22, borderRadius: 11,
            background: notifs ? '#6366f1' : 'rgba(255,255,255,0.12)',
            position: 'relative', transition: 'background 0.25s', flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', top: 3, left: notifs ? 20 : 3, width: 16, height: 16,
              borderRadius: '50%', background: '#fff', transition: 'left 0.25s',
            }} />
          </div>
        </div>

        {/* Theme toggle */}
        <div id="theme-row" className="aura-settings-row" onClick={() => setTheme(t => t === 'Dark' ? 'Light' : 'Dark')} style={{ cursor: 'pointer' }}>
          <div className="aura-settings-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
            {theme === 'Dark' ? <Moon size={16} style={{ color: '#a78bfa' }} /> : <Sun size={16} style={{ color: '#fbbf24' }} />}
          </div>
          <span className="aura-settings-label">Appearance</span>
          <span className="aura-settings-value">{theme}</span>
          <ChevronRight size={16} className="aura-settings-chevron" />
        </div>
      </motion.div>

      {/* ── Sign Out ── */}
      <motion.button
        id="sign-out-btn"
        className="aura-signout-btn"
        onClick={onSignOut}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        whileTap={{ scale: 0.97 }}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <LogOut size={16} />
        Sign Out
      </motion.button>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 8, paddingBottom: 4 }}>
        Aura v2.1.0 · Built with ✦
      </p>
    </div>
  );
};

export default MorePage;
