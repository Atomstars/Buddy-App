import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Settings, ShieldCheck, Moon, Sun, Apple } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import { moduleLabels, viewLabels } from '../utils/assistantLogic';
import { IconButton } from './common';

export const AppHeader = ({ activeModule, setActiveModule, onSettings, theme, toggleTheme }) => (
  <header className="app-header">
    <div>
      <p className="eyebrow">Personal Assistant</p>
      <h1>Budget Buddy</h1>
      <p className="date-line">{formatDate(new Date())}</p>
    </div>
    <div className="header-actions">
      <div className="module-switch" aria-label="Assistant module">
        {Object.entries(moduleLabels).map(([id, label]) => (
          <button key={id} className={activeModule === id ? 'active' : ''} onClick={() => setActiveModule(id)}>
            {label}
          </button>
        ))}
      </div>

      <IconButton label="Toggle Theme" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </IconButton>
      <IconButton label="Settings" onClick={onSettings}>
        <Settings size={20} />
      </IconButton>
    </div>
  </header>
);

export const AlertDeck = ({ coach, todayStats, zeroDayStreak, onNoSpend, activeModule, setActiveModule }) => {
  const CoachIcon = coach.icon;
  const alertCards = [
    {
      id: 'alert',
      label: coach.title,
      value: coach.nudge,
      icon: CoachIcon,
      tone: coach.tone,
      onClick: () => setActiveModule('budget'),
    },
    {
      id: 'zero-day',
      label: 'ZERO DAY',
      value: zeroDayStreak.active 
        ? `Streak active! ${zeroDayStreak.streak} days` 
        : 'Aim for a clean day today',
      icon: Flame,
      tone: zeroDayStreak.active ? 'win' : 'quiet',
      className: zeroDayStreak.active ? 'streak-active-glitch' : '',
      onClick: onNoSpend,
    },
    {
      id: 'no-spend',
      label: todayStats.noSpendMarked ? 'No-spend marked' : 'No spend today',
      value: todayStats.count > 0 ? `${todayStats.count} expense logs today` : 'Tap to mark a clean day',
      icon: Check,
      tone: todayStats.noSpendMarked ? 'win' : 'quiet',
      onClick: onNoSpend,
    },
    {
      id: 'budget-health',
      label: 'Budget context',
      value: `₹${Math.round(coach.safeWeekly)}/day limit`,
      icon: ShieldCheck,
      tone: 'steady',
      onClick: () => setActiveModule('budget'),
    },
  ];

  return (
    <section className="alert-deck" aria-label="Top assistant alerts">
      {alertCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.button
            key={card.id}
            className={`alert-card tone-${card.tone}`}
            onClick={card.onClick}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
          >
            <span className="alert-icon">
              <Icon size={18} />
            </span>
            <span>
              <strong>{card.label}</strong>
              <small>{card.value}</small>
            </span>
          </motion.button>
        );
      })}
    </section>
  );
};

export const AssistantHero = ({ coach, todayStats, weeklyStats, monthlyStats, tasks }) => {
  const monthProjectedDelta = coach.monthProjection - monthlyStats.totalBudget;
  const doneTasks = tasks.filter((task) => task.done).length;

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
        <div>
          <span>Today spent</span>
          <strong>{formatCurrency(todayStats.total)}</strong>
        </div>
        <div>
          <span>Month left</span>
          <strong>{formatCurrency(Math.max(0, monthlyStats.remaining))}</strong>
        </div>
        <div>
          <span>Month pace</span>
          <strong>{formatCurrency(coach.monthProjection)}</strong>
          <small className={monthProjectedDelta > 0 ? 'danger-text' : 'success-text'}>
            {monthProjectedDelta > 0 ? 'over projection' : 'under projection'}
          </small>
        </div>
        <div>
          <span>Timetable</span>
          <strong>{doneTasks}/{tasks.length}</strong>
          <small>done today</small>
        </div>
      </div>
    </section>
  );
};
