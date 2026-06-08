import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * useManifest — per-user life goals + a single north-star vision statement.
 * @param {string|null} userId
 */
export const useManifest = (userId) => {
  const [goals, setGoals] = useState([]);
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const [{ data: g, error: ge }, { data: v }] = await Promise.all([
      supabase.from('life_goals').select('*').eq('user_id', userId).order('is_pinned', { ascending: false }).order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('manifest_vision').select('statement').eq('user_id', userId).maybeSingle(),
    ]);
    if (ge) console.warn('useManifest fetch (run the life_goals migration?):', ge.message);
    else setGoals(g || []);
    setVision(v?.statement || '');
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addGoal = useCallback(async (goal) => {
    if (!userId) return;
    const row = {
      user_id: userId,
      title: goal.title.trim(),
      description: goal.description || '',
      category: goal.category || 'personal',
      target_date: goal.target_date || null,
      progress: goal.progress || 0,
      milestones: goal.milestones || [],
      status: 'active',
    };
    const { data, error } = await supabase.from('life_goals').insert([row]).select();
    if (!error && data) setGoals((cur) => [data[0], ...cur]);
  }, [userId]);

  const updateGoal = useCallback(async (id, updates) => {
    if (!userId) return;
    const payload = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('life_goals').update(payload).eq('id', id).eq('user_id', userId).select();
    if (!error && data) setGoals((cur) => cur.map((g) => (g.id === id ? data[0] : g)));
  }, [userId]);

  const removeGoal = useCallback(async (id) => {
    if (!userId) return;
    const { error } = await supabase.from('life_goals').delete().eq('id', id).eq('user_id', userId);
    if (!error) setGoals((cur) => cur.filter((g) => g.id !== id));
  }, [userId]);

  const toggleMilestone = useCallback(async (goalId, index) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const milestones = (goal.milestones || []).map((m, i) => (i === index ? { ...m, done: !m.done } : m));
    const doneCount = milestones.filter((m) => m.done).length;
    const progress = milestones.length ? Math.round((doneCount / milestones.length) * 100) : goal.progress;
    await updateGoal(goalId, { milestones, progress, status: progress >= 100 ? 'done' : 'active' });
  }, [goals, updateGoal]);

  const saveVision = useCallback(async (statement) => {
    if (!userId) return;
    setVision(statement);
    const { error } = await supabase.from('manifest_vision').upsert({ user_id: userId, statement, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) console.warn('saveVision:', error.message);
  }, [userId]);

  return { goals, vision, loading, addGoal, updateGoal, removeGoal, toggleMilestone, saveVision, refetch: fetchAll };
};

export default useManifest;
