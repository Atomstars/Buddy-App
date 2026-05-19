import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Lock, Crown, Sparkles, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const InvestingWidget = ({ monthlyRemaining }) => {
  const [showPopup, setShowPopup] = useState(false);
  const investable = Math.max(0, Math.round(monthlyRemaining * 0.3));
  const potentialSIP = Math.round(investable / 2);
  const estimatedAnnual = Math.round(potentialSIP * 12 * 1.12);

  return (
    <>
      <motion.div
        className="gradient-hero investing investing-card"
        onClick={() => setShowPopup(true)}
        whileTap={{ scale: 0.98 }}
        style={{ cursor: 'pointer', marginTop: '16px' }}
      >
        <div className="investing-premium-badge">
          <Crown size={10} />
          PREMIUM
        </div>
        <p className="hero-eyebrow">Smart Investing</p>
        <h3 className="hero-title" style={{ fontSize: '1.4rem' }}>Investment Advisor</h3>
        <p className="hero-subtitle">AI-powered investment suggestions based on your spending patterns</p>

        <div className="investing-metrics">
          <div className="investing-metric">
            <span>Investable Surplus</span>
            <strong>{formatCurrency(investable)}</strong>
          </div>
          <div className="investing-metric">
            <span>Potential SIP</span>
            <strong>{formatCurrency(potentialSIP)}/mo</strong>
          </div>
          <div className="investing-metric">
            <span>Est. Annual</span>
            <strong>{formatCurrency(estimatedAnnual)}</strong>
          </div>
          <div className="investing-metric">
            <span>Risk Profile</span>
            <strong>Moderate</strong>
          </div>
        </div>

        <div className="investing-locked">
          <Lock size={16} />
          <span>Tap to learn more — Coming Soon</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowPopup(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-sheet"
              onClick={e => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="modal-sheet-handle" />
              <div className="modal-sheet-header">
                <h2 className="modal-sheet-title">🚀 Coming Soon</h2>
                <button className="btn-icon" onClick={() => setShowPopup(false)}><X size={18} /></button>
              </div>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 64, height: 64, margin: '0 auto 16px', display: 'grid', placeItems: 'center', borderRadius: 20, background: 'var(--amber-soft)' }}>
                  <TrendingUp size={28} style={{ color: 'var(--amber)' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px' }}>AI Investment Advisor</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 300, margin: '0 auto 24px' }}>
                  Our AI will analyze your spending patterns and suggest personalized investment opportunities.
                  Get smart SIP recommendations, risk assessments, and projected returns — all tailored to your financial behavior.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                  {['Smart SIP Suggestions', 'Risk Analysis', 'Return Projections', 'Spending Insights'].map(f => (
                    <span key={f} className="stat-pill" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
                      <Sparkles size={12} />
                      <span className="stat-value">{f}</span>
                    </span>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setShowPopup(false)} style={{ width: '100%' }}>
                  Got it, notify me!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InvestingWidget;
