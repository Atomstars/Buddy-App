import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Plus, X, Target, Pin, PinOff, Trash2, Pencil, Check,
  Flag, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'personal', label: 'Personal', color: '#8b5cf6' },
  { id: 'health', label: 'Health', color: '#10b981' },
  { id: 'career', label: 'Career', color: '#6366f1' },
  { id: 'finance', label: 'Finance', color: '#f59e0b' },
  { id: 'learning', label: 'Learning', color: '#06b6d4' },
  { id: 'relationships', label: 'Relationships', color: '#f43f5e' },
];
const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

export const ManifestPage = ({ manifest }) => {
  const { goals = [], vision = '', addGoal, updateGoal, removeGoal, toggleMilestone, saveVision } = manifest || {};
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [visionDraft, setVisionDraft] = useState(vision);
  const [editingVision, setEditingVision] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => setVisionDraft(vision), [vision]);

  const activeGoals = goals.filter((g) => g.status !== 'done');
  const doneGoals = goals.filter((g) => g.status === 'done');

  return (
    <div style={{ paddingBottom: 160 }}>
      {/* North star */}
      <div style={{ background: 'linear-gradient(160deg, rgba(139,92,246,0.14), rgba(99,102,241,0.04))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 24, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} color="#c4b5fd" />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c4b5fd' }}>My North Star</span>
        </div>
        {editingVision ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea
              value={visionDraft}
              onChange={(e) => setVisionDraft(e.target.value)}
              autoFocus
              rows={3}
              placeholder="In one line — who am I becoming? e.g. 'Calm, healthy, financially free and present with the people I love.'"
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 12, color: '#fff', fontSize: 15, lineHeight: 1.5, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { saveVision?.(visionDraft); setEditingVision(false); }} style={btnPrimary}>Save vision</button>
              <button onClick={() => { setVisionDraft(vision); setEditingVision(false); }} style={btnGhost}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditingVision(true)} style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
            <p style={{ fontSize: vision ? 18 : 14, fontWeight: vision ? 700 : 500, lineHeight: 1.5, color: vision ? '#fff' : 'rgba(255,255,255,0.4)', fontStyle: vision ? 'normal' : 'italic' }}>
              {vision || 'Tap to write your north-star vision — the life you’re manifesting.'}
            </p>
          </button>
        )}
      </div>

      {/* Add goal */}
      <button onClick={() => { setEditing(null); setShowModal(true); }} style={{ width: '100%', height: 50, borderRadius: 16, background: '#fff', color: '#000', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', border: 'none', marginBottom: 24 }}>
        <Plus size={16} /> Add a Goal
      </button>

      {/* Active goals */}
      {activeGoals.length === 0 && doneGoals.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.3)' }}>
          <Target size={28} style={{ marginBottom: 10, opacity: 0.4 }} />
          <p style={{ fontSize: 13 }}>No goals yet. What do you want to make real?</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeGoals.map((g) => (
            <GoalCard key={g.id} g={g} expanded={expanded === g.id} onExpand={() => setExpanded(expanded === g.id ? null : g.id)}
              onEdit={() => { setEditing(g); setShowModal(true); }} onDelete={() => removeGoal?.(g.id)}
              onPin={() => updateGoal?.(g.id, { is_pinned: !g.is_pinned })} onToggleMilestone={(i) => toggleMilestone?.(g.id, i)}
              onProgress={(p) => updateGoal?.(g.id, { progress: p, status: p >= 100 ? 'done' : 'active' })} />
          ))}

          {doneGoals.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 16 }}>Achieved · {doneGoals.length}</p>
              {doneGoals.map((g) => (
                <GoalCard key={g.id} g={g} done expanded={expanded === g.id} onExpand={() => setExpanded(expanded === g.id ? null : g.id)}
                  onEdit={() => { setEditing(g); setShowModal(true); }} onDelete={() => removeGoal?.(g.id)}
                  onPin={() => updateGoal?.(g.id, { is_pinned: !g.is_pinned })} onToggleMilestone={(i) => toggleMilestone?.(g.id, i)}
                  onProgress={(p) => updateGoal?.(g.id, { progress: p, status: p >= 100 ? 'done' : 'active' })} />
              ))}
            </>
          )}
        </div>
      )}

      <GoalModal isOpen={showModal} editData={editing} onClose={() => { setShowModal(false); setEditing(null); }}
        onSave={(data) => { if (editing) updateGoal?.(editing.id, data); else addGoal?.(data); }} />
    </div>
  );
};

const GoalCard = ({ g, done, expanded, onExpand, onEdit, onDelete, onPin, onToggleMilestone, onProgress }) => {
  const cat = catOf(g.category);
  const milestones = g.milestones || [];
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${g.is_pinned ? cat.color + '55' : 'rgba(255,255,255,0.05)'}`, borderRadius: 20, padding: 16, opacity: done ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: cat.color + '22', color: cat.color }}>{cat.label}</span>
            {g.is_pinned && <Pin size={12} color={cat.color} />}
            {done && <Check size={14} color="#10b981" />}
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: done ? 'line-through' : 'none' }}>{g.title}</p>
          {g.description && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4, lineHeight: 1.4 }}>{g.description}</p>}
          {g.target_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: 'rgba(255,255,255,0.4)' }}>
              <Calendar size={11} /><span style={{ fontSize: 11 }}>{new Date(g.target_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          )}
        </div>
        {/* Progress ring */}
        <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
          <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle cx="24" cy="24" r="20" fill="none" stroke={cat.color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(g.progress / 100) * 125.6} 125.6`} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>{g.progress}%</div>
        </div>
      </div>

      {/* Quick progress slider */}
      <input type="range" min="0" max="100" step="5" value={g.progress} onChange={(e) => onProgress(Number(e.target.value))}
        style={{ width: '100%', marginTop: 12, accentColor: cat.color }} />

      {/* Footer actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onExpand} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          <Flag size={12} /> {milestones.length ? `${milestones.filter((m) => m.done).length}/${milestones.length} milestones` : 'No milestones'} {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <IconBtn onClick={onPin}>{g.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}</IconBtn>
          <IconBtn onClick={onEdit}><Pencil size={13} /></IconBtn>
          <IconBtn onClick={onDelete} danger><Trash2 size={13} /></IconBtn>
        </div>
      </div>

      <AnimatePresence>
        {expanded && milestones.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {milestones.map((m, i) => (
                <button key={i} onClick={() => onToggleMilestone(i)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 0' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0, background: m.done ? cat.color : 'transparent', border: m.done ? 'none' : '1.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.done && <Check size={12} color="#fff" />}
                  </div>
                  <span style={{ fontSize: 13, color: m.done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)', textDecoration: m.done ? 'line-through' : 'none' }}>{m.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GoalModal = ({ isOpen, editData, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [msDraft, setMsDraft] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setTitle(editData?.title || '');
    setDescription(editData?.description || '');
    setCategory(editData?.category || 'personal');
    setTargetDate(editData?.target_date || '');
    setMilestones(editData?.milestones || []);
    setMsDraft('');
  }, [isOpen, editData]);

  if (!isOpen) return null;
  const submit = () => {
    if (!title.trim()) return;
    onSave({ title, description, category, target_date: targetDate || null, milestones });
    onClose();
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }} />
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={{ position: 'relative', width: '100%', maxWidth: 450, background: '#121214', borderTopLeftRadius: 28, borderTopRightRadius: 28, border: '1px solid rgba(255,255,255,0.08)', padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 12px))', maxHeight: '92vh', overflowY: 'auto', zIndex: 130 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '-10px auto 14px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{editData ? 'Edit Goal' : 'New Goal'}</h2>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', color: '#fff' }}><X size={16} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Goal">
              <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="Run a half marathon, save ₹2L, learn guitar..." style={inputStyle} />
            </Field>
            <Field label="Why it matters (optional)">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Anchor it to a reason." style={{ ...inputStyle, height: 'auto', padding: 12, resize: 'vertical', fontFamily: 'inherit' }} />
            </Field>
            <Field label="Category">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: category === c.id ? c.color + '22' : 'rgba(255,255,255,0.03)', border: category === c.id ? `1.5px solid ${c.color}` : '1px solid rgba(255,255,255,0.06)', color: category === c.id ? c.color : 'rgba(255,255,255,0.5)' }}>{c.label}</button>
                ))}
              </div>
            </Field>
            <Field label="Target date (optional)">
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Milestones">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {milestones.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '8px 12px' }}>
                    <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{m.text}</span>
                    <button onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}><X size={14} /></button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={msDraft} onChange={(e) => setMsDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (msDraft.trim()) { setMilestones([...milestones, { text: msDraft.trim(), done: false }]); setMsDraft(''); } } }} placeholder="Break it into steps..." style={{ ...inputStyle, height: 40 }} />
                  <button onClick={() => { if (msDraft.trim()) { setMilestones([...milestones, { text: msDraft.trim(), done: false }]); setMsDraft(''); } }} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#fff', flexShrink: 0 }}><Plus size={16} /></button>
                </div>
              </div>
            </Field>
            <button onClick={submit} style={{ height: 50, borderRadius: 16, background: '#fff', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none' }}>{editData ? 'Save Changes' : 'Create Goal'}</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{label}</label>
    {children}
  </div>
);
const IconBtn = ({ children, onClick, danger }) => (
  <button onClick={onClick} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: danger ? 'rgba(244,63,94,0.8)' : 'rgba(255,255,255,0.5)' }}>{children}</button>
);
const inputStyle = { width: '100%', height: 48, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0 14px', color: '#fff', fontSize: 13, outline: 'none' };
const btnPrimary = { flex: 1, height: 40, borderRadius: 12, background: '#fff', color: '#000', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' };
const btnGhost = { flex: 1, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 600, fontSize: 13, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' };

export default ManifestPage;
