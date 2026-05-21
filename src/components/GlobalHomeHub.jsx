import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Calendar, TrendingUp, Compass, User, Zap, Target,
  Flame, Sparkles, ArrowRight, Plus, Bell, ChevronRight,
  CreditCard, Shield, Activity, BarChart3, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

/* ─── fade-up animation preset ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ─── Module tiles ─── */
const MODULES = [
  { id: 'budget',    title: 'Budget',    icon: Wallet,     path: '/budget',    glow: '#34d399', border: 'rgba(52,211,153,0.22)',  bg: 'rgba(52,211,153,0.07)',  iconColor: '#34d399' },
  { id: 'schedule',  title: 'Schedule',  icon: Calendar,   path: '/schedule',  glow: '#60a5fa', border: 'rgba(96,165,250,0.22)',  bg: 'rgba(96,165,250,0.07)',  iconColor: '#60a5fa' },
  { id: 'analytics', title: 'Analytics', icon: BarChart3,   path: '/budget',    glow: '#a78bfa', border: 'rgba(167,139,250,0.22)', bg: 'rgba(167,139,250,0.07)', iconColor: '#a78bfa' },
  { id: 'vision',    title: 'Vision',    icon: Compass,    path: '/vision',    glow: '#fbbf24', border: 'rgba(251,191,36,0.22)',  bg: 'rgba(251,191,36,0.07)',  iconColor: '#fbbf24' },
  { id: 'invest',    title: 'Invest',    icon: TrendingUp, path: '/invest',    glow: '#fb923c', border: 'rgba(251,146,60,0.22)',  bg: 'rgba(251,146,60,0.07)',  iconColor: '#fb923c' },
];

/* ─── Upcoming payment data ─── */
const UPCOMING = [
  { label: 'Netflix',    amount: 649,   dueIn: 3,  icon: '🎬', color: '#e50914' },
  { label: 'Home Rent',  amount: 12000, dueIn: 7,  icon: '🏠', color: '#60a5fa' },
  { label: 'Phone EMI',  amount: 2299,  dueIn: 12, icon: '📱', color: '#34d399' },
  { label: 'Gym',        amount: 999,   dueIn: 18, icon: '💪', color: '#a78bfa' },
];

/* ─── Quick actions ─── */
const QUICK_ACTIONS = [
  { label: 'Add Expense', icon: Plus,       action: 'add_expense',  color: '#34d399' },
  { label: 'Add Bill',    icon: CreditCard, action: 'add_bill',     color: '#60a5fa' },
  { label: 'EMI Track',   icon: Activity,   action: 'emi_track',    color: '#a78bfa' },
  { label: 'Set Budget',  icon: Shield,     action: 'set_budget',   color: '#fbbf24' },
];

export const GlobalHomeHub = ({
  userName,
  monthlyRemaining,
  tasksToday,
  streakCount = 12,
  visionProgress = 40,
  onProfileClick,
  onQuickAdd,
}) => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [focusIdx, setFocusIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Cycle daily focus message
  const FOCUS = [
    'Log every expense today 💡',
    'You\'re 3 days from a new streak record 🔥',
    'Rent due in 7 days — stay prepared 🏠',
    'Spending 12% below average this week ↗',
  ];
  useEffect(() => {
    const t = setInterval(() => setFocusIdx(i => (i + 1) % FOCUS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const h = time.getHours();
  const greeting = h < 5 ? 'Good Night' : h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = (userName || 'Akash').split(' ')[0];
  const healthScore = Math.min(88, Math.round(55 + (monthlyRemaining || 0) / 200));

  return (
    <div
      style={{
        width: '100%', minHeight: '100dvh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #09090b 60%)',
        color: '#fafafa', overflowX: 'hidden', paddingBottom: '120px',
        fontFamily: "'Satoshi', 'Inter', sans-serif",
        position: 'relative',
      }}
    >
      {/* ══ Ambient background ══ */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 68%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: '280px', right: '-60px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '280px', left: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(96,165,250,0.09) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        {/* Noise texture grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '44px 44px', maskImage: 'radial-gradient(ellipse 90% 50% at 50% 0%, black, transparent)' }} />
      </div>

      {/* ══ HEADER ══ */}
      <motion.header
        {...fadeUp(0)}
        style={{
          position: 'relative', zIndex: 10,
          padding: 'max(52px, env(safe-area-inset-top, 52px)) 20px 0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ color: 'rgba(255,255,255,0.36)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {greeting}
          </p>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.8px', lineHeight: 1.05, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>
            {firstName}<span style={{ color: 'rgba(139,92,246,0.85)', marginLeft: '8px', fontWeight: 300 }}>✦</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Prime badge */}
          <motion.div whileTap={{ scale: 0.95 }} style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.16), rgba(249,115,22,0.12))', border: '1px solid rgba(251,191,36,0.32)', borderRadius: '100px', padding: '5px 11px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <Sparkles size={10} style={{ color: '#fbbf24' }} />
            <span style={{ color: '#fbbf24', fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em' }}>PRIME</span>
          </motion.div>
          {/* Profile */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={onProfileClick} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', outline: 'none' }}>
            <User size={16} />
          </motion.button>
        </div>
      </motion.header>

      {/* ══ HERO FINANCIAL CARD ══ */}
      <motion.section {...fadeUp(0.06)} style={{ position: 'relative', zIndex: 10, padding: '20px 16px 0' }}>
        <div style={{
          borderRadius: '28px', overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(145deg, rgba(28,24,40,0.96) 0%, rgba(14,12,20,0.98) 100%)',
          border: '1px solid rgba(139,92,246,0.16)',
          boxShadow: '0 24px 72px -16px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)',
          padding: '24px 22px',
        }}>
          {/* Card glows */}
          <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '160px', height: '160px', background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20px', left: '-10px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          {/* Top shimmer */}
          <div style={{ position: 'absolute', top: 0, left: '12%', right: '12%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Balance */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '10px' }}>Available Balance</p>
                <p style={{ fontSize: '44px', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1, margin: 0, fontFamily: "'Satoshi', sans-serif" }}>
                  {formatCurrency(Math.max(0, monthlyRemaining || 0))}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '100px', padding: '4px 10px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 6px #34d399' }} />
                  <span style={{ color: '#34d399', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
                </div>
                {/* Health score pill */}
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 10px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>Health</p>
                  <p style={{ color: '#a78bfa', fontSize: '16px', fontWeight: 800, margin: 0 }}>{healthScore}</p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { Icon: Flame,  label: 'Streak',  value: `${streakCount}d`,    color: '#fb923c' },
                { Icon: Target, label: 'Tasks',   value: String(tasksToday || 0), color: '#60a5fa' },
                { Icon: Zap,    label: 'Vision',  value: `${visionProgress}%`, color: '#fbbf24' },
              ].map(({ Icon, label, value, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <Icon size={10} style={{ color }} />
                    <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
                  </div>
                  <p style={{ color: '#fff', fontWeight: 800, fontSize: '16px', margin: 0, fontFamily: "'Satoshi', sans-serif", letterSpacing: '-0.3px' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ══ TODAY'S FOCUS ══ */}
      <motion.section {...fadeUp(0.12)} style={{ position: 'relative', zIndex: 10, padding: '14px 16px 0' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={focusIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(96,165,250,0.07) 100%)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '18px', padding: '13px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.45), transparent)' }} />
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '3px' }}>Today's Focus</p>
              <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0 }}>{FOCUS[focusIdx]}</p>
            </div>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ArrowRight size={13} style={{ color: '#a78bfa' }} />
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* ══ UPCOMING PAYMENTS ══ */}
      <motion.section {...fadeUp(0.18)} style={{ position: 'relative', zIndex: 10, padding: '22px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 2px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 }}>Upcoming Payments</p>
          <button style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}>
            See all <ChevronRight size={12} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {UPCOMING.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.38, delay: 0.2 + i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '12px 14px',
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `${item.color}18`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={9} style={{ color: item.dueIn <= 5 ? '#fb923c' : 'rgba(255,255,255,0.3)' }} />
                  Due in {item.dueIn} days
                </p>
              </div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0, flexShrink: 0, letterSpacing: '-0.3px' }}>
                {formatCurrency(item.amount)}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ══ QUICK ACTIONS ══ */}
      <motion.section {...fadeUp(0.24)} style={{ position: 'relative', zIndex: 10, padding: '22px 16px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 2px 12px' }}>Quick Actions</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {QUICK_ACTIONS.map((qa, i) => {
            const Icon = qa.icon;
            return (
              <motion.button
                key={qa.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.26 + i * 0.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onQuickAdd && onQuickAdd(qa.action)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px', padding: '14px 6px', cursor: 'pointer', outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: `${qa.color}16`, border: `1px solid ${qa.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color: qa.color }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{qa.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ══ MODULE ECOSYSTEM ══ */}
      <motion.section {...fadeUp(0.3)} style={{ position: 'relative', zIndex: 10, padding: '22px 16px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 2px 12px' }}>Modules</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {MODULES.slice(0, 4).map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.button
                key={mod.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.32 + i * 0.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(mod.path)}
                style={{
                  background: mod.bg, border: `1px solid ${mod.border}`,
                  borderRadius: '22px', padding: '18px 16px',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                  textAlign: 'left', cursor: 'pointer', outline: 'none',
                  position: 'relative', overflow: 'hidden', minHeight: '116px',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ position: 'absolute', top: '-18px', right: '-18px', width: '70px', height: '70px', background: `radial-gradient(circle, ${mod.glow}38 0%, transparent 70%)`, filter: 'blur(14px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: '14%', right: '14%', height: '1px', background: `linear-gradient(90deg, transparent, ${mod.glow}45, transparent)` }} />
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: `${mod.glow}18`, border: `1px solid ${mod.glow}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                  <Icon size={18} style={{ color: mod.iconColor }} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 3px', letterSpacing: '-0.2px', fontFamily: "'Satoshi', sans-serif" }}>{mod.title}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
        {/* Invest — full width */}
        {(() => {
          const mod = MODULES[4];
          const Icon = mod.icon;
          return (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.56 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(mod.path)}
              style={{
                marginTop: '10px', width: '100%',
                background: mod.bg, border: `1px solid ${mod.border}`,
                borderRadius: '22px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '14px',
                cursor: 'pointer', outline: 'none', position: 'relative', overflow: 'hidden',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px', background: `linear-gradient(90deg, transparent, ${mod.glow}45, transparent)` }} />
              <div style={{ width: '40px', height: '40px', borderRadius: '13px', background: `${mod.glow}18`, border: `1px solid ${mod.glow}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} style={{ color: mod.iconColor }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 2px', fontFamily: "'Satoshi', sans-serif" }}>Invest</p>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', margin: 0 }}>Grow your wealth intelligently</p>
              </div>
              <ArrowRight size={16} style={{ color: mod.iconColor, opacity: 0.7 }} />
            </motion.button>
          );
        })()}
      </motion.section>

      {/* ══ FINANCIAL HEALTH INSIGHTS ══ */}
      <motion.section {...fadeUp(0.38)} style={{ position: 'relative', zIndex: 10, padding: '22px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 2px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 }}>Financial Health</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.22)', borderRadius: '100px', padding: '3px 8px' }}>
            <Activity size={9} style={{ color: '#a78bfa' }} />
            <span style={{ color: '#a78bfa', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em' }}>AI</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Weekly Burn',    value: '₹4,280', trend: '-8%',  up: false, color: '#34d399', icon: '↓' },
            { label: 'Savings Rate',   value: '23%',    trend: '+4%',  up: true,  color: '#60a5fa', icon: '↑' },
            { label: 'EMI Pressure',   value: 'Low',    trend: 'Good', up: true,  color: '#a78bfa', icon: '✓' },
            { label: 'Spend Pace',     value: 'Normal', trend: 'On track', up: true, color: '#fbbf24', icon: '→' },
          ].map((item, i) => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px' }}>
              <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{item.label}</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '18px', margin: '0 0 4px', letterSpacing: '-0.4px', fontFamily: "'Satoshi', sans-serif" }}>{item.value}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: item.color, fontSize: '12px' }}>{item.icon}</span>
                <span style={{ color: item.color, fontSize: '11px', fontWeight: 600 }}>{item.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ══ AURA PRIME ══ */}
      <motion.section {...fadeUp(0.44)} style={{ position: 'relative', zIndex: 10, padding: '22px 16px 0' }}>
        <motion.div
          whileTap={{ scale: 0.97 }}
          style={{
            borderRadius: '22px', padding: '18px 20px',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.13) 0%, rgba(249,115,22,0.09) 55%, rgba(168,85,247,0.1) 100%)',
            border: '1px solid rgba(251,191,36,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px -8px rgba(251,191,36,0.12)',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.55), transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '13px', background: 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(249,115,22,0.15))', border: '1px solid rgba(251,191,36,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <p style={{ color: '#fbbf24', fontWeight: 800, fontSize: '14px', margin: '0 0 2px', letterSpacing: '-0.1px', fontFamily: "'Satoshi', sans-serif" }}>Aura Prime</p>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', margin: 0 }}>Unlock AI-powered financial OS</p>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', borderRadius: '100px', padding: '7px 14px', flexShrink: 0 }}>
            <span style={{ color: '#000', fontSize: '11px', fontWeight: 900, letterSpacing: '0.02em' }}>Upgrade</span>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};
