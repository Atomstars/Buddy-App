import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Clock, Plus, Zap } from 'lucide-react';

const S = {
  shell: { width: '100%', minHeight: '100dvh', background: 'linear-gradient(180deg, #0a0a0f 0%, #09090b 100%)', color: '#fafafa', fontFamily: "'Satoshi','Inter',sans-serif", paddingBottom: '120px', overflowX: 'hidden', position: 'relative' },
  ambientTop: { position: 'fixed', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(96,165,250,0.14) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 },
};

const SAMPLE_TASKS = [
  { time: '09:00', label: 'Morning deep work', cat: 'Focus', color: '#60a5fa', done: true },
  { time: '11:30', label: 'Budget review',     cat: 'Finance', color: '#34d399', done: true },
  { time: '14:00', label: 'Team sync call',    cat: 'Work', color: '#a78bfa', done: false },
  { time: '17:00', label: 'Workout session',   cat: 'Health', color: '#fb923c', done: false },
  { time: '20:00', label: 'Reading hour',      cat: 'Growth', color: '#fbbf24', done: false },
];

export const ScheduleModule = ({ onGoHome }) => {
  const navigate = useNavigate();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={S.shell}>
      <div style={S.ambientTop} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, padding: 'max(52px, env(safe-area-inset-top,52px)) 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}>
          <Home size={15} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </motion.button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 2px' }}>Schedule</p>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0 }}>{dateStr}</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}>
          <Plus size={16} style={{ color: '#60a5fa' }} />
        </motion.button>
      </div>

      {/* Coming Soon Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} style={{ position: 'relative', zIndex: 10, margin: '20px 16px 0', borderRadius: '22px', padding: '18px 20px', background: 'linear-gradient(135deg, rgba(96,165,250,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Zap size={20} style={{ color: '#60a5fa', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 3px' }}>Schedule AI — Coming Soon</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>Intelligent time-blocking & calendar OS</p>
        </div>
      </motion.div>

      {/* Sample day view */}
      <div style={{ position: 'relative', zIndex: 10, padding: '20px 16px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 2px 12px' }}>Today's Preview</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SAMPLE_TASKS.map((task, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '12px 14px', opacity: task.done ? 0.5 : 1 }}>
              <div style={{ width: '36px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, margin: 0 }}>{task.time}</p>
              </div>
              <div style={{ width: '3px', height: '36px', borderRadius: '4px', background: task.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: task.done ? 'rgba(255,255,255,0.4)' : '#fff', fontWeight: 600, fontSize: '13px', margin: '0 0 2px', textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</p>
                <p style={{ color: task.color, fontSize: '10px', fontWeight: 600, margin: 0, opacity: 0.8 }}>{task.cat}</p>
              </div>
              {task.done && <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#34d399', fontSize: '10px' }}>✓</span></div>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const VisionModule = ({ onGoHome }) => {
  const navigate = useNavigate();
  const GOALS = [
    { label: 'Emergency Fund',    target: 300000, current: 85000,  color: '#34d399', icon: '🛡️' },
    { label: 'New MacBook',       target: 180000, current: 42000,  color: '#60a5fa', icon: '💻' },
    { label: 'Europe Trip',       target: 250000, current: 18000,  color: '#a78bfa', icon: '✈️' },
    { label: 'Investment Corpus', target: 1000000,current: 125000, color: '#fbbf24', icon: '📈' },
  ];

  return (
    <div style={S.shell}>
      <div style={{ ...S.ambientTop, background: 'radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: 'max(52px, env(safe-area-inset-top,52px)) 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}>
          <Home size={15} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </motion.button>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Vision Board</p>
        <div style={{ width: 36 }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} style={{ position: 'relative', zIndex: 10, margin: '20px 16px 0', borderRadius: '22px', padding: '18px 20px', background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(249,115,22,0.08))', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Zap size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 3px' }}>Vision AI — Coming Soon</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>Life design, manifestation & goal tracking</p>
        </div>
      </motion.div>

      <div style={{ position: 'relative', zIndex: 10, padding: '20px 16px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: '0 2px 12px' }}>Your Goals</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {GOALS.map((goal, i) => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '22px' }}>{goal.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: '0 0 1px' }}>{goal.label}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0 }}>₹{(goal.current/1000).toFixed(0)}K of ₹{(goal.target/1000).toFixed(0)}K</p>
                  </div>
                  <div style={{ background: `${goal.color}18`, border: `1px solid ${goal.color}30`, borderRadius: '100px', padding: '3px 8px' }}>
                    <span style={{ color: goal.color, fontSize: '11px', fontWeight: 700 }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }} style={{ height: '100%', background: goal.color, borderRadius: '4px', boxShadow: `0 0 8px ${goal.color}50` }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const InvestModule = ({ onGoHome }) => {
  const navigate = useNavigate();
  return (
    <div style={S.shell}>
      <div style={{ ...S.ambientTop, background: 'radial-gradient(circle, rgba(251,146,60,0.14) 0%, transparent 70%)' }} />
      <div style={{ position: 'relative', zIndex: 10, padding: 'max(52px, env(safe-area-inset-top,52px)) 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}>
          <Home size={15} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </motion.button>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Invest</p>
        <div style={{ width: 36 }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} style={{ position: 'relative', zIndex: 10, margin: '20px 16px 0', borderRadius: '22px', padding: '28px 20px', background: 'linear-gradient(135deg, rgba(251,146,60,0.12), rgba(168,85,247,0.08))', border: '1px solid rgba(251,146,60,0.22)', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📈</div>
        <p style={{ color: '#fff', fontWeight: 800, fontSize: '18px', margin: '0 0 6px', fontFamily: "'Satoshi',sans-serif" }}>Investment AI</p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 20px', lineHeight: 1.5 }}>Smart portfolio tracking, SIP management & wealth analytics. Launching soon.</p>
        <div style={{ background: 'linear-gradient(135deg, #fb923c, #a855f7)', borderRadius: '100px', padding: '10px 28px', display: 'inline-block' }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>Notify Me</span>
        </div>
      </motion.div>
    </div>
  );
};
