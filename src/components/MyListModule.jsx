import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ListTodo, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { IconButton, Modal, ProgressBar } from './common';

export const MyListModule = ({ lists, onAddList, onRemoveList, onAddItem, onToggleItem, onRemoveItem }) => {
  const [showAddListModal, setShowAddListModal] = useState(false);

  return (
    <motion.div className="module-stack" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <section className="timetable-hero">
        <div className="timetable-card-3d" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div className="time-face">
            <ListTodo size={32} color="white" />
            <strong style={{ marginTop: '8px' }}>Manifest</strong>
          </div>
          <div className="time-ring" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        </div>
        <div className="timetable-copy">
          <p className="eyebrow">Your vision</p>
          <h2>My Lists</h2>
          <p>Track your goals, purchases, and manifestations.</p>
          <button className="primary-button inline" onClick={() => setShowAddListModal(true)} style={{ marginTop: '16px' }}>
            <Plus size={18} />
            Create List
          </button>
        </div>
      </section>

      <section className="section-block">
        <div className="list-grid">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onAddItem={(text) => onAddItem(list.id, text)}
              onToggleItem={(itemId) => onToggleItem(list.id, itemId)}
              onRemoveItem={(itemId) => onRemoveItem(list.id, itemId)}
              onRemoveList={() => onRemoveList(list.id)}
            />
          ))}
          {lists.length === 0 && (
            <div className="empty-state">
              <ListTodo size={32} />
              <strong>No lists yet</strong>
              <p>Create a list to start tracking your goals.</p>
            </div>
          )}
        </div>
      </section>

      <AddListModal isOpen={showAddListModal} onClose={() => setShowAddListModal(false)} onSave={onAddList} />
    </motion.div>
  );
};

const ListCard = ({ list, onAddItem, onToggleItem, onRemoveItem, onRemoveList }) => {
  const [newItemText, setNewItemText] = useState('');
  
  const doneCount = list.items.filter(i => i.done).length;
  const progress = list.items.length > 0 ? (doneCount / list.items.length) * 100 : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItemText.trim()) {
      onAddItem(newItemText);
      setNewItemText('');
    }
  };

  return (
    <article className="category-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="category-head" style={{ marginBottom: '0' }}>
        <div>
          <h3>{list.title}</h3>
          <p>{list.items.length} items</p>
        </div>
        <IconButton label="Delete list" className="danger" onClick={onRemoveList}>
          <Trash2 size={16} />
        </IconButton>
      </div>

      {list.items.length > 0 && (
        <ProgressBar value={progress} tone="normal" />
      )}

      <div className="task-list" style={{ marginTop: '8px' }}>
        {list.items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <button 
              onClick={() => onToggleItem(item.id)} 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', opacity: item.done ? 0.5 : 1, textDecoration: item.done ? 'line-through' : 'none' }}
            >
              {item.done ? <CheckCircle2 size={18} color="var(--success)" /> : <Circle size={18} color="var(--text-muted)" />}
              <span>{item.text}</span>
            </button>
            <IconButton label="Delete item" className="danger" onClick={() => onRemoveItem(item.id)} style={{ padding: '4px' }}>
              <Trash2 size={14} />
            </IconButton>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <input 
          type="text" 
          value={newItemText} 
          onChange={(e) => setNewItemText(e.target.value)} 
          placeholder="Add new item..." 
          style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-sunken)', color: 'var(--text-main)' }}
        />
        <button type="submit" className="primary-button inline" disabled={!newItemText.trim()} style={{ padding: '0 16px' }}>
          <Plus size={18} />
        </button>
      </form>
    </article>
  );
};

const AddListModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title);
      setTitle('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create List">
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="field-label">
          List Title
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., Car Purchase, Career Goals" 
            autoFocus 
          />
        </label>
        <button className="primary-button" type="submit">
          <ListTodo size={19} />
          Create List
        </button>
      </form>
    </Modal>
  );
};

export default MyListModule;
