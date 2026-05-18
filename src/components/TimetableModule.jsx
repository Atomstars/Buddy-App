import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, IndianRupee, Plus, Sparkles, Target, Trash2, Pencil } from 'lucide-react';
import { IconButton, Modal, ProgressBar } from './common';
import { getLocalTodayDateString, formatDateISO, isToday, formatDate, isPast } from '../utils/dateUtils';

const taskTypes = [
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'money', label: 'Money', icon: IndianRupee },
  { id: 'reminder', label: 'Reminder', icon: CalendarCheck },
  { id: 'fun', label: 'Fun', icon: Sparkles },
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

  return (
    <motion.div className="module-stack" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <section className="timetable-hero">
        <div className="timetable-card-3d">
          <div className="time-face">
            <span>{nextTask?.time || 'Free'}</span>
            <strong>{nextTask?.title || 'No pending tasks'}</strong>
          </div>
          <svg className="progress-ring" width="80" height="80">
            <circle
              className="progress-ring-circle-bg"
              stroke="var(--line)"
              strokeWidth="6"
              fill="transparent"
              r="34"
              cx="40"
              cy="40"
            />
            <circle
              className="progress-ring-circle"
              stroke="var(--blue)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="transparent"
              r="34"
              cx="40"
              cy="40"
              style={{
                strokeDasharray: `${2 * Math.PI * 34}`,
                strokeDashoffset: `${2 * Math.PI * 34 * (1 - (progress / 100))}`,
                transition: 'stroke-dashoffset 0.5s ease-in-out'
              }}
            />
          </svg>
          <div className="progress-text" style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--ink)' }}>
            {progress}%
          </div>
        </div>
        <div className="timetable-copy">
          <p className="eyebrow">Your schedule</p>
          <h2>{isToday(selectedDate) ? 'Today' : formatDate(selectedDate)}</h2>
          <p>{dailyTasks.length === 0 ? "You have no tasks scheduled for this day." : `You have ${dailyTasks.length} tasks scheduled.`}</p>
          {!isPast(selectedDate) && (
            <button className="primary-button inline" onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }} style={{ marginTop: '16px', marginRight: '8px' }}>
              <Plus size={18} />
              Add task
            </button>
          )}
          <button className="primary-button inline" onClick={onViewHistory} style={{ marginTop: '16px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)' }}>
            View History
          </button>
        </div>
      </section>

      {/* Removed check-strip as it's now in the global header */}

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
                <button className="task-main" onClick={() => {
                  if (task.done) {
                    onToggleTask(task.id, 0); // Mark undone
                  } else {
                    setTaskToComplete(task);
                  }
                }}>
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
                  <IconButton label="Reschedule task" onClick={() => setTaskToReschedule(task)}>
                    <CalendarCheck size={16} />
                  </IconButton>
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

const TaskModal = ({ isOpen, onClose, onSave, defaultDate, editData }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [date, setDate] = useState(defaultDate || getLocalTodayDateString());
  const [type, setType] = useState('focus');
  const [sector, setSector] = useState('');
  const [plannedHours, setPlannedHours] = useState('');

  useEffect(() => {
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
          Sector/Category
          <input value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Java prep, Office, AI/ML..." />
        </label>
        <div style={{ display: 'flex', gap: '16px' }}>
          <label className="field-label" style={{ flex: 1 }}>
            Time
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          </label>
          <label className="field-label" style={{ flex: 1 }}>
            Planned Hours
            <input type="number" min="0" step="0.5" value={plannedHours} onChange={(event) => setPlannedHours(event.target.value)} placeholder="e.g. 2" />
          </label>
        </div>
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

const ActualHoursModal = ({ task, isOpen, onClose, onSave }) => {
  const [hours, setHours] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      setHours(task.plannedHours ? String(task.plannedHours) : '');
    }
  }, [isOpen, task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(parseFloat(hours) || 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark as Done">
      <form className="modal-form" onSubmit={handleSubmit}>
        <p>How many actual hours did you spend on this?</p>
        <label className="field-label">
          Actual Hours
          <input type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} autoFocus />
        </label>
        <button className="primary-button" type="submit">Complete Task</button>
      </form>
    </Modal>
  );
};

const RescheduleModal = ({ task, isOpen, onClose, onSave }) => {
  if (!task) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Task">
      <div className="modal-form">
        <p style={{ lineHeight: 1.5, marginBottom: '16px' }}>
          You didn't complete <strong>{task.title}</strong>.<br />
          Would you like to automatically reschedule it for tomorrow at <strong>{task.time}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="primary-button" style={{ flex: 1 }} onClick={onSave}>Yes, Reschedule</button>
          <button className="primary-button" style={{ flex: 1, background: 'var(--surface-sunken)', color: 'var(--text-main)' }} onClick={onClose}>No, Cancel</button>
        </div>
      </div>
    </Modal>
  );
};
