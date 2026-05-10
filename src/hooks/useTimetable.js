import { useEffect, useState } from 'react';
import { getLocalTodayDateString } from '../utils/dateUtils';

const TASK_STORAGE_KEY = 'personal-assistant-timetable';

const defaultTasks = [
  { id: 'sample-1', title: 'Plan today in 5 minutes', time: '09:00', date: getLocalTodayDateString(), type: 'focus', done: false, createdAt: 1 },
  { id: 'sample-2', title: 'Log evening expenses', time: '21:00', date: getLocalTodayDateString(), type: 'money', done: false, createdAt: 2 },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const readTasks = () => {
  try {
    const saved = window.localStorage.getItem(TASK_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    if (Array.isArray(parsed)) {
      const today = getLocalTodayDateString();
      return parsed.map(task => ({
        ...task,
        date: task.date || today
      }));
    }
    return defaultTasks;
  } catch {
    return defaultTasks;
  }
};

export const useTimetable = () => {
  const [tasks, setTasks] = useState(readTasks);

  useEffect(() => {
    try {
      window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Timetable remains usable for this session.
    }
  }, [tasks]);

  const addTask = (task) => {
    setTasks((current) =>
      [
        {
          id: generateId(),
          title: task.title.trim(),
          time: task.time,
          date: task.date || getLocalTodayDateString(),
          type: task.type,
          done: false,
          createdAt: Date.now(),
        },
        ...current,
      ].sort((a, b) => a.time.localeCompare(b.time))
    );
  };

  const toggleTask = (id) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const editTask = (id, updates) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...updates } : task)));
  };

  const removeTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  return { tasks, addTask, toggleTask, editTask, removeTask };
};

export default useTimetable;
