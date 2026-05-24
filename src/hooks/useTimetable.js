import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getLocalTodayDateString } from '../utils/dateUtils';

export const useTimetable = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('timetable_tasks').select('*');
    if (error) {
      console.error(error);
    } else {
      // Convert snake_case from DB to camelCase for frontend
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
        createdAt: task.created_at
      }));
      setTasks(formatted.sort((a, b) => (a.time || '').localeCompare(b.time || '')));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (task) => {
    const newTask = {
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
        [
          {
            id: dbTask.id,
            title: dbTask.title,
            time: dbTask.time,
            date: dbTask.date,
            type: dbTask.type,
            sector: dbTask.sector,
            plannedHours: dbTask.planned_hours,
            actualHours: dbTask.actual_hours,
            done: dbTask.done,
            createdAt: dbTask.created_at
          },
          ...current,
        ].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      );
    }
  };

  const toggleTask = async (id, actualHours = 0) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newDone = !task.done;
    const newActual = newDone ? actualHours : 0;
    
    const { error } = await supabase.from('timetable_tasks')
      .update({ done: newDone, actual_hours: newActual })
      .eq('id', id);
      
    if (!error) {
      setTasks((current) => current.map((t) => (t.id === id ? { ...t, done: newDone, actualHours: newActual } : t)));
    }
  };

  const editTask = async (id, updates) => {
    const dbUpdates = {
      title: updates.title,
      time: updates.time,
      date: updates.date,
      type: updates.type,
      sector: updates.sector,
      planned_hours: updates.plannedHours,
    };
    // Clean undefined
    Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);

    const { error } = await supabase.from('timetable_tasks').update(dbUpdates).eq('id', id);
    if (!error) {
      setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...updates } : task)));
    }
  };

  const removeTask = async (id) => {
    const { error } = await supabase.from('timetable_tasks').delete().eq('id', id);
    if (!error) {
      setTasks((current) => current.filter((task) => task.id !== id));
    }
  };

  const rescheduleTaskToNextDay = async (id) => {
    const taskToReschedule = tasks.find(t => t.id === id);
    if (!taskToReschedule) return;
      
    const currentDate = new Date(taskToReschedule.date);
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDateStr = currentDate.toISOString().split('T')[0];

    const newTask = {
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
      // Also delete the old one if desired, or keep it as undone. The current local code deletes it.
      await supabase.from('timetable_tasks').delete().eq('id', id);
      
      const dbTask = data[0];
      setTasks((current) => [
        {
          id: dbTask.id,
          title: dbTask.title,
          time: dbTask.time,
          date: dbTask.date,
          type: dbTask.type,
          sector: dbTask.sector,
          plannedHours: dbTask.planned_hours,
          actualHours: dbTask.actual_hours,
          done: dbTask.done,
          createdAt: dbTask.created_at
        },
        ...current.filter(t => t.id !== id)
      ].sort((a, b) => (a.time || '').localeCompare(b.time || '')));
    }
  };

  return { tasks, loading, addTask, toggleTask, editTask, removeTask, rescheduleTaskToNextDay };
};

export default useTimetable;
