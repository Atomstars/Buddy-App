import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getLocalTodayDateString } from '../utils/dateUtils';

/**
 * useTimetable — per-user task management.
 * @param {string|null} userId
 */
export const useTimetable = (userId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('timetable_tasks')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error(error);
    } else {
      const formatted = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        time: task.time,
        date: task.date,
        type: task.type,
        sector: task.sector,
        plannedHours: task.planned_hours,
        actualHours: task.actual_hours,
        done: task.done,
        createdAt: task.created_at,
      }));
      setTasks(formatted.sort((a, b) => (a.time || '').localeCompare(b.time || '')));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (task) => {
    if (!userId) return;
    const newTask = {
      user_id: userId,
      title: task.title.trim(),
      time: task.time,
      date: task.date || getLocalTodayDateString(),
      type: task.type,
      sector: task.sector || 'general',
      planned_hours: parseFloat(task.plannedHours) || 0,
      actual_hours: 0,
      done: false,
    };

    const { data, error } = await supabase.from('timetable_tasks').insert([newTask]).select();
    if (!error && data) {
      const dbTask = data[0];
      setTasks((current) =>
        [{
          id: dbTask.id,
          title: dbTask.title,
          time: dbTask.time,
          date: dbTask.date,
          type: dbTask.type,
          sector: dbTask.sector,
          plannedHours: dbTask.planned_hours,
          actualHours: dbTask.actual_hours,
          done: dbTask.done,
          createdAt: dbTask.created_at,
        }, ...current].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      );
    }
  }, [userId]);

  const toggleTask = useCallback(async (id, actualHours = 0) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !userId) return;
    const newDone = !task.done;
    const newActual = newDone ? actualHours : 0;
    const { error } = await supabase.from('timetable_tasks')
      .update({ done: newDone, actual_hours: newActual })
      .eq('id', id)
      .eq('user_id', userId);
    if (!error) {
      setTasks((current) => current.map(t => t.id === id ? { ...t, done: newDone, actualHours: newActual } : t));
    }
  }, [tasks, userId]);

  const editTask = useCallback(async (id, updates) => {
    if (!userId) return;
    const dbUpdates = {
      title: updates.title,
      time: updates.time,
      date: updates.date,
      type: updates.type,
      sector: updates.sector,
      planned_hours: updates.plannedHours,
    };
    Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);
    const { error } = await supabase.from('timetable_tasks').update(dbUpdates).eq('id', id).eq('user_id', userId);
    if (!error) {
      setTasks((current) => current.map(task => task.id === id ? { ...task, ...updates } : task));
    }
  }, [userId]);

  const removeTask = useCallback(async (id) => {
    if (!userId) return;
    const { error } = await supabase.from('timetable_tasks').delete().eq('id', id).eq('user_id', userId);
    if (!error) setTasks((current) => current.filter(task => task.id !== id));
  }, [userId]);

  const rescheduleTaskToNextDay = useCallback(async (id) => {
    if (!userId) return;
    const taskToReschedule = tasks.find(t => t.id === id);
    if (!taskToReschedule) return;
    const currentDate = new Date(taskToReschedule.date);
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDateStr = currentDate.toISOString().split('T')[0];
    const newTask = {
      user_id: userId,
      title: taskToReschedule.title,
      time: taskToReschedule.time,
      date: nextDateStr,
      type: taskToReschedule.type,
      sector: taskToReschedule.sector,
      planned_hours: taskToReschedule.plannedHours,
      actual_hours: 0,
      done: false,
    };
    const { data, error } = await supabase.from('timetable_tasks').insert([newTask]).select();
    if (!error && data) {
      await supabase.from('timetable_tasks').delete().eq('id', id).eq('user_id', userId);
      const dbTask = data[0];
      setTasks((current) => [{
        id: dbTask.id, title: dbTask.title, time: dbTask.time, date: dbTask.date,
        type: dbTask.type, sector: dbTask.sector, plannedHours: dbTask.planned_hours,
        actualHours: dbTask.actual_hours, done: dbTask.done, createdAt: dbTask.created_at,
      }, ...current.filter(t => t.id !== id)].sort((a, b) => (a.time || '').localeCompare(b.time || '')));
    }
  }, [tasks, userId]);

  return { tasks, loading, addTask, toggleTask, editTask, removeTask, rescheduleTaskToNextDay };
};

export default useTimetable;
