import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ListTodo, CheckCircle2, Circle, Trash2, X,
  Briefcase, HeartPulse, Home, ShoppingBag, Compass, BookOpen,
  ChevronLeft, Sparkles, Target, Star,
} from 'lucide-react';

const visionCategories = [
  { id: 'career', label: 'Career', icon: Briefcase, color: 'var(--accent)' },
  { id: 'health', label: 'Health', icon: HeartPulse, color: 'var(--emerald)' },
  { id: 'lifestyle', label: 'Lifestyle', icon: Home, color: 'var(--violet)' },
  { id: 'purchases', label: 'Purchases', icon: ShoppingBag, color: 'var(--amber)' },
  { id: 'experiences', label: 'Experiences', icon: Compass, color: 'var(--teal)' },
  { id: 'learning', label: 'Learning', icon: BookOpen, color: 'var(--rose)' },
];

// Map list titles to a category for icon/color fallback
const matchCategory = (title) => {
  const lower = title.toLowerCase();
  return visionCategories.find(c => lower.includes(c.id) || lower.includes(c.label.toLowerCase())) || null;
};

export const MyListModule = ({ lists, onAddList, onRemoveList, onAddItem, onToggleItem, onRemoveItem }) => {
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [expandedListId, setExpandedListId] = useState(null);

  const totalItems = lists.reduce((sum, l) => sum + l.items.length, 0);
  const totalDone = lists.reduce((sum, l) => sum + l.items.filter(i => i.done).length, 0);

  const expandedList = lists.find(l => l.id === expandedListId);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Gradient Hero */}
      <div className="gradient-hero manifest">
        <p className="hero-eyebrow">Your vision</p>
        <h2 className="hero-title">Manifest</h2>
        <p className="hero-subtitle">Track your goals, dreams, and aspirations</p>

        <div className="hero-stats-row">
          <div className="stat-pill">
            <ListTodo size={14} />
            <div>
              <span className="stat-label">Lists</span>
              <span className="stat-value">{lists.length}</span>
            </div>
          </div>
          <div className="stat-pill">
            <Target size={14} />
            <div>
              <span className="stat-label">Items</span>
              <span className="stat-value">{totalItems}</span>
            </div>
          </div>
          <div className="stat-pill">
            <CheckCircle2 size={14} />
            <div>
              <span className="stat-label">Done</span>
              <span className="stat-value">{totalDone}</span>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setShowAddListModal(true)} style={{ marginTop: 16 }}>
          <Plus size={18} />
          Create Vision
        </button>
      </div>

      {/* Expanded Card View */}
      <AnimatePresence mode="wait">
        {expandedList ? (
          <ExpandedCardView
            key="expanded"
            list={expandedList}
            onBack={() => setExpandedListId(null)}
            onAddItem={(text) => onAddItem(expandedList.id, text)}
            onToggleItem={(itemId) => onToggleItem(expandedList.id, itemId)}
            onRemoveItem={(itemId) => onRemoveItem(expandedList.id, itemId)}
            onRemoveList={() => { onRemoveList(expandedList.id); setExpandedListId(null); }}
          />
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Vision Grid */}
            {lists.length === 0 ? (
              <div className="empty-state" style={{ padding: 48 }}>
                <Star size={36} />
                <strong>No visions yet</strong>
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Create a list to start tracking your goals.</p>
              </div>
            ) : (
              <div className="vision-grid">
                {lists.map((list, index) => {
                  const category = matchCategory(list.title);
                  const Icon = category?.icon || ListTodo;
                  const color = category?.color || 'var(--accent)';
                  const doneCount = list.items.filter(i => i.done).length;
                  const progress = list.items.length > 0 ? Math.round((doneCount / list.items.length) * 100) : 0;

                  return (
                    <motion.button
                      key={list.id}
                      className="vision-card"
                      onClick={() => setExpandedListId(list.id)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="vision-card-header">
                        <div className="vision-card-icon" style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                          <Icon size={20} />
                        </div>
                        <div className="vision-card-count">{list.items.length}</div>
                      </div>
                      <div className="vision-card-title">{list.title}</div>
                      {list.items.length > 0 && (
                        <>
                          <div className="vision-card-progress">
                            <div className="vision-card-progress-fill" style={{ width: `${progress}%`, background: color }} />
                          </div>
                          {/* Mini preview — show first 3 items */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                            {list.items.slice(0, 3).map(item => (
                              <div key={item.id} style={{
                                fontSize: '0.7rem',
                                color: item.done ? 'var(--text-3)' : 'var(--text-2)',
                                textDecoration: item.done ? 'line-through' : 'none',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                textAlign: 'left',
                              }}>
                                {item.done ? '✓' : '○'} {item.text}
                              </div>
                            ))}
                            {list.items.length > 3 && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>+{list.items.length - 3} more</span>
                            )}
                          </div>
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add List Modal */}
      <AddListModal isOpen={showAddListModal} onClose={() => setShowAddListModal(false)} onSave={onAddList} />
    </motion.div>
  );
};

/* ─────────── Expanded Card View ─────────── */
const ExpandedCardView = ({ list, onBack, onAddItem, onToggleItem, onRemoveItem, onRemoveList }) => {
  const [newItemText, setNewItemText] = useState('');
  const category = matchCategory(list.title);
  const Icon = category?.icon || ListTodo;
  const color = category?.color || 'var(--accent)';
  const doneCount = list.items.filter(i => i.done).length;
  const progress = list.items.length > 0 ? Math.round((doneCount / list.items.length) * 100) : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn-icon" onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
        <button className="btn-icon danger" onClick={onRemoveList} title="Delete list">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Card header */}
      <div className="surface-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center',
            color, background: `color-mix(in srgb, ${color} 15%, transparent)`,
          }}>
            <Icon size={24} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{list.title}</h2>
            <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', margin: '4px 0 0' }}>
              {list.items.length} items · {doneCount} done
            </p>
          </div>
        </div>

        {list.items.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 6 }}>
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%`, background: color }} />
            </div>
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="surface-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {list.items.map(item => (
            <div className="vision-item" key={item.id}>
              <button
                className={`vision-item-check ${item.done ? 'done' : ''}`}
                onClick={() => onToggleItem(item.id)}
              >
                {item.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <span className={`vision-item-text ${item.done ? 'done' : ''}`}>{item.text}</span>
              <button className="btn-icon danger" onClick={() => onRemoveItem(item.id)} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {list.items.length === 0 && (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <Sparkles size={28} />
            <strong>No items yet</strong>
            <p style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>Add your first goal below.</p>
          </div>
        )}

        {/* Add item form */}
        <form className="vision-add-form" onSubmit={handleAdd}>
          <input
            className="form-input"
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add new item..."
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={!newItemText.trim()} style={{ padding: '0 18px', flexShrink: 0 }}>
            <Plus size={18} />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

/* ─────────── Add List Modal ─────────── */
const AddListModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTitle = title.trim() || (selectedTemplate ? visionCategories.find(c => c.id === selectedTemplate)?.label : '');
    if (finalTitle) {
      onSave(finalTitle);
      setTitle('');
      setSelectedTemplate(null);
      onClose();
    }
  };

  const handleTemplateClick = (catId) => {
    const cat = visionCategories.find(c => c.id === catId);
    if (selectedTemplate === catId) {
      setSelectedTemplate(null);
      setTitle('');
    } else {
      setSelectedTemplate(catId);
      setTitle(cat.label);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
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
              <h2 className="modal-sheet-title">Create Vision</h2>
              <button className="btn-icon" onClick={onClose}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Templates */}
              <div>
                <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Choose a template</label>
                <div className="selector-grid">
                  {visionCategories.map(cat => {
                    const CatIcon = cat.icon;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        className={`selector-grid-item ${selectedTemplate === cat.id ? 'active' : ''}`}
                        onClick={() => handleTemplateClick(cat.id)}
                      >
                        <CatIcon size={20} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom title */}
              <div className="form-group">
                <label className="form-label">Or enter a custom title</label>
                <input
                  className="form-input"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setSelectedTemplate(null); }}
                  placeholder="e.g., Car Purchase, Dream Vacation"
                  autoFocus
                />
              </div>

              <button className="btn-primary" type="submit" disabled={!title.trim() && !selectedTemplate} style={{ width: '100%' }}>
                <ListTodo size={18} />
                Create List
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MyListModule;
