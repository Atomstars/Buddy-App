import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, IndianRupee, Plus, Sparkles, Target, Trash2, Pencil,
  Clock, CheckCircle2, ChevronRight, X, CalendarDays,
} from 'lucide-react';
import { getLocalTodayDateString, formatDateISO, isToday, formatDate, isPast } from '../utils/dateUtils';

const taskTypes = [
  { id: 'focus', label: 'Focus', icon: Target, color: 'var(--accent)' },
  { id: 'money', label: 'Money', icon: IndianRupee, color: 'var(--emerald)' },
  { id: 'reminder', label: 'Reminder', icon: CalendarCheck, color: 'var(--amber)' },
  { id: 'fun', label: 'Fun', icon: Sparkles, color: 'var(--violet)' },
];

export const TimetableModule = ({ tasks, onAddTask, onToggleTask, onEditTask, onDeleteTask, onRescheduleTask, coach, selectedDate, onViewHistory }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [taskToReschedule, setTaskToReschedule] = useState(null);

  const dateStr = formatDateISO(selectedDate || new Date());
  const dailyTasks = tasks.filter(t => t.date === dateStr);
  const sortedTasks = [...dailyTasks].sort((a, b) => a.time.localeCompare(b.time));
  const doneCount = dailyTasks.filter((task) => task.done).length;
  const progress = dailyTasks.length ? Math.round((doneCount / dailyTasks.length) * 100) : 0;
  const nextTask = sortedTasks.find((task) => !task.done);

  const circumference = 2 * Math.PI * 34;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Gradient Hero */}
      <div className="gradient-hero schedule">
        <p className="hero-eyebrow">Your schedule</p>
        <h2 className="hero-title">{isToday(selectedDate) ? 'Today' : formatDate(selectedDate)}</h2>
        <p className="hero-subtitle">
          {dailyTasks.length === 0
            ? 'You have no tasks scheduled for this day.'
            : `You have ${dailyTasks.length} task${dailyTasks.length !== 1 ? 's' : ''} scheduled.`}
        </p>

        <div className="hero-stats-row">
          <div className="stat-pill">
            <CheckCircle2 size={14} />
            <div>
              <span className="stat-label">Done</span>
              <span className="stat-value">{doneCount}/{dailyTasks.length}</span>
            </div>
          </div>
          <div className="stat-pill">
            <Target size={14} />
            <div>
              <span className="stat-label">Progress</span>
              <span className="stat-value">{progress}%</span>
            </div>
          </div>
          {nextTask && (
            <div className="stat-pill">
              <Clock size={14} />
              <div>
                <span className="stat-label">Next</span>
                <span className="stat-value">{nextTask.time}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {!isPast(selectedDate) && (
            <button className="btn-primary" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
              <Plus size={18} />
              Add Task
            </button>
          )}
          <button className="btn-secondary" onClick={onViewHistory}>
            <Clock size={16} />
            View History
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {dailyTasks.length > 0 && (
        <div className="surface-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem', color: 'var(--text-2)' }}>
            <span>Daily Progress</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{progress}%</span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${progress < 45 ? 'warning' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Timeline task list */}
      <div className="surface-card" style={{ padding: 20 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <p className="section-eyebrow">{isToday(selectedDate) ? 'Today' : formatDate(selectedDate)}</p>
            <h3 className="section-title" style={{ fontSize: '1rem' }}>Timetable</h3>
          </div>
          <span className="section-badge">{doneCount}/{dailyTasks.length} done</span>
        </div>

        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={32} />
            <strong>No tasks yet</strong>
            <p>Add your first task to get started.</p>
          </div>
        ) : (
          <div className="timeline">
            {sortedTasks.map((task, index) => {
              const type = taskTypes.find((item) => item.id === task.type) || taskTypes[0];
              const Icon = type.icon;
              const isNext = !task.done && nextTask?.id === task.id;

              return (
                <motion.div
                  className="timeline-item"
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <div className={`timeline-marker ${task.done ? 'done' : ''} ${isNext ? 'active' : ''}`} />
                  <div className="timeline-content" style={{ opacity: task.done ? 0.6 : 1 }}>
                    <span className="timeline-time">{task.time}</span>
                    <span className="timeline-title" style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                      {task.title}
                    </span>
                    <span className="timeline-subtitle">
                      {task.done ? '✓ Done' : type.label}
                      {task.sector ? ` · ${task.sector}` : ''}
                      {task.plannedHours ? ` · ${task.plannedHours}h planned` : ''}
                    </span>

                    <div className="timeline-actions">
                      {/* Toggle done/undone */}
                      <button
                        className="btn-icon"
                        onClick={() => {
                          if (task.done) {
                            onToggleTask(task.id, 0);
                          } else {
                            setTaskToComplete(task);
                          }
                        }}
                        title={task.done ? 'Mark undone' : 'Mark done'}
                      >
                        <CheckCircle2 size={16} />
                      </button>

                      {/* Reschedule */}
                      <button className="btn-icon" onClick={() => setTaskToReschedule(task)} title="Reschedule">
                        <CalendarCheck size={16} />
                      </button>

                      {/* Edit */}
                      <button className="btn-icon" onClick={() => { setEditingTask(task); setShowTaskModal(true); }} title="Edit">
                        <Pencil size={16} />
                      </button>

                      {/* Delete */}
                      <button className="btn-icon danger" onClick={() => onDeleteTask(task.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSave={(data) => {
          if (editingTask) {
            onEditTask(editingTask.id, data);
          } else {
            onAddTask(data);
          }
        }}
        defaultDate={dateStr}
        editData={editingTask}
      />

      <ActualHoursModal
        task={taskToComplete}
        isOpen={Boolean(taskToComplete)}
        onClose={() => setTaskToComplete(null)}
        onSave={(hours) => {
          onToggleTask(taskToComplete.id, hours);
          setTaskToComplete(null);
        }}
      />

      <RescheduleModal
        task={taskToReschedule}
        isOpen={Boolean(taskToReschedule)}
        onClose={() => setTaskToReschedule(null)}
        onSave={() => {
          onRescheduleTask(taskToReschedule.id);
          setTaskToReschedule(null);
        }}
      />
    </motion.div>
  );
};

/* ─────────── Task Modal ─────────── */
const TaskModal = ({ isOpen, onClose, onSave, defaultDate, editData }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [date, setDate] = useState(defaultDate || getLocalTodayDateString());
  const [type, setType] = useState('focus');
  const [sector, setSector] = useState('');
  const [plannedHours, setPlannedHours] = useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setTitle(editData.title);
      setTime(editData.time);
      setDate(editData.date);
      setType(editData.type);
      setSector(editData.sector || '');
      setPlannedHours(editData.plannedHours ? String(editData.plannedHours) : '');
    } else {
      setTitle('');
      setTime('09:00');
      setDate(defaultDate || getLocalTodayDateString());
      setType('focus');
      setSector('');
      setPlannedHours('');
    }
  }, [isOpen, defaultDate, editData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({ title, time, date, type, sector, plannedHours: parseFloat(plannedHours) || 0 });
    onClose();
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
              <h2 className="modal-sheet-title">{editData ? 'Edit Task' : 'Add Task'}</h2>
              <button className="btn-icon" onClick={onClose}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 4px' }}>
              {/* Type picker */}
              <div className="selector-grid">
                {taskTypes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`selector-grid-item ${type === item.id ? 'active' : ''}`}
                      onClick={() => setType(item.id)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="form-group">
                <label className="form-label">Reminder</label>
                <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Buy groceries, study, gym..." autoFocus />
              </div>

              <div className="form-group">
                <label className="form-label">Sector/Category</label>
                <input className="form-input" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Java prep, Office, AI/ML..." />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Time</label>
                  <input className="form-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Planned Hours</label>
                  <input className="form-input" type="number" min="0" step="0.5" value={plannedHours} onChange={(e) => setPlannedHours(e.target.value)} placeholder="e.g. 2" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <button className="btn-primary" type="submit" style={{ width: '100%' }}>
                <CalendarCheck size={18} />
                {editData ? 'Save Changes' : 'Add to Timetable'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─────────── Actual Hours Modal ─────────── */
const ActualHoursModal = ({ task, isOpen, onClose, onSave }) => {
  const [hours, setHours] = useState('');

  React.useEffect(() => {
    if (isOpen && task) {
      setHours(task.plannedHours ? String(task.plannedHours) : '');
    }
  }, [isOpen, task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(parseFloat(hours) || 0);
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
              <h2 className="modal-sheet-title">Mark as Done</h2>
              <button className="btn-icon" onClick={onClose}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                How many actual hours did you spend on this?
              </p>
              <div className="form-group">
                <label className="form-label">Actual Hours</label>
                <input className="form-input" type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} autoFocus />
              </div>
              <button className="btn-primary" type="submit" style={{ width: '100%' }}>
                <CheckCircle2 size={18} />
                Complete Task
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─────────── Reschedule Modal ─────────── */
const RescheduleModal = ({ task, isOpen, onClose, onSave }) => {
  if (!task) return null;
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
              <h2 className="modal-sheet-title">Reschedule Task</h2>
              <button className="btn-icon" onClick={onClose}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ lineHeight: 1.6, color: 'var(--text-2)', fontSize: '0.9rem', margin: 0 }}>
                You didn't complete <strong style={{ color: 'var(--text-1)' }}>{task.title}</strong>.<br />
                Would you like to automatically reschedule it for tomorrow at <strong style={{ color: 'var(--text-1)' }}>{task.time}</strong>?
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={onSave}>
                  <CalendarCheck size={16} />
                  Yes, Reschedule
                </button>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                  No, Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimetableModule;
