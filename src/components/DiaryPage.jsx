import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Plus, X, ChevronLeft, ChevronRight, BookOpen, ThumbsUp,
  Target, Loader2, Check, Wand2, Link2,
} from 'lucide-react';
import { formatDateISO, isToday, getDateFromISO } from '../utils/dateUtils';
import { api } from '../services/api';

const MOODS = [
  { v: 1, emoji: '😞', label: 'Rough' },
  { v: 2, emoji: '😕', label: 'Low' },
  { v: 3, emoji: '😐', label: 'Okay' },
  { v: 4, emoji: '🙂', label: 'Good' },
  { v: 5, emoji: '😄', label: 'Great' },
];

const EditableList = ({ items, setItems, placeholder, accent }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setItems([...items, v]);
    setDraft('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '8px 12px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{it}</span>
          <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}><X size={14} /></button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{ flex: 1, height: 40, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '0 12px', color: '#fff', fontSize: 13, outline: 'none' }}
        />
        <button onClick={add} style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export const DiaryPage = ({ diary, tasks = [], expenses = [] }) => {
  const [date, setDate] = useState(new Date());
  const dateStr = formatDateISO(date);

  const existing = diary?.getEntry ? diary.getEntry(dateStr) : null;

  const [mood, setMood] = useState(null);
  const [content, setContent] = useState('');
  const [wins, setWins] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [aiReview, setAiReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load the entry for the active date into the form
  useEffect(() => {
    setMood(existing?.mood ?? null);
    setContent(existing?.content ?? '');
    setWins(existing?.wins ?? []);
    setImprovements(existing?.improvements ?? []);
    try { setAiReview(existing?.ai_review ? JSON.parse(existing.ai_review) : null); }
    catch { setAiReview(existing?.ai_review ? { summary: existing.ai_review, wins: [], improvements: [] } : null); }
    setSaved(false);
  }, [dateStr, existing]);

  const dayTasks = useMemo(() => tasks.filter((t) => t.date === dateStr), [tasks, dateStr]);
  const dayExpenses = useMemo(
    () => expenses.filter((e) => formatDateISO(new Date(e.date)) === dateStr),
    [expenses, dateStr]
  );

  const shiftDay = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    if (d > new Date()) return; // no future diary
    setDate(d);
  };

  const handleSave = useCallback(async (reviewObj) => {
    if (!diary?.saveEntry) return;
    await diary.saveEntry(dateStr, {
      mood, content, wins, improvements,
      ai_review: reviewObj ? JSON.stringify(reviewObj) : (aiReview ? JSON.stringify(aiReview) : ''),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [diary, dateStr, mood, content, wins, improvements, aiReview]);

  const handleReview = async () => {
    setReviewing(true);
    try {
      const result = await api.ai.review({
        date: dateStr,
        mood,
        content,
        wins,
        improvements,
        tasks: dayTasks.map((t) => ({ title: t.title, done: t.done, plannedHours: t.plannedHours, actualHours: t.actualHours })),
        expenses: dayExpenses.map((e) => ({ amount: e.amount, sector: e.sector })),
      });
      setAiReview(result);
      await handleSave(result);
    } finally {
      setReviewing(false);
    }
  };

  const moodObj = MOODS.find((m) => m.v === mood);

  return (
    <div style={{ paddingBottom: 160 }}>
      {/* Date navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => shiftDay(-1)} style={navBtn}><ChevronLeft size={18} /></button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <BookOpen size={16} color="#8b5cf6" />
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
              {isToday(date) ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'long' })}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <button onClick={() => shiftDay(1)} disabled={isToday(date)} style={{ ...navBtn, opacity: isToday(date) ? 0.3 : 1 }}><ChevronRight size={18} /></button>
      </div>

      {/* Mood */}
      <Card title="How was your day?">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          {MOODS.map((m) => (
            <button
              key={m.v}
              onClick={() => setMood(m.v)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 14, cursor: 'pointer',
                background: mood === m.v ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.03)',
                border: mood === m.v ? '1.5px solid #8b5cf6' : '1px solid rgba(255,255,255,0.05)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 22 }}>{m.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: mood === m.v ? '#c4b5fd' : 'rgba(255,255,255,0.4)' }}>{m.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Journal */}
      <Card title="What happened today?">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write freely — what you did, how you felt, what's on your mind..."
          rows={5}
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, color: '#fff', fontSize: 14, lineHeight: 1.6, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </Card>

      {/* Wins + Improvements */}
      <Card title="What went well" icon={<ThumbsUp size={14} color="#10b981" />}>
        <EditableList items={wins} setItems={setWins} placeholder="A small win counts..." accent="#10b981" />
      </Card>

      <Card title="What could be better" icon={<Target size={14} color="#f59e0b" />}>
        <EditableList items={improvements} setItems={setImprovements} placeholder="Something to improve tomorrow..." accent="#f59e0b" />
      </Card>

      {/* Context chips */}
      {(dayTasks.length > 0 || dayExpenses.length > 0) && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {dayTasks.length > 0 && <Chip>{dayTasks.filter((t) => t.done).length}/{dayTasks.length} tasks done</Chip>}
          {dayExpenses.length > 0 && <Chip>₹{dayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0).toFixed(0)} spent</Chip>}
          <Chip muted>Aura will factor these in</Chip>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button onClick={() => handleSave()} style={{ flex: 1, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
          {saved ? <><Check size={16} color="#10b981" /> Saved</> : 'Save Entry'}
        </button>
        <button onClick={handleReview} disabled={reviewing} style={{ flex: 1.4, height: 50, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
          {reviewing ? <><Loader2 size={16} className="aura-spin" /> Reflecting...</> : <><Wand2 size={16} /> Ask Aura to review</>}
        </button>
      </div>

      {/* AI Review */}
      <AnimatePresence>
        {aiReview && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'linear-gradient(160deg, rgba(99,102,241,0.1), rgba(139,92,246,0.04))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 24, padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sparkles size={16} color="#c4b5fd" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Aura's Reflection</span>
              {aiReview._engine && aiReview._engine !== 'groq' && (
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 6 }}>
                  {aiReview._engine === 'heuristic' || aiReview._engine === 'local-fallback' ? 'BASIC MODE' : aiReview._engine}
                </span>
              )}
            </div>

            {aiReview.summary && <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>{aiReview.summary}</p>}

            {aiReview.connection && (
              <div style={{ display: 'flex', gap: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 14, padding: 12, marginBottom: 16 }}>
                <Link2 size={15} color="#c4b5fd" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, lineHeight: 1.5, color: '#ddd6fe' }}>{aiReview.connection}</p>
              </div>
            )}

            {aiReview.wins?.length > 0 && (
              <ReviewBlock label="Wins" color="#10b981" items={aiReview.wins} />
            )}
            {aiReview.improvements?.length > 0 && (
              <ReviewBlock label="To improve" color="#f59e0b" items={aiReview.improvements} />
            )}
            {aiReview.focus_tomorrow && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#818cf8' }}>Focus tomorrow</span>
                <p style={{ fontSize: 14, color: '#fff', fontWeight: 600, marginTop: 4 }}>{aiReview.focus_tomorrow}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`.aura-spin{animation:aura-spin 0.9s linear infinite}@keyframes aura-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

const navBtn = { width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' };

const Card = ({ title, icon, children }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 18, marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
      {icon}
      <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
    </div>
    {children}
  </div>
);

const Chip = ({ children, muted }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 999, background: muted ? 'transparent' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: muted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)' }}>{children}</span>
);

const ReviewBlock = ({ label, color, items }) => (
  <div style={{ marginBottom: 12 }}>
    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color }}>{label}</span>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, marginTop: 7, flexShrink: 0 }} />
          <span style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.8)' }}>{it}</span>
        </div>
      ))}
    </div>
  </div>
);

export default DiaryPage;
