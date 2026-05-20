import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, CalendarCheck, Sparkles, TrendingUp, Settings, Moon, Sun } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const ServiceHub = ({
  userName,
  onSelectService,
  theme,
  toggleTheme,
  onSettings,
  todayStats,
  weeklyStats,
  todayTasks,
  lists,
}) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const completedTasks = todayTasks.filter(t => t.done).length;
  const totalTasks = todayTasks.length;

  const totalVisions = lists.length;
  const completedVisions = lists.reduce((acc, list) => {
    const isDone = list.items.length > 0 && list.items.every(item => item.done);
    return acc + (isDone ? 1 : 0);
  }, 0);

  return (
    <div className="hub-container">
      <header className="hub-header">
        <div className="hub-header-left">
          <div className="hub-avatar">{userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
          <div>
            <p className="hub-greeting">{greeting},</p>
            <h1 className="hub-name">{userName || 'User'}</h1>
          </div>
        </div>
        <div className="hub-header-right">
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn-icon" onClick={onSettings} aria-label="Settings">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <motion.div 
        className="hub-content"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <p className="hub-section-title">Your Modules</p>

        {/* Budget Module */}
        <motion.div 
          className="hub-card hub-card-budget"
          variants={item}
          onClick={() => onSelectService('budget')}
        >
          <div className="hub-card-bg-gradient" />
          <div className="hub-card-header">
            <div className="hub-card-icon"><IndianRupee size={24} /></div>
            <h2 className="hub-card-title">Budget Tracker</h2>
          </div>
          <div className="hub-card-body">
            <div className="hub-stat-group">
              <span className="hub-stat-label">Today's Spend</span>
              <span className="hub-stat-value">{formatCurrency(todayStats.total)}</span>
            </div>
            <div className="hub-stat-group align-right">
              <span className="hub-stat-label">Week's Budget</span>
              <span className="hub-stat-value">{formatCurrency(weeklyStats.totalBudget)}</span>
            </div>
          </div>
        </motion.div>

        {/* AI Investing Module (New) */}
        <motion.div 
          className="hub-card hub-card-investing"
          variants={item}
          onClick={() => onSelectService('investing')}
        >
          <div className="hub-card-bg-gradient" />
          <div className="hub-badge-premium">PREMIUM AI</div>
          <div className="hub-card-header">
            <div className="hub-card-icon"><TrendingUp size={24} /></div>
            <h2 className="hub-card-title">AI Investing</h2>
          </div>
          <div className="hub-card-body">
            <p className="hub-card-desc">Smart insights & portfolio planning driven by your spending habits.</p>
          </div>
        </motion.div>

        {/* Schedule Module */}
        <motion.div 
          className="hub-card hub-card-schedule"
          variants={item}
          onClick={() => onSelectService('schedule')}
        >
          <div className="hub-card-bg-gradient" />
          <div className="hub-card-header">
            <div className="hub-card-icon"><CalendarCheck size={24} /></div>
            <h2 className="hub-card-title">Schedule & Productivity</h2>
          </div>
          <div className="hub-card-body">
             <div className="hub-stat-group">
              <span className="hub-stat-label">Tasks Today</span>
              <span className="hub-stat-value">{completedTasks} / {totalTasks}</span>
            </div>
          </div>
        </motion.div>

        {/* Manifest Module */}
        <motion.div 
          className="hub-card hub-card-manifest"
          variants={item}
          onClick={() => onSelectService('manifest')}
        >
          <div className="hub-card-bg-gradient" />
          <div className="hub-card-header">
            <div className="hub-card-icon"><Sparkles size={24} /></div>
            <h2 className="hub-card-title">Vision Board</h2>
          </div>
          <div className="hub-card-body">
             <div className="hub-stat-group">
              <span className="hub-stat-label">Active Visions</span>
              <span className="hub-stat-value">{totalVisions}</span>
            </div>
            <div className="hub-stat-group align-right">
              <span className="hub-stat-label">Completed</span>
              <span className="hub-stat-value">{completedVisions}</span>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};
