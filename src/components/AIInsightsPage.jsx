import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, TrendingDown, TrendingUp, AlertCircle, BarChart3, Lightbulb } from 'lucide-react';

const MOCK_INSIGHTS = [
  {
    id: 'food',
    icon: TrendingUp,
    title: 'Food spending up 23%',
    body: 'You spent ₹3,400 on food this week — 23% above your weekly average of ₹2,760.',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.12)',
    border: 'rgba(244,63,94,0.2)',
  },
  {
    id: 'saving',
    icon: TrendingDown,
    title: 'On track to save ₹6,200',
    body: 'Based on your current pace, you\'ll save ₹6,200 this month — above your ₹5,000 goal.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.2)',
  },
  {
    id: 'recurring',
    icon: AlertCircle,
    title: '3 recurring charges detected',
    body: 'Netflix, Spotify, and Gym are costing you ₹2,148/month. Review subscriptions?',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    id: 'pattern',
    icon: BarChart3,
    title: 'Weekend spending pattern',
    body: 'Your weekend spending is 40% higher than weekdays. Most of it goes to food & shopping.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.2)',
  },
  {
    id: 'tip',
    icon: Lightbulb,
    title: 'Smart tip for you',
    body: 'Setting a ₹500 daily limit on food spending could save you ₹3,000+ this month.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.2)',
  },
];

const AIInsightsPage = () => {
  return (
    <div className="aura-insights">
      {/* Locked header */}
      <motion.div
        className="aura-insights-locked-header"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="aura-insights-lock-icon">
          <div className="aura-insights-lock-glow" />
          <Sparkles size={26} style={{ color: '#fbbf24', position: 'relative', zIndex: 1 }} />
        </div>

        <h2 className="aura-insights-title">AI Insights</h2>
        <p className="aura-insights-desc">
          Unlock intelligent financial analysis powered by Aura's AI engine. Get personalized spending patterns, savings opportunities, and monthly intelligence.
        </p>
      </motion.div>

      {/* Preview cards — blurred */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ position: 'relative' }}
      >
        <div className="aura-insights-blur">
          {MOCK_INSIGHTS.slice(0, 3).map((ins) => {
            const Icon = ins.icon;
            return (
              <div key={ins.id} className="aura-insight-card-real" style={{ marginBottom: '10px' }}>
                <div
                  className="aura-insight-icon"
                  style={{ background: ins.bg, borderColor: ins.border }}
                >
                  <Icon size={16} style={{ color: ins.color }} />
                </div>
                <div className="aura-insight-text">
                  <h4>{ins.title}</h4>
                  <p>{ins.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overlay */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(8,8,9,0.55) 50%, rgba(8,8,9,0.92) 100%)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: '12px',
            borderRadius: 'var(--r-xl)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '999px' }}>
            <Lock size={12} style={{ color: '#fbbf24' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24' }}>Locked — Aura Prime only</span>
          </div>
        </div>
      </motion.div>

      {/* What's included */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-2xl)',
          padding: '20px',
        }}
      >
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '14px' }}>
          What's included in Prime
        </p>
        {[
          'Spending pattern analysis',
          'Savings opportunity alerts',
          'Subscription audit report',
          'Weekly financial briefing',
          'Personalized budget advice',
          'Predictive month-end projections',
        ].map((feat, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 0',
              borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 800 }}>✓</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-2)' }}>{feat}</span>
          </div>
        ))}
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          className="aura-upgrade-btn"
          whileTap={{ scale: 0.97 }}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Sparkles size={18} />
          Unlock Aura Prime
        </motion.button>
        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--text-3)' }}>
          ₹99/month · Cancel anytime
        </p>
      </motion.div>
    </div>
  );
};

export default AIInsightsPage;
