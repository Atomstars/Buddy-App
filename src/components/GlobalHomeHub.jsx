import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Calendar, TrendingUp, Compass, User, Zap, Target, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

/* ─── Stagger helper ─── */
const item = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

/* ─── Module definitions ─── */
const MODULES = [
  {
    id: 'budget',
    title: 'Budget',
    desc: 'Financial command center',
    icon: Wallet,
    path: '/budget',
    glow: '#34d399',
    gradient: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(6,78,59,0.08) 100%)',
    border: 'rgba(52,211,153,0.2)',
    iconBg: 'rgba(52,211,153,0.12)',
    iconColor: '#34d399',
  },
  {
    id: 'schedule',
    title: 'Schedule',
    desc: 'Master your time',
    icon: Calendar,
    path: '/schedule',
    glow: '#60a5fa',
    gradient: 'linear-gradient(135deg, rgba(96,165,250,0.15) 0%, rgba(30,58,138,0.08) 100%)',
    border: 'rgba(96,165,250,0.2)',
    iconBg: 'rgba(96,165,250,0.12)',
    iconColor: '#60a5fa',
  },
  {
    id: 'investing',
    title: 'Invest',
    desc: 'Grow your wealth',
    icon: TrendingUp,
    path: '/investing',
    glow: '#a78bfa',
    gradient: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(76,29,149,0.08) 100%)',
    border: 'rgba(167,139,250,0.2)',
    iconBg: 'rgba(167,139,250,0.12)',
    iconColor: '#a78bfa',
  },
  {
    id: 'manifest',
    title: 'Vision',
    desc: 'Design your life',
    icon: Compass,
    path: '/manifest',
    glow: '#fbbf24',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(120,53,15,0.08) 100%)',
    border: 'rgba(251,191,36,0.2)',
    iconBg: 'rgba(251,191,36,0.12)',
    iconColor: '#fbbf24',
  },
];

/* ─── Insight data ─── */
const INSIGHTS = [
  { emoji: '📉', label: 'Spending down 12%', sub: 'vs last week', accent: '#34d399' },
  { emoji: '⚡', label: 'Budget pacing stable', sub: 'On track this month', accent: '#60a5fa' },
  { emoji: '✦', label: 'Investment streak active', sub: '12 days strong', accent: '#a78bfa' },
];

export const GlobalHomeHub = ({
  userName,
  monthlyRemaining,
  tasksToday,
  streakCount = 12,
  visionProgress = 40,
  onProfileClick,
}) => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  const greeting =
    hour < 5  ? 'Good Night' :
    hour < 12 ? 'Good Morning' :
    hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const firstName = (userName || 'Akash').split(' ')[0];
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="w-full pb-8 overflow-x-hidden relative selection:bg-zinc-800"
      style={{ minHeight: '100dvh', background: '#09090b' }}
    >
      {/* ── Atmospheric background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top violet aurora */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '340px', height: '340px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        {/* Right emerald glow */}
        <div style={{
          position: 'absolute', top: '180px', right: '-60px',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
        {/* Bottom blue */}
        <div style={{
          position: 'absolute', bottom: '200px', left: '-40px',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)',
        }} />
      </div>

      {/* ── Header ── */}
      <motion.header
        className="relative z-10 w-full px-5 flex items-center justify-between"
        style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))', paddingBottom: '12px' }}
        {...item(0)}
      >
        <div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {greeting} · {timeStr}
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            {firstName}
            <span style={{ color: 'rgba(139,92,246,0.9)', fontWeight: 300, marginLeft: '6px' }}>✦</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Aura Prime badge */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(249,115,22,0.1))',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '100px',
              padding: '5px 10px',
              display: 'flex', alignItems: 'center', gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={11} style={{ color: '#fbbf24' }} />
            <span style={{ color: '#fbbf24', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>PRIME</span>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onProfileClick}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer', outline: 'none',
            }}
          >
            <User size={16} />
          </motion.button>
        </div>
      </motion.header>

      {/* ── Hero Balance Card ── */}
      <motion.section className="relative z-10 px-4 mt-3" {...item(0.08)}>
        <div style={{
          borderRadius: '28px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(145deg, rgba(30,27,40,0.95) 0%, rgba(15,12,20,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 24px 64px -16px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          {/* Inner glow */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '180px', height: '180px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            filter: 'blur(30px)', pointerEvents: 'none',
          }} />
          {/* Top shimmer */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          }} />

          <div style={{ padding: '24px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Available Balance
                </p>
                <p style={{ fontSize: '42px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1, fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                  {formatCurrency(Math.max(0, monthlyRemaining || 0))}
                </p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
                borderRadius: '100px', padding: '5px 10px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ color: '#34d399', fontSize: '10px', fontWeight: 700 }}>LIVE</span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px', paddingTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {[
                { icon: Flame, label: 'Streak', value: `${streakCount}d`, color: '#fb923c' },
                { icon: Target, label: 'Tasks', value: tasksToday || '0', color: '#60a5fa' },
                { icon: Zap, label: 'Vision', value: `${visionProgress}%`, color: '#fbbf24' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon size={10} style={{ color }} />
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
                  </div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Daily Focus ── */}
      <motion.section className="relative z-10 px-4 mt-5" {...item(0.14)}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(96,165,250,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '20px',
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '3px' }}>Today's Focus</p>
            <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0 }}>Log every expense today 💡</p>
          </div>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ArrowRight size={14} style={{ color: '#a78bfa' }} />
          </div>
        </div>
      </motion.section>

      {/* ── Module Grid ── */}
      <motion.section className="relative z-10 px-4 mt-5" {...item(0.18)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 2px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Modules</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.button
                key={mod.id}
                onClick={() => navigate(mod.path)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.22 + i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: mod.gradient,
                  border: `1px solid ${mod.border}`,
                  borderRadius: '22px',
                  padding: '18px 16px',
                  display: 'flex', flexDirection: 'column', gap: '14px',
                  textAlign: 'left', cursor: 'pointer', outline: 'none',
                  position: 'relative', overflow: 'hidden',
                  WebkitTapHighlightColor: 'transparent',
                  minHeight: '120px',
                }}
              >
                {/* Glow blob */}
                <div style={{
                  position: 'absolute', top: '-20px', right: '-20px',
                  width: '80px', height: '80px',
                  background: `radial-gradient(circle, ${mod.glow}30 0%, transparent 70%)`,
                  filter: 'blur(16px)', pointerEvents: 'none',
                }} />
                {/* Shimmer top */}
                <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: `linear-gradient(90deg, transparent, ${mod.glow}50, transparent)` }} />

                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: mod.iconBg, border: `1px solid ${mod.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', zIndex: 1,
                }}>
                  <Icon size={18} style={{ color: mod.iconColor }} />
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 2px', letterSpacing: '-0.2px' }}>{mod.title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', margin: 0 }}>{mod.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ── AI Insights ── */}
      <motion.section className="relative z-10 px-4 mt-5" {...item(0.32)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '0 2px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>AI Intelligence</p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: '100px', padding: '3px 8px',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
            <span style={{ color: '#a78bfa', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em' }}>LIVE</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {INSIGHTS.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.36 + i * 0.06 }}
              style={{
                background: `linear-gradient(135deg, ${insight.accent}12 0%, rgba(255,255,255,0.02) 100%)`,
                border: `1px solid ${insight.accent}20`,
                borderRadius: '16px', padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{insight.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '13px', margin: '0 0 1px' }}>{insight.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>{insight.sub}</p>
              </div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: insight.accent, flexShrink: 0, boxShadow: `0 0 8px ${insight.accent}` }} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Aura Prime Upgrade Strip ── */}
      <motion.section className="relative z-10 px-4 mt-5" {...item(0.44)}>
        <motion.div
          whileTap={{ scale: 0.97 }}
          style={{
            borderRadius: '20px', padding: '16px 18px',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(249,115,22,0.08) 60%, rgba(168,85,247,0.1) 100%)',
            border: '1px solid rgba(251,191,36,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.5), transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(249,115,22,0.15))',
              border: '1px solid rgba(251,191,36,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: '13px', margin: '0 0 1px', letterSpacing: '-0.1px' }}>Aura Prime</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>AI-powered insights, unlocked</p>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'linear-gradient(135deg, #fbbf24, #f97316)',
            borderRadius: '100px', padding: '5px 12px',
          }}>
            <span style={{ color: '#000', fontSize: '11px', fontWeight: 800, letterSpacing: '0.02em' }}>Upgrade</span>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};
