import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Settings, ShieldCheck, Moon, Sun, Apple, ChevronLeft, Target, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import { moduleLabels, viewLabels } from '../utils/assistantLogic';
import { IconButton } from './common';
import { formatDateISO, isToday } from '../utils/dateUtils';

export const AppHeader = ({ activeModule, onBack, onSettings, theme, toggleTheme, selectedDate, onDateSelect }) => (
  <header className="app-header">
    <div className="header-main">
      <div className="header-left">
        <IconButton label="Back to Selector" onClick={onBack}>
          <ChevronLeft size={24} />
        </IconButton>
        <div>
          <p className="eyebrow">{moduleLabels[activeModule] || 'Module'}</p>
          <h1>Budget Buddy</h1>
        </div>
      </div>
      <div className="header-actions">
        <IconButton label="Toggle Theme" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
        <IconButton label="Settings" onClick={onSettings}>
          <Settings size={20} />
        </IconButton>
      </div>
    </div>
    
    <DateSelectionBar selectedDate={selectedDate} onDateSelect={onDateSelect} />
  </header>
);

const DateSelectionBar = ({ selectedDate, onDateSelect }) => {
  const dates = React.useMemo(() => {
    const list = [];
    for (let i = -14; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  const activeRef = React.useRef(null);

  React.useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate]);

  return (
    <div className="date-selection-container">
      <div className="date-selection-scroll">
        {dates.map((date) => {
          const isSelected = formatDateISO(date) === formatDateISO(selectedDate);
          const current = isToday(date);
          return (
            <button
              key={formatDateISO(date)}
              ref={isSelected ? activeRef : null}
              className={`date-pill ${isSelected ? 'active' : ''} ${current ? 'is-today' : ''}`}
              onClick={() => onDateSelect(date)}
            >
              <span className="day-name">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
              <span className="day-number">{date.getDate()}</span>
              {current && <div className="today-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const AlertDeck = ({ zeroDayStreak, coach, setActiveModule }) => {
  const alertCards = [
    {
      id: 'zero-day',
      label: 'STREAK',
      value: zeroDayStreak.active 
        ? `${zeroDayStreak.streak} Days` 
        : '0 Days',
      icon: Flame,
      tone: zeroDayStreak.active ? 'win' : 'quiet',
      className: zeroDayStreak.active ? 'streak-active-glitch' : '',
      onClick: () => setActiveModule('budget'),
    },
    {
      id: 'budget-health',
      label: 'LIMIT',
      value: `₹${Math.round(coach.safeWeekly)}/d`,
      icon: ShieldCheck,
      tone: 'steady',
      onClick: () => setActiveModule('budget'),
    },
  ];

  return (
    <section className="alert-deck" aria-label="Top assistant alerts">
      <div className="alert-grid-compact two-cols">
        {alertCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              className={`alert-pill tone-${card.tone} ${card.className || ''}`}
              onClick={card.onClick}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Icon size={16} />
              <div className="alert-pill-content">
                <strong>{card.label}</strong>
                <small>{card.value}</small>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export const AssistantHero = ({ coach, todayStats, weeklyStats, monthlyStats, tasks, mode }) => {
  const monthProjectedDelta = coach.monthProjection - monthlyStats.totalBudget;
  const doneTasks = tasks.filter((task) => task.done).length;

  const budgetMetrics = [
    { label: 'Today spent', value: formatCurrency(todayStats.total) },
    { label: 'Month left', value: formatCurrency(Math.max(0, monthlyStats.remaining)) },
    { 
      label: 'Month pace', 
      value: formatCurrency(coach.monthProjection),
      sub: monthProjectedDelta > 0 ? 'over projection' : 'under projection',
      subClass: monthProjectedDelta > 0 ? 'danger-text' : 'success-text'
    }
  ];

  const timetableMetrics = [
    { label: 'Tasks done', value: `${doneTasks}/${tasks.length}` },
    { label: 'Next up', value: coach.nextTask ? coach.nextTask.title : 'All clear' },
    { label: 'Status', value: tasks.length === 0 ? 'No schedule' : (doneTasks === tasks.length ? 'Finished' : 'In progress') }
  ];

  const activeMetrics = mode === 'budget' ? budgetMetrics : timetableMetrics;

  return (
    <section className={`assistant-hero tone-${coach.tone}`}>
      <div className="hero-orbit" aria-hidden="true">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }} />
      </div>
      <div className="assistant-copy">
        <p className="eyebrow">Command centre</p>
        <h2>{coach.title}</h2>
        <p>{coach.nudge}</p>
      </div>
      <div className="hero-metrics">
        {activeMetrics.map((metric, i) => (
          <div key={i}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {metric.sub && <small className={metric.subClass}>{metric.sub}</small>}
          </div>
        ))}
      </div>
    </section>
  );
};
