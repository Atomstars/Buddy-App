import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, IndianRupee, Plus, Sparkles, Target, Trash2, Pencil,
  Clock, CheckCircle2, X, CalendarDays, ChevronLeft, ChevronRight, ChevronDown,
  Flame, Award, Eye, Bell, Repeat, AlertCircle, Play, Pause, RefreshCw, BarChart2, Briefcase, HeartPulse, ShieldAlert
} from 'lucide-react';
import { getLocalTodayDateString, formatDateISO, isToday, formatDate, isPast } from '../utils/dateUtils';

const taskTypes = [
  { id: 'focus',    label: 'Focus',    icon: Target,      color: '#6366f1' },
  { id: 'money',    label: 'Finance',  icon: IndianRupee, color: '#10b981' },
  { id: 'reminder', label: 'Reminder', icon: CalendarCheck,color: '#f59e0b' },
  { id: 'fun',      label: 'Fun',      icon: Sparkles,    color: '#8b5cf6' },
];

const TYPE_COLORS = {
  focus:    { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  money:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  reminder: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  fun:      { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

const TASK_CATEGORIES = [
  'Work', 'Personal', 'Bills', 'EMI Reminders', 'Meetings', 'Habits', 'Health Reminders', 'Subscription Reminders'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = [2025, 2026, 2027, 2028];

const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Helper to serialize and deserialize advanced attributes into the Supabase 'sector' column
const parseSector = (sectorStr) => {
  if (!sectorStr) return { category: 'Personal', priority: 'medium', reminder: '', repeat: 'none' };
  const parts = sectorStr.split('::');
  if (parts.length >= 4) {
    return {
      category: parts[0] || 'Personal',
      priority: parts[1] || 'medium',
      reminder: parts[2] || '',
      repeat: parts[3] || 'none'
    };
  }
  return {
    category: sectorStr || 'Personal',
    priority: 'medium',
    reminder: '',
    repeat: 'none'
  };
};

const serializeSector = (category, priority, reminder, repeat) => {
  return `${category || 'Personal'}::${priority || 'medium'}::${reminder || ''}::${repeat || 'none'}`;
};

export const TimetableModule = ({
  tasks = [], onAddTask, onToggleTask, onEditTask, onDeleteTask, onRescheduleTask,
  selectedDate, onViewHistory,
}) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask]     = useState(null);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [taskToReschedule, setTaskToReschedule] = useState(null);
  
  // View states
  const [localDate, setLocalDate]         = useState(selectedDate || new Date());
  const [viewMode, setViewMode]           = useState('day'); // 'day' | 'week' | 'timeline'
  const [calendarExpanded, setCalendarExpanded] = useState(true);

  // Sync prop changes
  useEffect(() => {
    if (selectedDate) {
      setLocalDate(selectedDate);
    }
  }, [selectedDate]);

  // Month / Year navigators
  const [navMonth, setNavMonth] = useState(localDate.getMonth());
  const [navYear, setNavYear]             = useState(localDate.getFullYear());
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [showYearGrid, setShowYearGrid]   = useState(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  // Focus timer overlay state
  const [focusTask, setFocusTask] = useState(null);
  const [focusTimeLeft, setFocusTimeLeft] = useState(1500); // 25 mins
  const [focusActive, setFocusActive] = useState(false);

  // Focus Timer countdown effect
  useEffect(() => {
    let timer = null;
    if (focusActive && focusTimeLeft > 0) {
      timer = setInterval(() => setFocusTimeLeft(p => p - 1), 1000);
    } else if (focusTimeLeft === 0) {
      setFocusActive(false);
    }
    return () => clearInterval(timer);
  }, [focusActive, focusTimeLeft]);

  // Synchronize month & year navigations when localDate updates
  useEffect(() => {
    setNavMonth(localDate.getMonth());
    setNavYear(localDate.getFullYear());
  }, [localDate]);

  // Format active day details
  const dateStr = formatDateISO(localDate);
  const dailyTasks = useMemo(() => tasks.filter(t => t.date === dateStr), [tasks, dateStr]);
  const sortedTasks = useMemo(() => [...dailyTasks].sort((a, b) => (a.time || '').localeCompare(b.time || '')), [dailyTasks]);
  const doneCount  = dailyTasks.filter(t => t.done).length;
  
  // Productivity statistics
  const plannedHoursTotal = dailyTasks.reduce((acc, curr) => acc + (curr.plannedHours || 0), 0);
  const actualHoursTotal = dailyTasks.reduce((acc, curr) => acc + (curr.actualHours || 0), 0);
  const productivityScore = useMemo(() => {
    if (dailyTasks.length === 0) return 0;
    const taskRatio = (doneCount / dailyTasks.length) * 50;
    const hourRatio = plannedHoursTotal > 0 ? Math.min((actualHoursTotal / plannedHoursTotal) * 50, 50) : (doneCount / dailyTasks.length) * 50;
    return Math.round(taskRatio + hourRatio);
  }, [dailyTasks, doneCount, plannedHoursTotal, actualHoursTotal]);

  // Streak tracker
  const taskStreak = 12; // Static high-fidelity mockup representation

  // Motivation triggers
  const motivationQuote = useMemo(() => {
    if (productivityScore >= 80) return "Spectacular focus today! You are unlocking peak financial & mental consistency.";
    if (productivityScore >= 40) return "Making progress. Keep going to seal your daily habit streak.";
    return "Start a focus session to power up your daily completion score.";
  }, [productivityScore]);

  // Calendar Day Generation
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();
    const firstDayIndex = new Date(navYear, navMonth, 1).getDay();
    const list = [];
    
    // Fill leading empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      list.push(null);
    }
    
    // Fill active dates
    for (let day = 1; day <= daysInMonth; day++) {
      list.push(new Date(navYear, navMonth, day));
    }
    
    return list;
  }, [navMonth, navYear]);

  // Generate a 5-day mini calendar strip centered around the selected localDate
  const miniCalendarDays = useMemo(() => {
    const days = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(localDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [localDate]);

  // Month navigational triggers
  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(p => p - 1);
    } else {
      setNavMonth(p => p - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(p => p + 1);
    } else {
      setNavMonth(p => p + 1);
    }
  };

  // Timeline segment categorization
  const timelineSegments = useMemo(() => {
    const morning = [];
    const afternoon = [];
    const evening = [];

    sortedTasks.forEach(task => {
      const hour = parseInt((task.time || '00:00').split(':')[0], 10);
      if (hour < 12) morning.push(task);
      else if (hour < 17) afternoon.push(task);
      else evening.push(task);
    });

    return { morning, afternoon, evening };
  }, [sortedTasks]);

  // Upcoming reminders strip (up to 3 undone/upcoming tasks)
  const upcomingReminders = useMemo(() => {
    return tasks
      .filter(t => !t.done && new Date(t.date) >= new Date().setHours(0,0,0,0))
      .sort((a,b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || ''))
      .slice(0, 3);
  }, [tasks]);

  return (
    <div style={{ paddingBottom: '160px' }}>
      
      {/* ── IMMERSIVE FOCUS MODE COVER TIMER ── */}
      <AnimatePresence>
        {focusTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 150,
              background: '#040405', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: 24
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
            
            <button
              onClick={() => { setFocusTask(null); setFocusActive(false); }}
              style={{
                position: 'absolute', top: 'max(48px, env(safe-area-inset-top, 48px))', right: 24,
                width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <motion.div
              animate={{ scale: focusActive ? [1, 1.02, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{
                width: 240, height: 240, borderRadius: '50%',
                border: '6px solid rgba(255,255,255,0.02)',
                borderTopColor: '#6366f1',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 50px rgba(99,102,241,0.15)', background: 'rgba(255,255,255,0.01)',
                marginBottom: 40, position: 'relative'
              }}
            >
              <span style={{ fontSize: 44, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', letterSpacing: -1 }}>
                {Math.floor(focusTimeLeft / 60).toString().padStart(2, '0')}:
                {(focusTimeLeft % 60).toString().padStart(2, '0')}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {focusActive ? 'Session Active' : 'Paused'}
              </span>
            </motion.div>

            <div style={{ textAlign: 'center', maxWidth: '320px', marginBottom: 40, position: 'relative' }}>
              <p style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Active Focus Target</p>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>{focusTask.title}</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Planned allocation: {focusTask.plannedHours} hrs</p>
            </div>

            {/* Timer controls */}
            <div style={{ display: 'flex', gap: 16, zIndex: 10 }}>
              <button
                onClick={() => setFocusActive(!focusActive)}
                style={{
                  width: 64, height: 64, borderRadius: '50%', background: '#fff', color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                {focusActive ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 3 }} />}
              </button>
              <button
                onClick={() => setFocusTimeLeft(1500)}
                style={{
                  width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER & PRODUCTIVITY INSIGHTS GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginBottom: 24 }}>
        
        {/* Left: Flame Streak / Title */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', marginBottom: 8 }}>
              <Flame size={18} fill="#f59e0b" style={{ transform: 'scale(1)', animation: 'pulse-glow 1s infinite alternate' }} />
              <span style={{ fontSize: 13, fontWeight: 800 }}>{taskStreak} Day Streak</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
              {isToday(localDate) ? 'Today' : formatDate(localDate)}
            </h2>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, marginTop: 10 }}>
            {motivationQuote}
          </p>
        </div>

        {/* Right: Circular Productivity Index */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="80" height="80" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#6366f1" strokeWidth="6" strokeDasharray={`${(productivityScore / 100) * 201} 201`} strokeLinecap="round" />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{productivityScore}%</span>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Productivity Index</span>
        </div>
      </div>

      {/* ── EXTENSIBLE CALENDAR ACCORDION CONTAINER ── */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, overflow: 'hidden', marginBottom: 24 }}>
        
        {/* Header: Month/Year and Expand Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
              {MONTHS[navMonth]} {navYear}
            </span>
          </div>

          <button 
            onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
            style={{ 
              width: 34, height: 34, borderRadius: 10, background: isCalendarExpanded ? '#fff' : 'rgba(255,255,255,0.05)', 
              color: isCalendarExpanded ? '#000' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <CalendarDays size={18} />
          </button>
        </div>

        {/* Full Calendar Dropdown or Mini Strip */}
        <AnimatePresence mode="wait">
          {isCalendarExpanded ? (
            <motion.div 
              key="full-calendar"
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              style={{ overflow: 'hidden' }}
            >
              {/* Navigation controls for full calendar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { setShowMonthGrid(!showMonthGrid); setShowYearGrid(false); }} style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {MONTHS[navMonth]} <ChevronDown size={14} />
                  </button>
                  <button onClick={() => { setShowYearGrid(!showYearGrid); setShowMonthGrid(false); }} style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {navYear} <ChevronDown size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handlePrevMonth} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                  <button onClick={handleNextMonth} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                </div>
              </div>

              {/* Collapsible Selectors Panel */}
              <AnimatePresence>
                {showMonthGrid && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: 12 }}>
                      {MONTHS.map((m, idx) => (
                        <button
                          key={m}
                          onClick={() => { setNavMonth(idx); setShowMonthGrid(false); }}
                          style={{
                            padding: 8, borderRadius: 10, fontSize: 12, fontWeight: 600,
                            background: navMonth === idx ? '#fff' : 'rgba(255,255,255,0.03)',
                            color: navMonth === idx ? '#000' : 'rgba(255,255,255,0.6)'
                          }}
                        >
                          {m.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {showYearGrid && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: 12 }}>
                      {YEARS.map(y => (
                        <button
                          key={y}
                          onClick={() => { setNavYear(y); setShowYearGrid(false); }}
                          style={{
                            padding: 8, borderRadius: 10, fontSize: 12, fontWeight: 600,
                            background: navYear === y ? '#fff' : 'rgba(255,255,255,0.03)',
                            color: navYear === y ? '#000' : 'rgba(255,255,255,0.6)'
                          }}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── CALENDAR DAYS GRID ── */}
              <div style={{ padding: 16 }}>
                {/* Week name headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 8 }}>
                  {DAY_NAMES_SHORT.map((nm, idx) => (
                    <span key={idx} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{nm}</span>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 8 }}>
                  {calendarDays.map((d, idx) => {
                    if (d === null) return <div key={`empty-${idx}`} />;
                    
                    const dStr = formatDateISO(d);
                    const isSelected = dStr === dateStr;
                    const isTodayDay = isToday(d);

                    // Filter tasks specifically planned for this grid day
                    const dayTasks = tasks.filter(t => t.date === dStr);

                    return (
                      <button
                        key={dStr}
                        onClick={() => { setLocalDate(d); setIsCalendarExpanded(false); }}
                        style={{
                          height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', position: 'relative', cursor: 'pointer', borderRadius: 12,
                          background: isSelected ? '#fff' : 'transparent',
                          border: isTodayDay && !isSelected ? '1.5px solid rgba(255,255,255,0.18)' : 'none',
                          color: isSelected ? '#000' : isTodayDay ? '#fff' : 'rgba(255,255,255,0.8)'
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: isSelected || isTodayDay ? 700 : 500 }}>{d.getDate()}</span>
                        
                        {/* Task category dots under day */}
                        {dayTasks.length > 0 && (
                          <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                            {dayTasks.slice(0, 3).map((t, idx) => {
                              const style = TYPE_COLORS[t.type] || TYPE_COLORS.focus;
                              return (
                                <div key={idx} style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#000' : style.color }} />
                              );
                            })}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="mini-calendar"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              style={{ padding: '16px 12px', display: 'flex', justifyContent: 'space-between' }}
            >
              {miniCalendarDays.map((d, idx) => {
                const dStr = formatDateISO(d);
                const isSelected = dStr === dateStr;
                const isTodayDay = isToday(d);
                const dayTasks = tasks.filter(t => t.date === dStr);

                return (
                  <button
                    key={dStr}
                    onClick={() => setLocalDate(d)}
                    style={{
                      flex: 1, height: 68, margin: '0 4px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                      background: isSelected ? '#fff' : 'rgba(255,255,255,0.02)',
                      border: isTodayDay && !isSelected ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                      color: isSelected ? '#000' : isTodayDay ? '#fff' : 'rgba(255,255,255,0.5)',
                      boxShadow: isSelected ? '0 8px 24px rgba(255,255,255,0.15)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, opacity: isSelected ? 0.6 : 1, letterSpacing: '0.05em' }}>
                      {DAY_NAMES_SHORT[d.getDay()]}
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>{d.getDate()}</span>
                    
                    {dayTasks.length > 0 && (
                      <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                        {dayTasks.slice(0, 3).map((t, i) => (
                          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#000' : (TYPE_COLORS[t.type] || TYPE_COLORS.focus).color }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── VIEW MODE FILTERS Day/Week/Timeline ── */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 100, padding: 4, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content' }}>
        {[
          { id: 'day', label: 'Day View' },
          { id: 'week', label: 'Week View' },
          { id: 'timeline', label: 'Timeline Lane' }
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setViewMode(v.id)}
            style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
              background: viewMode === v.id ? '#fff' : 'transparent',
              color: viewMode === v.id ? '#000' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.15s ease', cursor: 'pointer'
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Add Task Primary Action Button */}
      {!isPast(localDate) && (
        <motion.button
          onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', height: 50, borderRadius: 16, background: '#fff', color: '#000',
            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, marginBottom: 24, cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Add Daily Task
        </motion.button>
      )}

      {/* ── SCHEDULE ACTIVE TASKS CONTAINER ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {dailyTasks.length === 0 ? 'No tasks scheduled' : `${dailyTasks.length} task${dailyTasks.length !== 1 ? 's' : ''}`}
          </p>
          <button
            onClick={onViewHistory}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            History Log
          </button>
        </div>

        {/* ── DAY VIEW RENDERER ── */}
        {viewMode === 'day' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedTasks.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 0', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20, color: 'rgba(255,255,255,0.3)' }}>
                <CalendarDays size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
                <span style={{ fontSize: 12 }}>No entries for today</span>
              </div>
            ) : (
              sortedTasks.map(task => {
                const type = taskTypes.find(t => t.id === task.type) || taskTypes[0];
                const typeStyle = TYPE_COLORS[task.type] || TYPE_COLORS.focus;
                const meta = parseSector(task.sector);
                const Icon = type.icon;

                return (
                  <motion.div
                    key={task.id}
                    layoutId={`task-${task.id}`}
                    style={{
                      background: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 14,
                      border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', opacity: task.done ? 0.6 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Interactive checkbox */}
                      <button
                        onClick={() => {
                          if (task.done) onToggleTask(task.id, 0);
                          else setTaskToComplete(task);
                        }}
                        style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: task.done ? '#10b981' : 'rgba(255,255,255,0.03)',
                          border: task.done ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                      >
                        {task.done && <CheckCircle2 size={14} color="#fff" />}
                      </button>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: task.done ? 'line-through' : 'none' }}>
                            {task.title}
                          </p>
                          {meta.priority === 'high' && (
                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#f43f5e' }} title="High Priority" />
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} /> {task.time}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: typeStyle.bg, color: typeStyle.color }}>
                            {type.label}
                          </span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                            · {meta.category}
                          </span>
                          {meta.repeat !== 'none' && (
                            <Repeat size={10} color="rgba(255,255,255,0.3)" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      {!task.done && (
                        <button
                          onClick={() => { setFocusTask(task); setFocusTimeLeft(task.plannedHours ? task.plannedHours * 3600 : 1500); setFocusActive(true); }}
                          style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Play size={12} color="#818cf8" />
                        </button>
                      )}
                      <button
                        onClick={() => setTaskToReschedule(task)}
                        style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <CalendarCheck size={12} color="rgba(255,255,255,0.5)" />
                      </button>
                      <button
                        onClick={() => { setEditingTask(task); setShowTaskModal(true); }}
                        style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Pencil size={12} color="rgba(255,255,255,0.5)" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} color="rgba(244,63,94,0.7)" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ── WEEK VIEW RENDERER ── */}
        {viewMode === 'week' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Show a 7-day strip where each day has mini list cards */}
            {[0, 1, 2, 3, 4, 5, 6].map(offset => {
              const weekDay = new Date(localDate);
              // Set to monday of current week
              const currentDayOfWeek = localDate.getDay();
              const diff = weekDay.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1) + offset;
              weekDay.setDate(diff);

              const wStr = formatDateISO(weekDay);
              const weekTasks = tasks.filter(t => t.date === wStr);

              return (
                <div key={offset} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 18, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isToday(weekDay) ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                      {weekDay.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric' })}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{weekTasks.length} items</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {weekTasks.length === 0 ? (
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Rest day · No tasks planned</p>
                    ) : (
                      weekTasks.map(t => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.01)', borderRadius: 8 }}>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>{t.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TIMELINE VIEW RENDERER ── */}
        {viewMode === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Morning Lane */}
            <div style={{ borderLeft: '2px solid rgba(99,102,241,0.2)', paddingLeft: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Clock size={14} color="#6366f1" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Morning (6:00 AM - 12:00 PM)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {timelineSegments.morning.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', paddingLeft: 6 }}>Free time slot</p>
                ) : (
                  timelineSegments.morning.map(task => (
                    <div key={task.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 10, fontSize: 13, color: '#fff' }}>
                      <strong>{task.time}</strong> - {task.title}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Afternoon Lane */}
            <div style={{ borderLeft: '2px solid rgba(16,185,129,0.2)', paddingLeft: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Clock size={14} color="#10b981" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Afternoon (12:00 PM - 5:00 PM)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {timelineSegments.afternoon.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', paddingLeft: 6 }}>Free time slot</p>
                ) : (
                  timelineSegments.afternoon.map(task => (
                    <div key={task.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 10, fontSize: 13, color: '#fff' }}>
                      <strong>{task.time}</strong> - {task.title}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Evening Lane */}
            <div style={{ borderLeft: '2px solid rgba(245,158,11,0.2)', paddingLeft: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Clock size={14} color="#f59e0b" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Evening (5:00 PM - 10:00 PM)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {timelineSegments.evening.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', paddingLeft: 6 }}>Free time slot</p>
                ) : (
                  timelineSegments.evening.map(task => (
                    <div key={task.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 10, fontSize: 13, color: '#fff' }}>
                      <strong>{task.time}</strong> - {task.title}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── UPCOMING REMINDERS COMPONENT WIDGET ── */}
      {upcomingReminders.length > 0 && (
        <div style={{ marginTop: 32, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 24, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Bell size={15} color="#fbbf24" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming Reminders</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingReminders.map(rem => (
              <div key={rem.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }} />
                  <span style={{ color: '#fff', fontWeight: 600 }}>{rem.title}</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(rem.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {rem.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DRAG INTERACTION FEEDBACK PLACEHOLDER ── */}
      <div style={{ marginTop: 20, display: 'flex', justify: 'center', alignItems: 'center', gap: 6, opacity: 0.35 }}>
        <BarChart2 size={12} />
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Drag tasks to reorder (Supported)</span>
      </div>

      {/* ── MODALS SECTION ── */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
        onSave={(data) => {
          if (editingTask) onEditTask(editingTask.id, data);
          else onAddTask(data);
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
      
    </div>
  );
};

/* ─── Task Modal ─── */
const TaskModal = ({ isOpen, onClose, onSave, defaultDate, editData }) => {
  const [title, setTitle]               = useState('');
  const [time, setTime]                 = useState('09:00');
  const [date, setDate]                 = useState(defaultDate || getLocalTodayDateString());
  const [type, setType]                 = useState('focus');
  const [plannedHours, setPlannedHours] = useState('');

  // Extensible fields
  const [category, setCategory]         = useState('Work');
  const [priority, setPriority]         = useState('medium');
  const [reminder, setReminder]         = useState('15');
  const [repeat, setRepeat]             = useState('none');

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setTitle(editData.title);
      setTime(editData.time);
      setDate(editData.date);
      setType(editData.type);
      setPlannedHours(editData.plannedHours ? String(editData.plannedHours) : '');

      const parsed = parseSector(editData.sector);
      setCategory(parsed.category);
      setPriority(parsed.priority);
      setReminder(parsed.reminder || '15');
      setRepeat(parsed.repeat || 'none');
    } else {
      setTitle(''); setTime('09:00');
      setDate(defaultDate || getLocalTodayDateString());
      setType('focus'); setPlannedHours('');
      setCategory('Work'); setPriority('medium'); setReminder('15'); setRepeat('none');
    }
  }, [isOpen, defaultDate, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Serialize new parameters inside the standard sector column!
    const serialized = serializeSector(category, priority, reminder, repeat);

    onSave({
      title,
      time,
      date,
      type,
      sector: serialized,
      plannedHours: parseFloat(plannedHours) || 0
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'relative', width: '100%', maxWidth: 450,
              background: '#121214', borderTopLeftRadius: 28, borderTopRightRadius: 28,
              border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none',
              padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 12px))',
              maxHeight: '92vh', overflowY: 'auto', zIndex: 130
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '-10px auto 14px' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{editData ? 'Edit Task' : 'Add Task'}</h2>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Type picker */}
              <div style={{ display: 'flex', gap: 6 }}>
                {taskTypes.map(t => {
                  const Icon = t.icon;
                  const tStyle = TYPE_COLORS[t.id];
                  return (
                    <button
                      type="button" key={t.id}
                      onClick={() => setType(t.id)}
                      style={{
                        flex: 1, height: 50, borderRadius: 12,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                        background: type === t.id ? tStyle.bg : 'rgba(255,255,255,0.02)',
                        border: type === t.id ? `1.5px solid ${tStyle.color}` : '1px solid rgba(255,255,255,0.06)',
                        color: type === t.id ? tStyle.color : 'rgba(255,255,255,0.4)',
                        fontSize: 10, fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      <Icon size={14} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Title input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Task Description</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Analyze portfolio, buy milk, gym..."
                  autoFocus
                  style={{
                    height: 48, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '0 14px', color: '#fff', fontSize: 13, outline: 'none'
                  }}
                />
              </div>

              {/* Category Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Category List</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{
                    height: 48, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '0 14px', color: '#fff', fontSize: 13, outline: 'none'
                  }}
                >
                  {TASK_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} style={{ background: '#121214', color: '#fff' }}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Advanced Controls Group (Priority, Repeat, Reminder) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Priority Level</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    style={{
                      height: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '0 10px', color: '#fff', fontSize: 12, outline: 'none'
                    }}
                  >
                    <option value="low" style={{ background: '#121214' }}>Low Priority</option>
                    <option value="medium" style={{ background: '#121214' }}>Medium Priority</option>
                    <option value="high" style={{ background: '#121214' }}>High Priority 🚨</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Repeat Cycle</label>
                  <select
                    value={repeat}
                    onChange={e => setRepeat(e.target.value)}
                    style={{
                      height: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '0 10px', color: '#fff', fontSize: 12, outline: 'none'
                    }}
                  >
                    <option value="none" style={{ background: '#121214' }}>Don't Repeat</option>
                    <option value="daily" style={{ background: '#121214' }}>Daily</option>
                    <option value="weekly" style={{ background: '#121214' }}>Weekly</option>
                    <option value="monthly" style={{ background: '#121214' }}>Monthly</option>
                  </select>
                </div>
              </div>

              {/* Time Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Reminder Time</label>
                  <select
                    value={reminder}
                    onChange={e => setReminder(e.target.value)}
                    style={{
                      height: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '0 10px', color: '#fff', fontSize: 12, outline: 'none'
                    }}
                  >
                    <option value="0" style={{ background: '#121214' }}>At time of task</option>
                    <option value="5" style={{ background: '#121214' }}>5 mins before</option>
                    <option value="15" style={{ background: '#121214' }}>15 mins before</option>
                    <option value="30" style={{ background: '#121214' }}>30 mins before</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Time Slot</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    style={{
                      height: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, color: '#fff', padding: '0 10px', fontSize: 12, outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Planned Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={plannedHours}
                    onChange={e => setPlannedHours(e.target.value)}
                    placeholder="2.0"
                    style={{
                      height: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, color: '#fff', padding: '0 10px', fontSize: 12, outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Select Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    height: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, color: '#fff', padding: '0 10px', fontSize: 12, outline: 'none'
                  }}
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                style={{
                  height: 50, borderRadius: 16, background: '#fff', color: '#000',
                  fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, cursor: 'pointer', border: 'none', outline: 'none'
                }}
              >
                <CalendarCheck size={16} />
                {editData ? 'Save Changes' : 'Confirm Action'}
              </button>

            </form>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};

/* ─── Actual Hours Modal ─── */
const ActualHoursModal = ({ task, isOpen, onClose, onSave }) => {
  const [hours, setHours] = useState('');
  useEffect(() => { if (isOpen && task) setHours(task.plannedHours ? String(task.plannedHours) : ''); }, [isOpen, task]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'relative', width: '100%', maxWidth: 450,
              background: '#121214', borderTopLeftRadius: 28, borderTopRightRadius: 28,
              border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none',
              padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 12px))', zIndex: 130
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '-10px auto 14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Complete Task</h2>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>How many hours did you actually spend on this task?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Actual Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                  autoFocus
                  style={{
                    height: 48, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '0 14px', color: '#fff', fontSize: 13, outline: 'none'
                  }}
                />
              </div>
              <button
                onClick={() => onSave(parseFloat(hours) || 0)}
                style={{
                  height: 50, borderRadius: 16, background: '#fff', color: '#000',
                  fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, cursor: 'pointer', border: 'none', outline: 'none'
                }}
              >
                <CheckCircle2 size={16} /> Complete Task
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ─── Reschedule Modal ─── */
const RescheduleModal = ({ task, isOpen, onClose, onSave }) => {
  if (!task) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'relative', width: '100%', maxWidth: 450,
              background: '#121214', borderTopLeftRadius: 28, borderTopRightRadius: 28,
              border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none',
              padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 12px))', zIndex: 130
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '-10px auto 14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Reschedule Task</h2>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ lineHeight: 1.5, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                Move <strong style={{ color: '#fff' }}>{task.title}</strong> to tomorrow at {task.time}?
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={onSave}
                  style={{
                    flex: 1, height: 48, borderRadius: 12, background: '#fff', color: '#000',
                    fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, cursor: 'pointer', border: 'none'
                  }}
                >
                  <CalendarCheck size={14} /> Reschedule
                </button>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)', color: '#fff',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TimetableModule;
