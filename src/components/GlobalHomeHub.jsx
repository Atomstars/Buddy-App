import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Flame, Target, Zap, ArrowRight, Sparkles, Bell, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { FloatingBottomNavbar } from './layout/FloatingBottomNavbar';

const item = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

export const GlobalHomeHub = ({
  userName,
  monthlyRemaining,
  tasksToday,
  streakCount = 0,
  visionProgress = 0,
  onProfileClick,
  onFABPress,
  bills = [],
  monthlyStats,
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

  const monthlyTarget = monthlyStats?.target || 30000;
  const monthlySpent = monthlyStats?.spent || 0;
  const spendPct = Math.min((monthlySpent / monthlyTarget) * 100, 100);

  const pendingBills = [...bills]
    .filter(b => !b.isPaid)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const overdueCount = pendingBills.filter(b => new Date(b.dueDate) < new Date(new Date().setHours(0,0,0,0))).length;
  const nextBill = pendingBills[0];
  const pendingTotal = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="aura-home" style={{ position: 'relative', paddingBottom: '160px' }}>
      {/* ── Header ── */}
      <motion.header style={{ padding: '24px 20px 16px', background: 'var(--bg)' }} {...item(0)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{greeting}</p>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              {firstName}
            </h1>
          </div>
          <motion.button onClick={onProfileClick} whileTap={{ scale: 0.9 }} style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', outline: 'none' }}>
            <User size={20} style={{ color: '#fff' }} />
          </motion.button>
        </div>
      </motion.header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── Overview Card ── */}
        <motion.div {...item(0.07)}>
          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderRadius: 28, padding: 24, border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 250, height: 250, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            
            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Available Balance</p>
            <p style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 20 }}>{formatCurrency(Math.max(0, monthlyRemaining || 0))}</p>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 8 }}>
                <span>{formatCurrency(monthlySpent)} spent</span>
                <span>of {formatCurrency(monthlyTarget)}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: spendPct > 80 ? '#f43f5e' : spendPct > 60 ? '#f59e0b' : '#6366f1', width: `${spendPct}%`, borderRadius: 4 }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}><Flame size={12} style={{ color: '#fb923c' }} /> STREAK</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{streakCount}d</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}><Target size={12} style={{ color: '#60a5fa' }} /> TASKS</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{tasksToday || 0}</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}><Zap size={12} style={{ color: '#fbbf24' }} /> VISION</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>{visionProgress}%</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Daily Focus (Smart Actionable Insight) ── */}
        <motion.div {...item(0.12)}>
          <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: 20, padding: 16, border: '1px solid rgba(99,102,241,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Daily Focus</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
                  {spendPct > 80 ? "Avoid unnecessary spending today, you are near budget." : "Log every expense today 💡"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Productivity + Money Combined ── */}
        <motion.div {...item(0.16)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div onClick={() => navigate('/schedule')} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 16, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <CalendarCheck size={16} style={{ color: '#60a5fa' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{tasksToday} Tasks</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>scheduled today</p>
          </div>
          
          <div onClick={() => navigate('/budget')} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 16, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={16} style={{ color: '#fb7185' }} />
              </div>
              {overdueCount > 0 && (
                <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', padding: '2px 6px', borderRadius: 6, color: '#fb7185', fontSize: 10, fontWeight: 700 }}>
                  {overdueCount} Overdue
                </div>
              )}
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 'auto' }}>{nextBill ? nextBill.title : 'All Paid'}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {nextBill ? `${formatCurrency(pendingTotal)} pending` : 'No urgent bills'}
            </p>
          </div>
        </motion.div>

        {/* ── Vision Section (Premium Locked) ── */}
        <motion.div {...item(0.22)}>
          <div onClick={() => navigate('/vision')} style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: 28, padding: 24, border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden',
            cursor: 'pointer'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
            <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
              <Sparkles size={120} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Sparkles size={18} style={{ color: '#fbbf24' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Aura Vision</h3>
              <div style={{ background: 'rgba(251,191,36,0.15)', padding: '2px 8px', borderRadius: 100 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>Coming Soon</span>
              </div>
            </div>
            
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 16 }}>
              AI-powered life planning. Analyzes your spending, habits, and schedules for long-term guidance.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              Unlock Future Forecasting <ArrowRight size={14} style={{ marginLeft: 6 }} />
            </div>
          </div>
        </motion.div>

      </div>

      <FloatingBottomNavbar onFABPress={onFABPress} />
    </div>
  );
};

export default GlobalHomeHub;
