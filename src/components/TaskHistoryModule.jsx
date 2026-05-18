import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Target, IndianRupee, CalendarCheck, Sparkles, History, ArrowLeft } from 'lucide-react';
import { IconButton } from './common';
import { formatDate } from '../utils/dateUtils';

const taskTypes = [
  { id: 'focus', label: 'Focus', icon: Target, color: '#3498db' },
  { id: 'money', label: 'Money', icon: IndianRupee, color: '#2ecc71' },
  { id: 'reminder', label: 'Reminder', icon: CalendarCheck, color: '#f1c40f' },
  { id: 'fun', label: 'Fun', icon: Sparkles, color: '#9b59b6' },
];

export const TaskHistoryModule = ({ tasks, onBack }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'focus', etc.

  // Only consider done tasks for history
  const completedTasks = useMemo(() => tasks.filter(t => t.done), [tasks]);

  const filteredTasks = useMemo(() => {
    let result = [...completedTasks];
    if (filter !== 'all') {
      result = result.filter(t => t.type === filter);
    }
    // Sort descending by date, then time
    return result.sort((a, b) => {
      if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
      return b.time.localeCompare(a.time);
    });
  }, [completedTasks, filter]);

  const analyticsData = useMemo(() => {
    const counts = {};
    completedTasks.forEach(t => {
      counts[t.type] = (counts[t.type] || 0) + 1;
    });
    return taskTypes.map(type => ({
      name: type.label,
      value: counts[type.id] || 0,
      color: type.color
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [completedTasks]);

  return (
    <motion.div className="module-stack" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <IconButton onClick={onBack} label="Back to schedule">
          <ArrowLeft size={20} />
        </IconButton>
        <div>
          <p className="eyebrow">Productivity</p>
          <h2>Task History</h2>
        </div>
      </div>

      <section className="section-block" style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h3>Completion Analytics</h3>
          <p className="text-muted" style={{ marginBottom: '16px' }}>Total tasks completed: {completedTasks.length}</p>
          <div style={{ height: '220px', width: '100%' }}>
            {analyticsData.length === 0 ? (
              <div className="empty-state">No completed tasks yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {analyticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--panel)', color: 'var(--ink)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '16px' }}>Filter Log</h3>
          <div className="segmented-control compact" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px' }}>
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
            {taskTypes.map(type => (
              <button 
                key={type.id} 
                className={filter === type.id ? 'active' : ''} 
                onClick={() => setFilter(type.id)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-title">
          <h3>Log</h3>
          <span>{filteredTasks.length} entries</span>
        </div>
        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <History size={32} />
              <strong>No history found</strong>
            </div>
          ) : (
            filteredTasks.map(task => {
              const type = taskTypes.find(t => t.id === task.type) || taskTypes[0];
              const Icon = type.icon;
              return (
                <article className="task-item done" key={task.id} style={{ cursor: 'default' }}>
                  <div className="task-main">
                    <span className="task-time" style={{ opacity: 0.6 }}>{task.time}</span>
                    <span className="task-icon" style={{ background: type.color + '20', color: type.color }}>
                      <Icon size={18} />
                    </span>
                    <span>
                      <strong>{task.title}</strong>
                      <small>{formatDate(new Date(task.date))} • {task.hours > 0 ? `${task.hours}h tracked` : 'Done'}</small>
                    </span>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </motion.div>
  );
};
