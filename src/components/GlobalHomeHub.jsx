import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Flame, ArrowRight, Sparkles, Bell, CalendarCheck, CameraIcon,
  TrendingUp, ChevronRight, Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { FloatingBottomNavbar } from './layout/FloatingBottomNavbar';

const item = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export const GlobalHomeHub = ({
  userName,
  monthlyRemaining,
  tasksToday,
  streakCount = 0,
  onProfileClick,
  onFABPress,
  bills = [],
  monthlyStats,
  displayLabel,
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

  const firstName = (userName || 'there').split(' ')[0];

  const monthlyTarget = monthlyStats?.target || 30000;
  const monthlySpent = monthlyStats?.spent || 0;
  const spendPct = Math.min((monthlySpent / Math.max(monthlyTarget, 1)) * 100, 100);
  const budgetHealthColor = spendPct > 85 ? '#f43f5e' : spendPct > 65 ? '#f59e0b' : '#10b981';

  const pendingBills = [...bills]
    .filter(b => !b.isPaid)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const overdueCount = pendingBills.filter(b => new Date(b.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))).length;
  const nextBill = pendingBills[0];
  const pendingTotal = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);

  // Daily focus quote
  const focusMessages = [
    'Track every rupee. Own your future.',
    'Small habits build big wealth.',
    'Today\'s discipline is tomorrow\'s freedom.',
    'Plan for June. Win in July.',
    'Every saved rupee is a step forward.',
  ];
  const focusMsg = focusMessages[new Date().getDate() % focusMessages.length];

  return (
    <div className="aura-home" style={{ position: 'relative', paddingBottom: '160px', background: 'var(--bg)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>

      {/* Background Glows */}
      <div style={{ position: 'fixed', top: -100, left: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <motion.header style={{ position: 'relative', zIndex: 10, padding: 'max(48px, env(safe-area-inset-top, 48px)) 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} {...item(0)}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>{greeting}</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{firstName}.</h1>
        </div>
        <motion.button
          id="profile-btn"
          onClick={onProfileClick}
          whileTap={{ scale: 0.9 }}
          style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', outline: 'none', backdropFilter: 'blur(10px)' }}>
          <User size={22} style={{ color: '#fff' }} />
        </motion.button>
      </motion.header>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 10 }}>

        {/* ── Daily Focus ── */}
        <motion.div {...item(0.05)}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={14} color="rgba(255,255,255,0.4)" />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', flex: 1 }}>{focusMsg}</p>
          </div>
        </motion.div>

        {/* ── Budget Overview Card ── */}
        <motion.div {...item(0.1)}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 32, padding: 28, border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Safe to Spend · {displayLabel}</p>
              {streakCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(251,146,60,0.15)', padding: '4px 10px', borderRadius: 100, border: '1px solid rgba(251,146,60,0.3)' }}>
                  <Flame size={12} style={{ color: '#fb923c' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fb923c' }}>{streakCount} Day Streak</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', marginBottom: 20, textShadow: '0 4px 20px rgba(255,255,255,0.1)' }}>
              {formatCurrency(Math.max(0, monthlyRemaining || 0))}
            </p>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 8 }}>
                <span>{formatCurrency(monthlySpent)} spent</span>
                <span style={{ color: budgetHealthColor }}>{Math.round(spendPct)}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${spendPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: spendPct > 85 ? 'linear-gradient(90deg, #f43f5e, #fb7185)' : spendPct > 65 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #6366f1, #a78bfa)', borderRadius: 100 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Quick Grid: Schedule + Bills ── */}
        <motion.div {...item(0.2)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* Schedule card */}
          <div
            id="home-schedule-card"
            onClick={() => navigate('/schedule')}
            style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 20, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarCheck size={18} style={{ color: '#60a5fa' }} />
              </div>
              <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{tasksToday} <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Tasks</span></p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Scheduled today</p>
          </div>

          {/* Bills card */}
          <div
            id="home-bills-card"
            onClick={() => navigate('/budget')}
            style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 20, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} style={{ color: '#fb7185' }} />
              </div>
              {overdueCount > 0 && (
                <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', padding: '3px 7px', borderRadius: 7, color: '#fb7185', fontSize: 10, fontWeight: 700 }}>
                  {overdueCount} Due
                </div>
              )}
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nextBill ? nextBill.title : 'All Clear'}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              {nextBill ? `${formatCurrency(pendingTotal)} pending` : 'No upcoming bills'}
            </p>
          </div>
        </motion.div>

        {/* ── AI Vision / Expense Capture ── */}
        <motion.div {...item(0.28)}>
          <div
            id="home-ai-capture-btn"
            onClick={onFABPress}
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.05))',
              borderRadius: 24, padding: 20, border: '1px solid rgba(99,102,241,0.3)',
              position: 'relative', overflow: 'hidden', cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(99,102,241,0.15)',
            }}>
            <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.08, filter: 'blur(2px)' }}>
              <Sparkles size={100} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <CameraIcon size={18} style={{ color: '#818cf8' }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>AI Expense Capture</h3>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, maxWidth: '80%' }}>
                  Upload a PhonePe, GPay, or receipt screenshot to auto-log.
                </p>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.4)', flexShrink: 0 }}>
                <CameraIcon size={20} color="white" />
              </div>
            </div>
          </div>
        </motion.div>



      </div>

      <FloatingBottomNavbar onFABPress={onFABPress} />
    </div>
  );
};

export default GlobalHomeHub;
