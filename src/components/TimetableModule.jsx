import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, IndianRupee, Plus, Sparkles, Target, Trash2, Pencil } from 'lucide-react';
import { IconButton, Modal, ProgressBar } from './common';
import { getLocalTodayDateString } from '../utils/dateUtils';

const getNextDays = (numDays) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < numDays; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    dates.push({
      dateStr: nextDate.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : nextDate.toLocaleDateString('en-US', { weekday: 'short' }),
      day: nextDate.getDate()
    });
  }
  return dates;
};

const taskTypes = [
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'money', label: 'Money', icon: IndianRupee },
  { id: 'reminder', label: 'Reminder', icon: CalendarCheck },
  { id: 'fun', label: 'Fun', icon: Sparkles },
];

export const TimetableModule = ({ tasks, onAddTask, onToggleTask, onEditTask, onDeleteTask, coach }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalTodayDateString());
  
  const dailyTasks = tasks.filter(t => t.date === selectedDate);
  const sortedTasks = [...dailyTasks].sort((a, b) => a.time.localeCompare(b.time));
  const doneCount = dailyTasks.filter((task) => task.done).length;
  const progress = dailyTasks.length ? Math.round((doneCount / dailyTasks.length) * 100) : 0;
  const nextTask = sortedTasks.find((task) => !task.done);
  const dateStrip = getNextDays(7);

  return (
    <motion.div className="module-stack" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <section className="timetable-hero">
        <div className="timetable-card-3d">
          <div className="time-face">
            <span>{nextTask?.time || 'Free'}</span>
            <strong>{nextTask?.title || 'No pending tasks'}</strong>
          </div>
          <div className="time-ring" />
        </div>
        <div className="timetable-copy">
          <p className="eyebrow">3D timetable</p>
          <h2>{progress}% of today handled</h2>
          <p>{nextTask ? `Next: ${nextTask.title} at ${nextTask.time}.` : 'You cleared the board. Add the next reminder when ready.'}</p>
          <button className="primary-button inline" onClick={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}>
            <Plus size={18} />
            Add reminder
          </button>
        </div>
      </section>

      <div className="check-strip" style={{ overflowX: 'auto', padding: '10px', display: 'flex', gap: '8px' }}>
        {dateStrip.map(d => (
          <button 
            key={d.dateStr} 
            onClick={() => setSelectedDate(d.dateStr)}
            className={`check-pill ${selectedDate === d.dateStr ? 'done' : ''}`}
            style={{ flexDirection: 'column', alignItems: 'center', minHeight: 'auto', padding: '8px 16px', gap: '2px' }}
          >
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{d.label}</span>
            <strong style={{ fontSize: '1rem', lineHeight: 1 }}>{d.day}</strong>
          </button>
        ))}
      </div>

      <section className="section-block">
        <div className="section-title">
          <div>
            <p className="eyebrow">Today timetable</p>
            <h2>Funny, firm, usable</h2>
          </div>
          <span>{doneCount}/{dailyTasks.length} done</span>
        </div>
        <ProgressBar value={progress} tone={progress < 45 ? 'watch' : 'normal'} />
        <div className="task-list">
          {sortedTasks.map((task) => {
            const type = taskTypes.find((item) => item.id === task.type) || taskTypes[0];
            const Icon = type.icon;
            return (
              <article className={`task-item ${task.done ? 'done' : ''}`} key={task.id}>
                <button className="task-main" onClick={() => onToggleTask(task.id)}>
                  <span className="task-time">{task.time}</span>
                  <span className="task-icon">
                    <Icon size={18} />
                  </span>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{task.done ? 'Done. Nice.' : `${type.label} mode`}</small>
                  </span>
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <IconButton label="Edit task" onClick={() => {
                    setEditingTask(task);
                    setShowTaskModal(true);
                  }}>
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton label="Delete task" className="danger" onClick={() => onDeleteTask(task.id)}>
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <div>
            <p className="eyebrow">Assistant link</p>
            <h2>Money and time together</h2>
          </div>
        </div>
        <div className="insight-grid two">
          <div className="insight-card">
            <IndianRupee size={19} />
            <span>Budget context</span>
            <strong>{coach.nudge}</strong>
          </div>
          <div className="insight-card">
            <Target size={19} />
            <span>Operating rule</span>
            <strong>Put expense logging next to daily planning so the habit has a place.</strong>
          </div>
        </div>
      </section>

      <TaskModal 
        isOpen={showTaskModal} 
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }} 
        onSave={(data) => {
          if (editingTask) {
            onEditTask(editingTask.id, data);
          } else {
            onAddTask(data);
          }
        }} 
        defaultDate={selectedDate} 
        editData={editingTask}
      />
    </motion.div>
  );
};

const TaskModal = ({ isOpen, onClose, onSave, defaultDate, editData }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [date, setDate] = useState(defaultDate || getLocalTodayDateString());
  const [type, setType] = useState('focus');

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setTitle(editData.title);
      setTime(editData.time);
      setDate(editData.date);
      setType(editData.type);
    } else {
      setTitle('');
      setTime('09:00');
      setDate(defaultDate || getLocalTodayDateString());
      setType('focus');
    }
  }, [isOpen, defaultDate, editData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({ title, time, date, type });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add reminder">
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="sector-picker">
          {taskTypes.map((item) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.id} className={type === item.id ? 'selected' : ''} onClick={() => setType(item.id)}>
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <label className="field-label">
          Reminder
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Buy groceries, study, gym..." autoFocus />
        </label>
        <label className="field-label">
          Time
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
        </label>
        <label className="field-label">
          Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button className="primary-button" type="submit">
          <CalendarCheck size={19} />
          Add to timetable
        </button>
      </form>
    </Modal>
  );
};

export default TimetableModule;
