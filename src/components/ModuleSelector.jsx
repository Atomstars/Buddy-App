import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, CalendarDays, ChevronRight, ListTodo } from 'lucide-react';

const ModuleSelector = ({ onSelect, userProfile }) => {
  const modules = [
    {
      id: 'budget',
      title: 'Budget Buddy',
      subtitle: 'Finance & Savings',
      icon: IndianRupee,
      color: 'var(--blue)',
      description: 'Track expenses, set goals, and manage your monthly budget.',
    },
    {
      id: 'timetable',
      title: 'Daily Schedule',
      subtitle: 'Routine & Focus',
      icon: CalendarDays,
      color: '#7c3aed',
      description: 'Plan your day, set reminders, and stay on track with your routine.',
    },
    {
      id: 'lists',
      title: 'My List',
      subtitle: 'Manifestation & Goals',
      icon: ListTodo,
      color: '#10b981',
      description: 'Track your life goals, purchases, and lifestyle manifestations.',
    },
  ];

  return (
    <motion.div 
      className="selector-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="selector-header">
        <p className="eyebrow">Welcome back</p>
        <h1>{userProfile?.name || 'Buddy'}</h1>
        <p className="subtitle">Where would you like to start today?</p>
      </header>

      <div className="module-grid">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <motion.button
              key={mod.id}
              className="module-card"
              onClick={() => onSelect(mod.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="module-card-icon" style={{ backgroundColor: mod.color }}>
                <Icon size={32} color="white" />
              </div>
              <div className="module-card-content">
                <p className="module-subtitle">{mod.subtitle}</p>
                <h3>{mod.title}</h3>
                <p className="module-description">{mod.description}</p>
              </div>
              <div className="module-card-arrow">
                <ChevronRight size={24} />
              </div>
            </motion.button>
          );
        })}
      </div>

      <footer className="selector-footer">
        <p>Logged in as <strong>{userProfile?.name || 'Guest User'}</strong></p>
        <button className="text-button">Switch Profile</button>
      </footer>
    </motion.div>
  );
};

export default ModuleSelector;
