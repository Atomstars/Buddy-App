import React, { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  CalendarCheck,
  CalendarDays,
  Check,
  Clock,
  IndianRupee,
  Pencil,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { formatDate, formatDateISO, getLocalTodayDateString, isPast, isToday } from '../utils/dateUtils';

const taskTypes = [
  { id: 'focus', label: 'Focus', icon: Target, color: '#8b5cf6' },
  { id: 'money', label: 'Money', icon: IndianRupee, color: '#34d399' },
  { id: 'reminder', label: 'Reminder', icon: CalendarCheck, color: '#fbbf24' },
  { id: 'fun', label: 'Fun', icon: Sparkles, color: '#22d3ee' },
];

const getTaskType = (task) => taskTypes.find((item) => item.id === task.type) || taskTypes[0];

const CompletionButton = ({ done, onClick }) => (
  <motion.button
    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${
      done ? 'border-emerald-300 bg-emerald-300 text-zinc-950' : 'border-white/15 bg-white/[0.035] text-transparent'
    }`}
    whileTap={{ scale: 0.86 }}
    onClick={onClick}
    type="button"
    aria-label={done ? 'Mark task incomplete' : 'Complete task'}
  >
    <AnimatePresence>
      {done && (
        <motion.span
          initial={{ scale: 0, rotate: -35 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 35 }}
          transition={{ type: 'spring', stiffness: 520, damping: 25 }}
        >
          <Check size={19} strokeWidth={3.2} />
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);

const TaskCard = ({ task, mode, onToggle, onEdit, onDelete }) => {
  const type = getTaskType(task);
  const Icon = type.icon;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: task.done ? 0.5 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
      className={`relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur-xl ${
        mode === 'timeline' ? 'ml-4 border-l-4' : ''
      }`}
      style={{ borderLeftColor: mode === 'timeline' ? type.color : undefined }}
    >
      <div className="flex items-start gap-3">
        <CompletionButton done={task.done} onClick={() => onToggle(task)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-zinc-950/70 px-2.5 py-1 text-xs font-bold text-zinc-300">{task.time}</span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-zinc-400">
              <Icon size={13} style={{ color: type.color }} />
              {type.label}
            </span>
          </div>
          <motion.h3
            className="mt-3 text-base font-bold tracking-tight text-white"
            animate={{ textDecorationLine: task.done ? 'line-through' : 'none' }}
          >
            {task.title}
          </motion.h3>
          <p className="mt-1 text-sm text-zinc-500">
            {task.sector || 'General'}
            {task.plannedHours ? ` • ${task.plannedHours}h planned` : ''}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 hover:bg-white/10 hover:text-white" onClick={() => onEdit(task)} type="button" title="Edit">
            <Pencil size={15} />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300" onClick={() => onDelete(task.id)} type="button" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export const TimetableModule = ({ tasks, onAddTask, onToggleTask, onEditTask, onDeleteTask, selectedDate }) => {
  const [viewMode, setViewMode] = useState('timeline');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const dateStr = formatDateISO(selectedDate || new Date());

  const dailyTasks = useMemo(
    () => tasks.filter((task) => task.date === dateStr).sort((a, b) => a.time.localeCompare(b.time)),
    [dateStr, tasks]
  );
  const activeTasks = dailyTasks.filter((task) => !task.done);
  const completedTasks = dailyTasks.filter((task) => task.done);
  const doneCount = completedTasks.length;
  const progress = dailyTasks.length ? Math.round((doneCount / dailyTasks.length) * 100) : 0;

  const handleToggle = (task) => {
    onToggleTask(task.id, task.done ? 0 : task.plannedHours || 0);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  return (
    <motion.section
      className="flex flex-col gap-6 pb-32"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start justify-between gap-4 pt-2">
        <div>
          <p className="text-sm font-medium text-zinc-400">Your schedule</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
            {isToday(selectedDate) ? 'Today' : formatDate(selectedDate)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{doneCount}/{dailyTasks.length} complete • {progress}% momentum</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.055] p-1 backdrop-blur-2xl">
          {['timeline', 'flexible'].map((mode) => (
            <button
              key={mode}
              className={`relative rounded-full px-3 py-2 text-xs font-bold capitalize ${viewMode === mode ? 'text-zinc-950' : 'text-zinc-500'}`}
              onClick={() => setViewMode(mode)}
              type="button"
            >
              {viewMode === mode && (
                <motion.span
                  layoutId="schedule-mode"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                />
              )}
              <span className="relative">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/25 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-zinc-950">
              <CalendarDays size={21} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Daily Flow</p>
              <p className="text-xs text-zinc-500">Premium task rhythm</p>
            </div>
          </div>
          {!isPast(selectedDate) && (
            <button
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-950"
              onClick={() => {
                setEditingTask(null);
                setShowTaskModal(true);
              }}
              type="button"
            >
              <Plus size={16} />
              Add
            </button>
          )}
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          />
        </div>
      </div>

      <LayoutGroup>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-white">{viewMode === 'timeline' ? 'Timeline' : 'Flexible List'}</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{activeTasks.length} active</span>
          </div>

          {activeTasks.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-white/10 p-10 text-center text-zinc-500">
              All clear.
            </div>
          ) : viewMode === 'timeline' ? (
            <div className="relative flex flex-col gap-4 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-white/10">
              <AnimatePresence mode="popLayout">
                {activeTasks.map((task) => (
                  <div key={task.id} className="relative">
                    <div className="absolute left-0 top-7 h-3.5 w-3.5 rounded-full border border-white/20 bg-zinc-950 shadow-[0_0_0_6px_rgba(255,255,255,0.03)]" />
                    <TaskCard task={task} mode="timeline" onToggle={handleToggle} onEdit={handleEdit} onDelete={onDeleteTask} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {activeTasks.map((task) => (
                  <TaskCard key={task.id} task={task} mode="flexible" onToggle={handleToggle} onEdit={handleEdit} onDelete={onDeleteTask} />
                ))}
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence>
            {completedTasks.length > 0 && (
              <motion.div layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="mt-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold tracking-tight text-white">Completed</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">{completedTasks.length} done</span>
                </div>
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {completedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} mode="flexible" onToggle={handleToggle} onEdit={handleEdit} onDelete={onDeleteTask} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>

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
    </motion.section>
  );
};

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
      return;
    }
    setTitle('');
    setTime('09:00');
    setDate(defaultDate || getLocalTodayDateString());
    setType('focus');
    setSector('');
    setPlannedHours('');
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
            onClick={(event) => event.stopPropagation()}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="modal-sheet-handle" />
            <div className="modal-sheet-header">
              <h2 className="modal-sheet-title">{editData ? 'Edit Task' : 'Add Task'}</h2>
              <button className="btn-icon" onClick={onClose} type="button"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-1">
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
                <label className="form-label">Task</label>
                <input className="form-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Gym, study, bills..." autoFocus />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Office, health, learning..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input className="form-input" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hours</label>
                  <input className="form-input" type="number" min="0" step="0.5" value={plannedHours} onChange={(event) => setPlannedHours(event.target.value)} placeholder="2" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>

              <button className="btn-primary w-full" type="submit">
                <Clock size={18} />
                {editData ? 'Save Changes' : 'Add to Schedule'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimetableModule;
