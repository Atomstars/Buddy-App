import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, TrendingUp, AlertCircle, RefreshCw, Loader2, BrainCircuit } from 'lucide-react';
import { api } from '../services/api';

const TONE = {
  positive: { icon: TrendingDown, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)' },
  warning:  { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' },
  neutral:  { icon: TrendingUp,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)' },
};

const AIInsightsPage = ({ expenses = [], tasks = [], moods = [] }) => {
  const [insights, setInsights] = useState([]);
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await api.ai.insights({
      expenses: expenses.map((e) => ({ amount: e.amount, sector: e.sector, date: e.date })),
      tasks: tasks.map((t) => ({ title: t.title, done: t.done, date: t.date })),
      moods,
    });
    setInsights(result.insights || []);
    setEngine(result._engine || null);
    setLoading(false);
  }, [expenses, tasks, moods]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ paddingBottom: 160 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrainCircuit size={20} color="#c4b5fd" />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>AI Insights</h2>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Patterns across your money, time and mood.
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          {loading ? <Loader2 size={16} className="aura-spin" /> : <RefreshCw size={16} />}
        </button>
      </div>

      {/* Engine badge */}
      {engine && !loading && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, marginBottom: 16,
          background: engine === 'groq' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${engine === 'groq' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
          <Sparkles size={12} color={engine === 'groq' ? '#10b981' : '#94a3b8'} />
          <span style={{ fontSize: 11, fontWeight: 700, color: engine === 'groq' ? '#10b981' : '#94a3b8' }}>
            {engine === 'groq' ? 'Live AI (Groq)' : engine === 'unavailable' ? 'Backend offline' : 'Basic mode — add a Groq key for deeper AI'}
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)' }}>
          <Loader2 size={28} className="aura-spin" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 13 }}>Analyzing your patterns...</p>
        </div>
      ) : insights.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
          <BrainCircuit size={28} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Not enough data yet</p>
          <p style={{ fontSize: 12, marginTop: 6, maxWidth: 260 }}>
            Log a few expenses, tasks and diary entries — Aura will start spotting patterns for you.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {insights.map((ins, i) => {
            const tone = TONE[ins.tone] || TONE.neutral;
            const Icon = tone.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 18, padding: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: tone.bg, border: `1px solid ${tone.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: tone.color }} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{ins.title}</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.6)' }}>{ins.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <style>{`.aura-spin{animation:aura-spin 0.9s linear infinite}@keyframes aura-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default AIInsightsPage;
