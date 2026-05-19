import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Target, IndianRupee, CalendarCheck, Sparkles, History, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const taskTypes = [
  { id: 'focus', label: 'Focus', icon: Target, color: '#818cf8' },
  { id: 'money', label: 'Money', icon: IndianRupee, color: '#34d399' },
  { id: 'reminder', label: 'Reminder', icon: CalendarCheck, color: '#fbbf24' },
  { id: 'fun', label: 'Fun', icon: Sparkles, color: '#a78bfa' },
];

const tooltipStyle = {
  borderRadius: 14,
  border: 'none',
  background: '#18181b',
  color: '#fafafa',
  boxShadow: '0 8px 32px rgba(0,0,0,.45)',
  fontSize: '0.82rem',
  padding: '10px 14px',
};

export const TaskHistoryModule = ({ tasks, onBack }) => {
  const [filter, setFilter] = useState('all');

  const completedTasks = useMemo(() => tasks.filter(t => t.done), [tasks]);

  const filteredTasks = useMemo(() => {
    let result = [...completedTasks];
    if (filter !== 'all') {
      result = result.filter(t => t.type === filter);
    }
    return result.sort((a, b) => {
      if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
      return b.time.localeCompare(a.time);
    });
  }, [completedTasks, filter]);

  // Group by date for timeline display
  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredTasks.forEach(task => {
      if (!groups[task.date]) groups[task.date] = [];
      groups[task.date].push(task);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a));
  }, [filteredTasks]);

  const analyticsData = useMemo(() => {
    const counts = {};
    completedTasks.forEach(t => {
      counts[t.type] = (counts[t.type] || 0) + 1;
    });
    return taskTypes.map(type => ({
      name: type.label,
      value: counts[type.id] || 0,
      color: type.color,
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [completedTasks]);

  const totalHours = useMemo(() => {
    return completedTasks.reduce((sum, t) => sum + (t.hours || 0), 0);
  }, [completedTasks]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn-icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="section-eyebrow">Productivity</p>
          <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Task History</h2>
        </div>
      </div>

      {/* Stats row */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="stat-pill">
            <CheckCircle2 size={14} />
            <div>
              <span className="stat-label">Completed</span>
              <span className="stat-value">{completedTasks.length}</span>
            </div>
          </div>
          <div className="stat-pill">
            <Clock size={14} />
            <div>
              <span className="stat-label">Hours</span>
              <span className="stat-value">{totalHours.toFixed(1)}h</span>
            </div>
          </div>
          {analyticsData.length > 0 && (
            <div className="stat-pill">
              <Target size={14} />
              <div>
                <span className="stat-label">Top Type</span>
                <span className="stat-value">{analyticsData[0].name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics + Filter row */}
      <div className="surface-card" style={{ padding: 20 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <h3 className="section-title" style={{ fontSize: '1rem' }}>Completion Analytics</h3>
        </div>

        {/* Chart */}
        <div style={{ height: 200, width: '100%', marginBottom: 16 }}>
          {analyticsData.length === 0 ? (
            <div className="empty-state">
              <History size={28} />
              <strong>No completed tasks yet</strong>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  animationDuration={600}
                >
                  {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        {analyticsData.length > 0 && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            {analyticsData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="seg-tabs">
          <button className={`seg-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {taskTypes.map(type => (
            <button
              key={type.id}
              className={`seg-tab ${filter === type.id ? 'active' : ''}`}
              onClick={() => setFilter(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* History timeline */}
      <div className="surface-card" style={{ padding: 20 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <h3 className="section-title" style={{ fontSize: '1rem' }}>Log</h3>
          <span className="section-badge">{filteredTasks.length} entries</span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <History size={32} />
            <strong>No history found</strong>
          </div>
        ) : (
          <div className="timeline">
            {groupedByDate.map(([date, dateTasks]) => (
              <React.Fragment key={date}>
                {/* Date header as timeline item */}
                <div className="timeline-item">
                  <div className="timeline-marker done" />
                  <div className="timeline-content">
                    <span className="timeline-time" style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                      {formatDate(new Date(date))}
                    </span>
                  </div>
                </div>
                {dateTasks.map(task => {
                  const type = taskTypes.find(t => t.id === task.type) || taskTypes[0];
                  const Icon = type.icon;
                  return (
                    <div className="timeline-item" key={task.id}>
                      <div className="timeline-marker done" style={{ borderColor: type.color, background: `${type.color}30` }} />
                      <div className="timeline-content">
                        <span className="timeline-time">{task.time}</span>
                        <span className="timeline-title">{task.title}</span>
                        <span className="timeline-subtitle">
                          {task.hours > 0 ? `${task.hours}h tracked` : 'Done'} · {type.label}
                          {task.sector ? ` · ${task.sector}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
