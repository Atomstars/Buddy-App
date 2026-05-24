import React from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Moon, Download, CreditCard, Shield, LogOut, ChevronRight, Sparkles, User,
} from 'lucide-react';

const MorePage = ({ userName, userEmail, onSignOut }) => {
  const initials = (userName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="aura-more">
      {/* Profile card */}
      <motion.div
        className="aura-more-profile"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="aura-more-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="aura-more-name">{userName || 'Guest User'}</p>
          {userEmail && <p className="aura-more-email">{userEmail}</p>}
        </div>
        <div className="aura-more-plan">FREE</div>
      </motion.div>

      {/* Prime upgrade strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.07))',
          border: '1px solid rgba(245,158,11,0.22)',
          borderRadius: 'var(--r-xl)',
          marginBottom: '6px',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Sparkles size={16} style={{ color: '#fbbf24' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24', marginBottom: '1px' }}>Upgrade to Prime</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>AI insights · ₹99/month</p>
        </div>
        <ChevronRight size={16} style={{ color: 'rgba(245,158,11,0.6)' }} />
      </motion.div>

      {/* Settings sections */}
      {[
        {
          label: 'Preferences',
          rows: [
            { id: 'notifications', icon: Bell, label: 'Notifications', value: 'On', iconBg: 'rgba(99,102,241,0.12)', iconColor: '#818cf8' },
            { id: 'theme', icon: Moon, label: 'Appearance', value: 'Dark', iconBg: 'rgba(139,92,246,0.12)', iconColor: '#a78bfa' },
          ],
        },
        {
          label: 'Finance',
          rows: [
            { id: 'budget', icon: CreditCard, label: 'Budget Settings', value: '', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#34d399' },
            { id: 'export', icon: Download, label: 'Export Data', value: '', iconBg: 'rgba(245,158,11,0.12)', iconColor: '#fbbf24' },
          ],
        },
        {
          label: 'Account',
          rows: [
            { id: 'security', icon: Shield, label: 'Privacy & Security', value: '', iconBg: 'rgba(20,184,166,0.12)', iconColor: '#2dd4bf' },
            { id: 'plan', icon: CreditCard, label: 'Subscription Plan', value: 'Free', iconBg: 'rgba(99,102,241,0.12)', iconColor: '#818cf8' },
          ],
        },
      ].map((section, si) => (
        <motion.div
          key={section.label}
          className="aura-settings-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 + si * 0.05 }}
        >
          <p className="aura-settings-section-label">{section.label}</p>
          {section.rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.id} className="aura-settings-row">
                <div
                  className="aura-settings-icon"
                  style={{ background: row.iconBg }}
                >
                  <Icon size={16} style={{ color: row.iconColor }} />
                </div>
                <span className="aura-settings-label">{row.label}</span>
                {row.value && <span className="aura-settings-value">{row.value}</span>}
                <ChevronRight size={16} className="aura-settings-chevron" />
              </div>
            );
          })}
        </motion.div>
      ))}

      {/* Sign out */}
      <motion.button
        className="aura-signout-btn"
        onClick={onSignOut}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.97 }}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <LogOut size={16} />
        Sign Out
      </motion.button>

      {/* Version */}
      <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-3)', marginTop: '8px', paddingBottom: '4px' }}>
        Aura v1.0.0 · Built with ✦
      </p>
    </div>
  );
};

export default MorePage;
